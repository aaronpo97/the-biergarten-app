/**
 * @file biergarten_pipeline_orchestrator/generate_breweries.cc
 * @brief BiergartenDataGenerator::GenerateBreweries() implementation.
 */

#include <chrono>
#include <format>

#include "biergarten_pipeline_orchestrator.h"
#include "services/logging/logger.h"

void BiergartenPipelineOrchestrator::GenerateBreweries(
    std::span<const EnrichedCity> cities) {
  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::BreweryAndBeerGeneration,
                .message = "=== SAMPLE BREWERY GENERATION ==="});

  generated_breweries_.clear();
  size_t skipped_count = 0;
  size_t export_failed_count = 0;

  for (const auto& [location, region_context] : cities) {
    try {
      const BreweryResult brewery =
          generator_->GenerateBrewery(location, region_context);

      const GeneratedBrewery gen{.location = location, .brewery = brewery};

      generated_breweries_.push_back(gen);

      try {
        exporter_->ProcessRecord(gen);
      } catch (const std::exception& export_exception) {
        ++export_failed_count;

        logger_->Log(
            {.level = LogLevel::Warn,
             .phase = PipelinePhase::BreweryAndBeerGeneration,
             .message =
                 std::format("[Pipeline] Generated brewery for '{}' ({}) but SQLite export failed: {}",
                 location.city, location.country, export_exception.what())});
      }
    } catch (const std::exception& e) {
      ++skipped_count;

      logger_->Log({.level = LogLevel::Warn,
                    .phase = PipelinePhase::BreweryAndBeerGeneration,
                    .message = std::format("[Pipeline] Skipping city '{}' ({}): brewery generation failed: {}",
                               location.city, location.country, e.what())});
    }
  }

  if (skipped_count > 0) {
    logger_->Log({.level = LogLevel::Warn,
                  .phase = PipelinePhase::BreweryAndBeerGeneration,
                  .message = std::format(
                      "[Pipeline] Skipped {} city/cities due to generation errors",
                      skipped_count)});
  }

  if (export_failed_count > 0) {
    logger_->Log({.level = LogLevel::Warn,
                  .phase = PipelinePhase::Teardown,
                  .message = std::format(
                      "[Pipeline] Failed to export {} generated brewery/breweries to SQLite",
                      export_failed_count)});
  }
}
