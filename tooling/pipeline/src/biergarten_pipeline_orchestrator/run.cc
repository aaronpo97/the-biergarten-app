/**
 * @file biergarten_pipeline_orchestrator/run.cc
 * @brief BiergartenPipelineOrchestrator::Run() implementation.
 */

#include <chrono>
#include <format>
#include <utility>

#include "biergarten_pipeline_orchestrator.h"
#include "services/logging/logger.h"

bool BiergartenPipelineOrchestrator::Run() {
  try {
    exporter_->Initialize();

    std::vector<Location> cities = QueryLocations();
    std::vector<EnrichedCity> enriched;
    enriched.reserve(cities.size());

    size_t skipped_count = 0;
    for (auto& city : cities) {
      try {
        std::string region_context = context_service_->GetLocationContext(city);

        enriched.push_back(
            EnrichedCity{.location = std::move(city),
                         .region_context = std::move(region_context)});
      } catch (const std::exception& exception) {
        ++skipped_count;
        logger_->Log({.level = LogLevel::Warn,
                      .phase = PipelinePhase::Enrichment,
                      .message = std::format(
                          "[Pipeline] Skipping city '{}' ({}): context "
                          "lookup failed: {}",
                          city.city, city.country, exception.what())});
      }
    }

    if (skipped_count > 0) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::Enrichment,
           .message = std::format("[Pipeline] Skipped {} city/cities due "
                                  "to context lookup errors",
                                  skipped_count)});
    }

    this->GenerateUsers(enriched);
    this->GenerateBreweries(enriched);
    exporter_->Finalize();
    this->LogResults();
    return true;
  } catch (const std::exception& e) {
    logger_->Log({.level = LogLevel::Error,
                  .phase = PipelinePhase::Teardown,
                  .message = std::format(
                      "Pipeline execution failed with error: {}", e.what())});
    return false;
  }
}
