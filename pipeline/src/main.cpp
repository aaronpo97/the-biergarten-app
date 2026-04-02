#include "data_downloader.h"
#include "data_generator.h"
#include "database.h"
#include "json_loader.h"
#include "llama_generator.h"
#include "mock_generator.h"
#include <curl/curl.h>
#include <filesystem>
#include <memory>
#include <spdlog/spdlog.h>
#include <vector>

static bool FileExists(const std::string &filePath) {
  return std::filesystem::exists(filePath);
}

int main(int argc, char *argv[]) {
  try {
    curl_global_init(CURL_GLOBAL_DEFAULT);

    std::string modelPath = argc > 1 ? argv[1] : "";
    std::string cacheDir = argc > 2 ? argv[2] : "/tmp";
    std::string commit =
        argc > 3 ? argv[3] : "c5eb7772"; // Default: stable 2026-03-28

    std::string countryName = argc > 4 ? argv[4] : "";

    std::string jsonPath = cacheDir + "/countries+states+cities.json";
    std::string dbPath = cacheDir + "/biergarten-pipeline.db";

    bool hasJsonCache = FileExists(jsonPath);
    bool hasDbCache = FileExists(dbPath);

    SqliteDatabase db;

    spdlog::info("Initializing SQLite database at {}...", dbPath);
    db.Initialize(dbPath);

    if (hasDbCache && hasJsonCache) {
      spdlog::info("[Pipeline] Cache hit: skipping download and parse");
    } else {
      spdlog::info("\n[Pipeline] Downloading geographic data from GitHub...");
      DataDownloader downloader;
      downloader.DownloadCountriesDatabase(jsonPath, commit);

      JsonLoader::LoadWorldCities(jsonPath, db);
    }

    spdlog::info("Initializing brewery generator...");
    std::unique_ptr<IDataGenerator> generator;
    if (modelPath.empty()) {
      generator = std::make_unique<MockGenerator>();
      spdlog::info("[Generator] Using MockGenerator (no model path provided)");
    } else {
      generator = std::make_unique<LlamaGenerator>();
      spdlog::info("[Generator] Using LlamaGenerator: {}", modelPath);
    }
    generator->load(modelPath);

    spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

    auto countries = db.QueryCountries(50);
    auto states = db.QueryStates(50);
    auto cities = db.QueryCities();

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
      const auto &[cityId, cityName] = cities[i];
      auto brewery = generator->generateBrewery(cityName, countryName, "");
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

    curl_global_cleanup();
    return 0;

  } catch (const std::exception &e) {
    spdlog::error("ERROR: Pipeline failed: {}", e.what());
    curl_global_cleanup();
    return 1;
  }
}
