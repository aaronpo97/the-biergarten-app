#include "biergarten_data_generator.h"

#include <spdlog/spdlog.h>

#include <algorithm>
#include <filesystem>
#include <future>
#include <iterator>
#include <random>

#include "data_generation/llama_generator.h"
#include "data_generation/mock_generator.h"
#include "json_handling/json_loader.h"
#include "wikipedia/wikipedia_service.h"

BiergartenDataGenerator::BiergartenDataGenerator(
   const ApplicationOptions& options, std::shared_ptr<WebClient> web_client)
   : options_(options), webClient_(std::move(web_client)) {}

auto BiergartenDataGenerator::InitializeGenerator()
   -> std::unique_ptr<DataGenerator> {
   spdlog::info("Initializing brewery generator...");

   std::unique_ptr<DataGenerator> generator;
   if (options_.model_path.empty()) {
      generator = std::make_unique<MockGenerator>();
      spdlog::info("[Generator] Using MockGenerator (no model path provided)");
   } else {
      auto llama_generator = std::make_unique<LlamaGenerator>();
      llama_generator->SetSamplingOptions(options_.temperature, options_.top_p,
                                          options_.seed);
      llama_generator->SetContextSize(options_.n_ctx);
      spdlog::info(
          "[Generator] Using LlamaGenerator: {} (temperature={}, top-p={}, "
          "n_ctx={}, seed={})",
          options_.model_path, options_.temperature, options_.top_p,
          options_.n_ctx, options_.seed);
      generator = std::move(llama_generator);
   }
   generator->Load(options_.model_path);

   return generator;
}

auto BiergartenDataGenerator::QueryCitiesWithCountries()
   -> std::vector<Location> {
   spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

   std::filesystem::path locations_path = "locations.json";
   if (!std::filesystem::exists(locations_path)) {
      const std::filesystem::path cache_path =
          std::filesystem::path(options_.cache_dir) / "locations.json";
      if (std::filesystem::exists(cache_path)) {
         locations_path = cache_path;
      }
   }

   auto all_locations = JsonLoader::LoadLocations(locations_path.string());
   spdlog::info("  Locations available: {}", all_locations.size());

   const size_t sample_count = std::min<size_t>(30, all_locations.size());
   std::vector<Location> sampled_locations;
   sampled_locations.reserve(sample_count);

   std::random_device random_generator;
   std::sample(all_locations.begin(), all_locations.end(),
               std::back_inserter(sampled_locations), sample_count,
               random_generator);

   spdlog::info("  Sampled locations: {}", sampled_locations.size());
   return sampled_locations;
}

auto BiergartenDataGenerator::EnrichWithWikipedia(
   const std::vector<Location>& cities) -> std::vector<EnrichedCity> {
   std::vector<EnrichedCity> enriched;
   enriched.reserve(cities.size());

   std::vector<std::future<EnrichedCity>> pending;
   pending.reserve(cities.size());

   for (const auto& city : cities) {
      pending.push_back(std::async(std::launch::async,
                                   [web_client = webClient_, city]() {
                                      WikipediaService wikipedia_service(
                                          web_client);
                                      const std::string region_context =
                                          wikipedia_service.GetSummary(
                                              city.city, city.country);
                                      spdlog::debug(
                                          "[Pipeline] Region context for {}: {}",
                                          city.city, region_context);
                                      return EnrichedCity{city, region_context};
                                   }));
   }

   for (auto& task : pending) {
      enriched.push_back(task.get());
   }

   return enriched;
}

void BiergartenDataGenerator::GenerateBreweries(
    DataGenerator& generator, const std::vector<EnrichedCity>& cities) {
   spdlog::info("\n=== SAMPLE BREWERY GENERATION ===");
   generatedBreweries_.clear();

   for (const auto& enriched_city : cities) {
      auto brewery = generator.GenerateBrewery(enriched_city.location.city,
                                               enriched_city.location.country,
                                               enriched_city.region_context);
      generatedBreweries_.push_back({enriched_city.location, brewery});
   }
}

void BiergartenDataGenerator::LogResults() const {
   spdlog::info("\n=== GENERATED DATA DUMP ===");
   size_t index = 1;
   for (const auto& entry : generatedBreweries_) {
      spdlog::info("{}. city=\"{}\" country=\"{}\" state=\"{}\" "
                   "iso3166_2={} lat={} lon={}",
                   index, entry.location.city, entry.location.country,
                   entry.location.state_province, entry.location.iso3166_2,
                   entry.location.latitude, entry.location.longitude);
      spdlog::info("   brewery_name=\"{}\"", entry.brewery.name);
      spdlog::info("   brewery_description=\"{}\"", entry.brewery.description);
      ++index;
   }
}

auto BiergartenDataGenerator::Run() -> int {
   try {
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
