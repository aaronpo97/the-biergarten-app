/**
 * @file biergarten_data_generator/generate_breweries.cpp
 * @brief BiergartenDataGenerator::GenerateBreweries() implementation.
 */

#include <spdlog/spdlog.h>

#include "biergarten_data_generator.h"

void BiergartenDataGenerator::GenerateBreweries(
    const std::vector<EnrichedCity>& cities) {
   spdlog::info("\n=== SAMPLE BREWERY GENERATION ===");
   generatedBreweries_.clear();

   size_t skipped_count = 0;

   for (const auto& enriched_city : cities) {
      try {
         auto brewery = generator_->GenerateBrewery(
             enriched_city.location.city, enriched_city.location.country,
             enriched_city.region_context);
         generatedBreweries_.push_back(GeneratedBrewery{
             .location = enriched_city.location, .brewery = brewery});
      } catch (const std::exception& e) {
         ++skipped_count;
         spdlog::warn(
             "[Pipeline] Skipping city '{}' ({}): brewery generation failed: "
             "{}",
             enriched_city.location.city, enriched_city.location.country,
             e.what());
      }
   }

   if (skipped_count > 0) {
      spdlog::warn(
          "[Pipeline] Skipped {} city/cities due to generation "
          "errors",
          skipped_count);
   }
}
