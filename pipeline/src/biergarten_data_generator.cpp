#include "biergarten_data_generator.h"

#include <spdlog/spdlog.h>

#include <algorithm>
#include <filesystem>
#include <unordered_map>

#include "data_generation/data_downloader.h"
#include "data_generation/llama_generator.h"
#include "data_generation/mock_generator.h"
#include "json_handling/json_loader.h"
#include "wikipedia/wikipedia_service.h"

BiergartenDataGenerator::BiergartenDataGenerator(
    const ApplicationOptions& options, std::shared_ptr<WebClient> web_client,
    SqliteDatabase& database)
    : options_(options), webClient_(web_client), database_(database) {}

std::unique_ptr<DataGenerator> BiergartenDataGenerator::InitializeGenerator() {
   spdlog::info("Initializing brewery generator...");

   std::unique_ptr<DataGenerator> generator;
   if (options_.model_path.empty()) {
      generator = std::make_unique<MockGenerator>();
      spdlog::info("[Generator] Using MockGenerator (no model path provided)");
   } else {
      auto llama_generator = std::make_unique<LlamaGenerator>();
      llama_generator->SetSamplingOptions(options_.temperature, options_.top_p,
                                          options_.seed);
      spdlog::info(
          "[Generator] Using LlamaGenerator: {} (temperature={}, top-p={}, "
          "seed={})",
          options_.model_path, options_.temperature, options_.top_p,
          options_.seed);
      generator = std::move(llama_generator);
   }
   generator->Load(options_.model_path);

   return generator;
}

void BiergartenDataGenerator::LoadGeographicData() {
   std::string json_path = options_.cache_dir + "/countries+states+cities.json";
   std::string db_path = options_.cache_dir + "/biergarten-pipeline.db";

   bool has_json_cache = std::filesystem::exists(json_path);
   bool has_db_cache = std::filesystem::exists(db_path);

   spdlog::info("Initializing SQLite database at {}...", db_path);
   database_.Initialize(db_path);

   if (has_db_cache && has_json_cache) {
      spdlog::info("[Pipeline] Cache hit: skipping download and parse");
   } else {
      spdlog::info("\n[Pipeline] Downloading geographic data from GitHub...");
      DataDownloader downloader(webClient_);
      downloader.DownloadCountriesDatabase(json_path, options_.commit);

      JsonLoader::LoadWorldCities(json_path, database_);
   }
}

std::vector<std::pair<City, std::string>>
BiergartenDataGenerator::QueryCitiesWithCountries() {
   spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

   auto cities = database_.QueryCities();

   // Build a quick map of country id -> name for per-city lookups.
   auto all_countries = database_.QueryCountries(0);
   std::unordered_map<int, std::string> country_map;
   for (const auto& c : all_countries) {
      country_map[c.id] = c.name;
   }

   spdlog::info("\nTotal records loaded:");
   spdlog::info("  Countries: {}", database_.QueryCountries(0).size());
   spdlog::info("  States: {}", database_.QueryStates(0).size());
   spdlog::info("  Cities: {}", cities.size());

   // Cap at 30 entries.
   const size_t sample_count = std::min(size_t(30), cities.size());
   std::vector<std::pair<City, std::string>> result;

   for (size_t i = 0; i < sample_count; i++) {
      const auto& city = cities[i];
      std::string country_name;
      const auto country_it = country_map.find(city.country_id);
      if (country_it != country_map.end()) {
         country_name = country_it->second;
      }
      result.push_back({city, country_name});
   }

   return result;
}

std::vector<BiergartenDataGenerator::EnrichedCity>
BiergartenDataGenerator::EnrichWithWikipedia(
    const std::vector<std::pair<City, std::string>>& cities) {
   WikipediaService wikipedia_service(webClient_);
   std::vector<EnrichedCity> enriched;

   for (const auto& [city, country_name] : cities) {
      const std::string region_context =
          wikipedia_service.GetSummary(city.name, country_name);
      spdlog::debug("[Pipeline] Region context for {}: {}", city.name,
                    region_context);

      enriched.push_back({city.id, city.name, country_name, region_context});
   }

   return enriched;
}

void BiergartenDataGenerator::GenerateBreweries(
    DataGenerator& generator, const std::vector<EnrichedCity>& cities) {
   spdlog::info("\n=== SAMPLE BREWERY GENERATION ===");
   generatedBreweries_.clear();

   for (const auto& enriched_city : cities) {
      auto brewery = generator.GenerateBrewery(enriched_city.city_name,
                                               enriched_city.country_name,
                                               enriched_city.region_context);
      generatedBreweries_.push_back(
          {enriched_city.city_id, enriched_city.city_name, brewery});
   }
}

void BiergartenDataGenerator::LogResults() const {
   spdlog::info("\n=== GENERATED DATA DUMP ===");
   for (size_t i = 0; i < generatedBreweries_.size(); i++) {
      const auto& entry = generatedBreweries_[i];
      spdlog::info("{}. city_id={} city=\"{}\"", i + 1, entry.city_id,
                   entry.city_name);
      spdlog::info("   brewery_name=\"{}\"", entry.brewery.name);
      spdlog::info("   brewery_description=\"{}\"", entry.brewery.description);
   }
}

int BiergartenDataGenerator::Run() {
   try {
      LoadGeographicData();
      auto generator = InitializeGenerator();
      auto cities = QueryCitiesWithCountries();
      auto enriched = EnrichWithWikipedia(cities);
      GenerateBreweries(*generator, enriched);
      LogResults();

      spdlog::info("\nOK: Pipeline completed successfully");
      return 0;
   } catch (const std::exception& e) {
      spdlog::error("ERROR: Pipeline failed: {}", e.what());
      return 1;
   }
}
