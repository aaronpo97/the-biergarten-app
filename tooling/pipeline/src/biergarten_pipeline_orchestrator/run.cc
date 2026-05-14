/**
 * @file biergarten_pipeline_orchestrator/run.cc
 * @brief BiergartenDataGenerator::Run() implementation.
 */

#include <spdlog/spdlog.h>

#include <utility>

#include "biergarten_data_generator.h"

bool BiergartenPipelineOrchestrator::Run() {
  try {
    exporter_->Initialize();

    std::vector<Location> cities = QueryCitiesWithCountries();
    std::vector<EnrichedCity> enriched;
    enriched.reserve(cities.size());

    size_t skipped_count = 0;
    for (auto& city : cities) {
      try {
        std::string region_context = context_service_->GetLocationContext(city);
        // spdlog::debug("[Pipeline] Context for '{}' ({}) gathered:\n{}",
        //               city.city, city.iso3166_2, region_context);

        enriched.push_back(
            EnrichedCity{.location = std::move(city),
                         .region_context = std::move(region_context)});
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
    exporter_->Finalize();
    this->LogResults();
    return true;
  } catch (const std::exception& e) {
    spdlog::error("Pipeline execution failed with error: {}", e.what());
    return false;
  }
}
