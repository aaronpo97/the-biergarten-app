/**
 * @file biergarten_pipeline_orchestrator/query_cities_with_countries.cc
 * @brief BiergartenDataGenerator::QueryCitiesWithCountries() implementation.
 */

#include "services/logging/logger.h"

#include <algorithm>
#include <filesystem>
#include <format>
#include <iterator>
#include <random>

#include "biergarten_pipeline_orchestrator.h"
#include "json_handling/json_loader.h"

std::vector<Location> BiergartenPipelineOrchestrator::QueryCitiesWithCountries() {
  logger_->Log(LogLevel::Info, PipelinePhase::Startup,
               "=== GEOGRAPHIC DATA OVERVIEW ===");

  const std::filesystem::path locations_path = "locations.json";

  auto all_locations = JsonLoader::LoadLocations(locations_path, logger_);


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

  logger_->Log(LogLevel::Info, PipelinePhase::Startup,
               std::format("  Locations available: {}", all_locations.size()));
  logger_->Log(LogLevel::Info, PipelinePhase::Startup,
               std::format("  Sampled locations: {}", sampled_locations.size()));
  return sampled_locations;
}
