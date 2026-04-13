/**
 * @file biergarten_data_generator/query_cities_with_countries.cc
 * @brief BiergartenDataGenerator::QueryCitiesWithCountries() implementation.
 */

#include "biergarten_data_generator.h"

#include <algorithm>
#include <filesystem>
#include <iterator>
#include <random>

#include <spdlog/spdlog.h>

#include "json_handling/json_loader.h"

static constexpr std::size_t kBreweryAmount = 4;

std::vector<Location> BiergartenDataGenerator::QueryCitiesWithCountries() {
  spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

  const std::filesystem::path locations_path = "locations.json";

  auto all_locations = JsonLoader::LoadLocations(locations_path);
  spdlog::info("  Locations available: {}", all_locations.size());

  const std::size_t sample_count =
      std::min(kBreweryAmount, all_locations.size());
  const auto sample_count_signed =
      static_cast<std::iter_difference_t<decltype(all_locations.cbegin())>>(
          sample_count);
  std::vector<Location> sampled_locations;
  sampled_locations.reserve(sample_count);

  std::random_device random_generator;
  std::ranges::sample(all_locations, std::back_inserter(sampled_locations),
                      sample_count_signed, random_generator);

  spdlog::info("  Sampled locations: {}", sampled_locations.size());
  return sampled_locations;
}
