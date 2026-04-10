/**
 * @file biergarten_data_generator/run.cpp
 * @brief BiergartenDataGenerator::Run() implementation.
 */

#include <spdlog/spdlog.h>

#include "biergarten_data_generator.h"

bool BiergartenDataGenerator::Run() {
   try {
      const std::vector<Location> cities = QueryCitiesWithCountries(); 
      std::vector<EnrichedCity> enriched;
      enriched.reserve(cities.size());

      size_t skipped_count = 0;
      for (const auto& city : cities) {
         try {
            const std::string region_context =
                context_service_->GetLocationContext(city);
            spdlog::info("[Pipeline] Context for '{}' ({}) gathered:\n{}",
                         city.city, city.country, region_context);

            enriched.push_back(EnrichedCity{.location = city,
                                            .region_context = region_context});
         } catch (const std::exception& exception) {
            ++skipped_count;
            spdlog::warn(
                "[Pipeline] Skipping city '{}' ({}): context lookup failed: {}",
                city.city, city.country, exception.what());
         }
      }

      if (skipped_count > 0) {
         spdlog::warn(
             "[Pipeline] Skipped {} city/cities due to context lookup errors",
             skipped_count);
      }

      this->GenerateBreweries(enriched);
      this->LogResults();
      return true;
   } catch (const std::exception& e) {
      spdlog::error("Pipeline execution failed with error: {}", e.what());
      return false;
   }
}
