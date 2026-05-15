/**
 * @file biergarten_pipeline_orchestrator/generate_breweries.cc
 * @brief BiergartenDataGenerator::GenerateBreweries() implementation.
 */

#include "services/logging/logger.h"
#include "biergarten_pipeline_orchestrator.h"

void BiergartenPipelineOrchestrator::GenerateBreweries(
    std::span<const EnrichedCity> cities) {
  logger_->Log(LogLevel::Info, PipelinePhase::BreweryAndBeerGeneration,
               "=== SAMPLE BREWERY GENERATION ===");

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

        logger_->Log(LogLevel::Warn, PipelinePhase::BreweryAndBeerGeneration,
                     std::string("[Pipeline] Generated brewery for '") +
                         location.city + "' (" + location.country +
                         ") but SQLite export failed: " +
                         export_exception.what());
      }
    } catch (const std::exception& e) {
      ++skipped_count;

      logger_->Log(LogLevel::Warn, PipelinePhase::BreweryAndBeerGeneration,
                   std::string("[Pipeline] Skipping city '") + location.city +
                       " (" + location.country + "): brewery generation failed: " +
                       e.what());
    }
  }

  if (skipped_count > 0) {
    logger_->Log(LogLevel::Warn, PipelinePhase::BreweryAndBeerGeneration,
                 std::string("[Pipeline] Skipped ") +
                     std::to_string(skipped_count) +
                     " city/cities due to generation errors");
  }

  if (export_failed_count > 0) {
    logger_->Log(LogLevel::Warn, PipelinePhase::Teardown,
                 std::string("[Pipeline] Failed to export ") +
                     std::to_string(export_failed_count) +
                     " generated brewery/breweries to SQLite");
  }
}
