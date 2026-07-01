/**
 * @file biergarten_pipeline_orchestrator/generate_breweries.cc
 * @brief BiergartenPipelineOrchestrator::GenerateBreweries() implementation.
 */

#include <chrono>
#include <format>
#include <optional>

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

  const auto generate_record =
      [this, &skipped_count](
          const Location& location,
          const std::string& region_context) -> std::optional<BreweryRecord> {
    try {
      const BreweryResult brewery =
          generator_->GenerateBrewery(location, region_context);
      return BreweryRecord{.location = location, .brewery = brewery};
    } catch (const std::exception& e) {
      ++skipped_count;

      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::BreweryAndBeerGeneration,
           .message = std::format("[Pipeline] Skipping city '{}' ({}): brewery "
                                  "generation failed: {}",
                                  location.city, location.country, e.what())});
      return std::nullopt;
    }
  };

  const auto export_record = [this, &export_failed_count](
                                 const BreweryRecord& record) {
    try {
      exporter_->ProcessRecord(record);
    } catch (const std::exception& export_exception) {
      ++export_failed_count;
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::BreweryAndBeerGeneration,
           .message = std::format("[Pipeline] Generated brewery for '{}' ({}) "
                                  "but SQLite export failed: {}",
                                  record.location.city, record.location.country,
                                  export_exception.what())});
    }
  };

  for (const auto& [location, region_context] : cities) {
    const std::optional<BreweryRecord> record =
        generate_record(location, region_context);
    if (!record.has_value()) {
      continue;
    }

    generated_breweries_.push_back(*record);
    export_record(*record);
  }

  if (skipped_count > 0) {
    logger_->Log(
        {.level = LogLevel::Warn,
         .phase = PipelinePhase::BreweryAndBeerGeneration,
         .message = std::format(
             "[Pipeline] Skipped {} city/cities due to generation errors",
             skipped_count)});
  }

  if (export_failed_count > 0) {
    logger_->Log(
        {.level = LogLevel::Warn,
         .phase = PipelinePhase::Teardown,
         .message = std::format("[Pipeline] Failed to export {} generated "
                                "brewery/breweries to SQLite",
                                export_failed_count)});
  }
}
