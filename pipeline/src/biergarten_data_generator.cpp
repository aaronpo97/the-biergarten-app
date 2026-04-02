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
    std::shared_ptr<WebClient> web_client,
    SqliteDatabase &database)
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

void BiergartenDataGenerator::GenerateSampleBreweries() {
  auto generator = InitializeGenerator();
  WikipediaService wikipedia_service(webClient_);

  spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

  auto countries = database_.QueryCountries(50);
  auto states = database_.QueryStates(50);
  auto cities = database_.QueryCities();

  // Build a quick map of country id -> name for per-city lookups.
  auto all_countries = database_.QueryCountries(0);
  std::unordered_map<int, std::string> country_map;
  for (const auto &c : all_countries)
    country_map[c.id] = c.name;

  spdlog::info("\nTotal records loaded:");
  spdlog::info("  Countries: {}", database_.QueryCountries(0).size());
  spdlog::info("  States: {}", database_.QueryStates(0).size());
  spdlog::info("  Cities: {}", cities.size());

  generatedBreweries_.clear();
  const size_t sample_count = std::min(size_t(30), cities.size());

  spdlog::info("\n=== SAMPLE BREWERY GENERATION ===");
  for (size_t i = 0; i < sample_count; i++) {
    const auto &city = cities[i];
    const int city_id = city.id;
    const std::string city_name = city.name;

    std::string local_country;
    const auto country_it = country_map.find(city.country_id);
    if (country_it != country_map.end()) {
      local_country = country_it->second;
    }

    const std::string region_context =
        wikipedia_service.GetSummary(city_name, local_country);
    spdlog::debug("[Pipeline] Region context for {}: {}", city_name,
                  region_context);

    auto brewery =
        generator->GenerateBrewery(city_name, local_country, region_context);
    generatedBreweries_.push_back({city_id, city_name, brewery});
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
