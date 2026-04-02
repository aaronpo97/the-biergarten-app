#include <algorithm>
#include <filesystem>
#include <iostream>
#include <memory>
#include <unordered_map>
#include <vector>

#include <boost/program_options.hpp>
#include <spdlog/spdlog.h>

#include "curl_web_client.h"
#include "data_downloader.h"
#include "data_generator.h"
#include "database.h"
#include "json_loader.h"
#include "llama_generator.h"
#include "mock_generator.h"
#include "wikipedia_service.h"

namespace po = boost::program_options;

int main(int argc, char *argv[]) {
  try {
    const CurlGlobalState curl_state;

    po::options_description desc("Pipeline Options");
    desc.add_options()("help,h", "Produce help message")(
        "model,m", po::value<std::string>()->default_value(""),
        "Path to LLM model (gguf)")(
        "cache-dir,c", po::value<std::string>()->default_value("/tmp"),
        "Directory for cached JSON")(
        "temperature", po::value<float>()->default_value(0.8f),
        "Sampling temperature (higher = more random)")(
        "top-p", po::value<float>()->default_value(0.92f),
        "Nucleus sampling top-p in (0,1] (higher = more random)")(
        "seed", po::value<int>()->default_value(-1),
        "Sampler seed: -1 for random, otherwise non-negative integer")(
        "commit", po::value<std::string>()->default_value("c5eb7772"),
        "Git commit hash for DB consistency");

    po::variables_map vm;
    po::store(po::parse_command_line(argc, argv, desc), vm);
    po::notify(vm);

    if (vm.count("help")) {
      std::cout << desc << "\n";
      return 0;
    }

    std::string modelPath = vm["model"].as<std::string>();
    std::string cacheDir = vm["cache-dir"].as<std::string>();
    float temperature = vm["temperature"].as<float>();
    float topP = vm["top-p"].as<float>();
    int seed = vm["seed"].as<int>();
    std::string commit = vm["commit"].as<std::string>();

    std::string jsonPath = cacheDir + "/countries+states+cities.json";
    std::string dbPath = cacheDir + "/biergarten-pipeline.db";

    bool hasJsonCache = std::filesystem::exists(jsonPath);
    bool hasDbCache = std::filesystem::exists(dbPath);

    auto webClient = std::make_shared<CURLWebClient>();

    SqliteDatabase db;

    spdlog::info("Initializing SQLite database at {}...", dbPath);
    db.Initialize(dbPath);

    if (hasDbCache && hasJsonCache) {
      spdlog::info("[Pipeline] Cache hit: skipping download and parse");
    } else {
      spdlog::info("\n[Pipeline] Downloading geographic data from GitHub...");
      DataDownloader downloader(webClient);
      downloader.DownloadCountriesDatabase(jsonPath, commit);

      JsonLoader::LoadWorldCities(jsonPath, db);
    }

    spdlog::info("Initializing brewery generator...");
    std::unique_ptr<IDataGenerator> generator;
    if (modelPath.empty()) {
      generator = std::make_unique<MockGenerator>();
      spdlog::info("[Generator] Using MockGenerator (no model path provided)");
    } else {
      auto llamaGenerator = std::make_unique<LlamaGenerator>();
      llamaGenerator->setSamplingOptions(temperature, topP, seed);
      spdlog::info(
          "[Generator] Using LlamaGenerator: {} (temperature={}, top-p={}, "
          "seed={})",
          modelPath, temperature, topP, seed);
      generator = std::move(llamaGenerator);
    }
    generator->load(modelPath);

    WikipediaService wikipediaService(webClient);

    spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

    auto countries = db.QueryCountries(50);
    auto states = db.QueryStates(50);
    auto cities = db.QueryCities();

    // Build a quick map of country id -> name for per-city lookups.
    auto allCountries = db.QueryCountries(0);
    std::unordered_map<int, std::string> countryMap;
    for (const auto &c : allCountries)
      countryMap[c.id] = c.name;

    spdlog::info("\nTotal records loaded:");
    spdlog::info("  Countries: {}", db.QueryCountries(0).size());
    spdlog::info("  States: {}", db.QueryStates(0).size());
    spdlog::info("  Cities: {}", cities.size());

    struct GeneratedBrewery {
      int cityId;
      std::string cityName;
      BreweryResult brewery;
    };

    std::vector<GeneratedBrewery> generatedBreweries;
    const size_t sampleCount = std::min(size_t(30), cities.size());

    spdlog::info("\n=== SAMPLE BREWERY GENERATION ===");
    for (size_t i = 0; i < sampleCount; i++) {
      const auto &city = cities[i];
      const int cityId = city.id;
      const std::string cityName = city.name;

      std::string localCountry;
      const auto countryIt = countryMap.find(city.countryId);
      if (countryIt != countryMap.end()) {
        localCountry = countryIt->second;
      }

      const std::string regionContext =
          wikipediaService.GetSummary(cityName, localCountry);
      spdlog::debug("[Pipeline] Region context for {}: {}", cityName,
                    regionContext);

      auto brewery =
          generator->generateBrewery(cityName, localCountry, regionContext);
      generatedBreweries.push_back({cityId, cityName, brewery});
    }

    spdlog::info("\n=== GENERATED DATA DUMP ===");
    for (size_t i = 0; i < generatedBreweries.size(); i++) {
      const auto &entry = generatedBreweries[i];
      spdlog::info("{}. city_id={} city=\"{}\"", i + 1, entry.cityId,
                   entry.cityName);
      spdlog::info("   brewery_name=\"{}\"", entry.brewery.name);
      spdlog::info("   brewery_description=\"{}\"", entry.brewery.description);
    }

    spdlog::info("\nOK: Pipeline completed successfully");

    return 0;

  } catch (const std::exception &e) {
    spdlog::error("ERROR: Pipeline failed: {}", e.what());
    return 1;
  }
}
