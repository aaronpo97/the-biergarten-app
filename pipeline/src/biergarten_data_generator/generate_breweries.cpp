/**
 * @file biergarten_data_generator/generate_breweries.cpp
 * @brief BiergartenDataGenerator::GenerateBreweries() implementation.
 */

#include <spdlog/spdlog.h>

#include "biergarten_data_generator.h"

void BiergartenDataGenerator::GenerateBreweries(
    std::span<const EnrichedCity> cities) {
   spdlog::info("\n=== SAMPLE BREWERY GENERATION ===");

   generated_breweries_.clear();
   size_t skipped_count = 0;

   for (const auto& [location, region_context] : cities) {
      try {
         const BreweryResult brewery =
             generator_->GenerateBrewery(location, region_context);

         const GeneratedBrewery gen{.location = location, .brewery = brewery};

         generated_breweries_.push_back(gen);
      } catch (const std::exception& e) {
         ++skipped_count;

         spdlog::warn(
             "[Pipeline] Skipping city '{}' ({}): brewery generation failed: "
             "{}",
             location.city, location.country, e.what());
      }
   }

   if (skipped_count > 0) {
      spdlog::warn("[Pipeline] Skipped {} city/cities due to generation errors",
                   skipped_count);
   }
}
