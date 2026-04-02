#include "biergarten_data_generator.h"

#include <algorithm>
#include <filesystem>
#include <unordered_map>

#include <spdlog/spdlog.h>

#include "data_generation/data_downloader.h"
#include "json_handling/json_loader.h"
#include "data_generation/llama_generator.h"
#include "data_generation/mock_generator.h"
#include "wikipedia/wikipedia_service.h"

BiergartenDataGenerator::BiergartenDataGenerator(
    const ApplicationOptions &options,
    std::shared_ptr<IWebClient> webClient,
    SqliteDatabase &database)
    : options_(options), webClient_(webClient), database_(database) {}

std::unique_ptr<IDataGenerator> BiergartenDataGenerator::InitializeGenerator() {
  spdlog::info("Initializing brewery generator...");

  std::unique_ptr<IDataGenerator> generator;
  if (options_.modelPath.empty()) {
    generator = std::make_unique<MockGenerator>();
    spdlog::info("[Generator] Using MockGenerator (no model path provided)");
  } else {
    auto llamaGenerator = std::make_unique<LlamaGenerator>();
    llamaGenerator->setSamplingOptions(options_.temperature, options_.topP,
                                       options_.seed);
    spdlog::info(
        "[Generator] Using LlamaGenerator: {} (temperature={}, top-p={}, "
        "seed={})",
        options_.modelPath, options_.temperature, options_.topP,
        options_.seed);
    generator = std::move(llamaGenerator);
  }
  generator->load(options_.modelPath);

  return generator;
}

void BiergartenDataGenerator::LoadGeographicData() {
  std::string jsonPath = options_.cacheDir + "/countries+states+cities.json";
  std::string dbPath = options_.cacheDir + "/biergarten-pipeline.db";

  bool hasJsonCache = std::filesystem::exists(jsonPath);
  bool hasDbCache = std::filesystem::exists(dbPath);

  spdlog::info("Initializing SQLite database at {}...", dbPath);
  database_.Initialize(dbPath);

  if (hasDbCache && hasJsonCache) {
    spdlog::info("[Pipeline] Cache hit: skipping download and parse");
  } else {
    spdlog::info("\n[Pipeline] Downloading geographic data from GitHub...");
    DataDownloader downloader(webClient_);
    downloader.DownloadCountriesDatabase(jsonPath, options_.commit);

    JsonLoader::LoadWorldCities(jsonPath, database_);
  }
}

void BiergartenDataGenerator::GenerateSampleBreweries() {
  auto generator = InitializeGenerator();
  WikipediaService wikipediaService(webClient_);

  spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

  auto countries = database_.QueryCountries(50);
  auto states = database_.QueryStates(50);
  auto cities = database_.QueryCities();

  // Build a quick map of country id -> name for per-city lookups.
  auto allCountries = database_.QueryCountries(0);
  std::unordered_map<int, std::string> countryMap;
  for (const auto &c : allCountries)
    countryMap[c.id] = c.name;

  spdlog::info("\nTotal records loaded:");
  spdlog::info("  Countries: {}", database_.QueryCountries(0).size());
  spdlog::info("  States: {}", database_.QueryStates(0).size());
  spdlog::info("  Cities: {}", cities.size());

  generatedBreweries_.clear();
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
    generatedBreweries_.push_back({cityId, cityName, brewery});
  }

  spdlog::info("\n=== GENERATED DATA DUMP ===");
  for (size_t i = 0; i < generatedBreweries_.size(); i++) {
    const auto &entry = generatedBreweries_[i];
    spdlog::info("{}. city_id={} city=\"{}\"", i + 1, entry.cityId,
                 entry.cityName);
    spdlog::info("   brewery_name=\"{}\"", entry.brewery.name);
    spdlog::info("   brewery_description=\"{}\"", entry.brewery.description);
  }
}

int BiergartenDataGenerator::Run() {
  try {
    LoadGeographicData();
    GenerateSampleBreweries();

    spdlog::info("\nOK: Pipeline completed successfully");
    return 0;
  } catch (const std::exception &e) {
    spdlog::error("ERROR: Pipeline failed: {}", e.what());
    return 1;
  }
}
