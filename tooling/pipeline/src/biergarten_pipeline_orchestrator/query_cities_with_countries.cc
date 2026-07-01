/**
 * @file biergarten_pipeline_orchestrator/query_cities_with_countries.cc
 * @brief BiergartenPipelineOrchestrator::QueryCitiesWithCountries()
 * implementation.
 */

#include <algorithm>
#include <chrono>
#include <format>
#include <iterator>
#include <random>

#include "biergarten_pipeline_orchestrator.h"
#include "../../includes/services/curated_data/curated_json_data_service.h"
#include "services/logging/logger.h"

std::vector<Location>
BiergartenPipelineOrchestrator::QueryCitiesWithCountries() {
  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::Startup,
                .message = "=== GEOGRAPHIC DATA OVERVIEW ==="});

  const std::vector<Location>& all_locations =
      curated_data_service_->LoadLocations();

  const size_t sample_count = std::min(
      static_cast<size_t>(application_options_.pipeline.location_count),
      all_locations.size());

  const auto sample_count_signed =
      static_cast<std::iter_difference_t<decltype(all_locations.cbegin())>>(
          sample_count);

  std::vector<Location> sampled_locations;
  sampled_locations.reserve(sample_count);

  std::random_device random_generator;
  std::ranges::sample(all_locations, std::back_inserter(sampled_locations),
                      sample_count_signed, random_generator);

  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::Startup,
                .message = std::format("  Locations available: {}",
                                       all_locations.size())});
  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::Startup,
                .message = std::format("  Sampled locations: {}",
                                       sampled_locations.size())});
  return sampled_locations;
}
