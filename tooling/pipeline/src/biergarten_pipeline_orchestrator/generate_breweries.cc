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
          const EnrichedCity& enriched_city) -> std::optional<BreweryRecord> {
    try {
      const BreweryResult brewery = generator_->GenerateBrewery(enriched_city);
      const std::string postal_code =
          postal_code_service_->GeneratePostalCode(enriched_city.location);
      return BreweryRecord{
          .address = BreweryAddress{.city = enriched_city.location,
                                    .postal_code = postal_code},
          .brewery = brewery};
    } catch (const std::exception& e) {
      ++skipped_count;

      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::BreweryAndBeerGeneration,
           .message = std::format("[Pipeline] Skipping city '{}' ({}): brewery "
                                  "generation failed: {}",
                                  enriched_city.location.city,
                                  enriched_city.location.country, e.what())});
      return std::nullopt;
    }
  };

  const auto export_record = [this, &export_failed_count](
                                 const BreweryRecord& record) {
    try {
      exporter_->ProcessRecord(record);
    } catch (const std::exception& export_exception) {
      ++export_failed_count;
      logger_->Log({.level = LogLevel::Warn,
                    .phase = PipelinePhase::BreweryAndBeerGeneration,
                    .message = std::format(
                        "[Pipeline] Generated brewery for '{}' ({}) "
                        "but SQLite export failed: {}",
                        record.address.city.city, record.address.city.country,
                        export_exception.what())});
    }
  };

  for (const EnrichedCity& enriched_city : cities) {
    const std::optional<BreweryRecord> record = generate_record(enriched_city);
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
