#include "data_downloader.h"
#include "database.h"
#include "generator.h"
#include "json_loader.h"
#include <curl/curl.h>
#include <spdlog/spdlog.h>

int main(int argc, char *argv[]) {
  try {
    curl_global_init(CURL_GLOBAL_DEFAULT);

    std::string modelPath = argc > 1 ? argv[1] : "./model.gguf";
    std::string cacheDir = argc > 2 ? argv[2] : "/tmp";
    std::string commit =
        argc > 3 ? argv[3] : "c5eb7772"; // Default: stable 2026-03-28

    std::string jsonPath = cacheDir + "/countries+states+cities.json";

    spdlog::info("\n[Pipeline] Downloading geographic data from GitHub...");
    DataDownloader downloader;
    downloader.DownloadCountriesDatabase(jsonPath, commit);

    SqliteDatabase db;

    spdlog::info("Initializing in-memory SQLite database...");
    db.Initialize();

    JsonLoader::LoadWorldCities(jsonPath, db);

    spdlog::info("Initializing brewery generator...");
    LlamaBreweryGenerator generator;
    generator.LoadModel(modelPath);

    spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

    auto countries = db.QueryCountries(50);
    auto states = db.QueryStates(50);
    auto cities = db.QueryCities();

    spdlog::info("\nTotal records loaded:");
    spdlog::info("  Countries: {}", db.QueryCountries(0).size());
    spdlog::info("  States: {}", db.QueryStates(0).size());
    spdlog::info("  Cities: {}", cities.size());

    spdlog::info("\n--- 50 COUNTRIES ---");
    for (size_t i = 0; i < countries.size(); i++) {
      spdlog::info("{}. {} ({}) {}", (i + 1), countries[i].iso2,
                   countries[i].iso3, countries[i].name);
    }

    spdlog::info("\n--- 50 STATES ---");
    for (size_t i = 0; i < states.size(); i++) {
      spdlog::info("{}. {}: {}", (i + 1), states[i].iso2, states[i].name);
    }

    spdlog::info("\n--- 50 CITIES ---");
    for (size_t i = 0; i < std::min(size_t(50), cities.size()); i++) {
      spdlog::info("{}. {}", (i + 1), cities[i].second);
    }

    spdlog::info("\n=== SAMPLE BREWERY GENERATION ===\n");
    for (size_t i = 0; i < std::min(size_t(5), cities.size()); i++) {
      const auto &[cityId, cityName] = cities[i];
      auto brewery = generator.GenerateBrewery(cityName, i);
      spdlog::info("  {}: {}", cityName, brewery.name);
      spdlog::info("    -> {}", brewery.description);
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
