/**
 * @file biergarten_data_generator/query_cities_with_countries.cpp
 * @brief BiergartenDataGenerator::QueryCitiesWithCountries() implementation.
 */

#include <spdlog/spdlog.h>

#include <algorithm>
#include <filesystem>
#include <random>

#include "biergarten_data_generator.h"
#include "json_handling/json_loader.h"

static constexpr unsigned int brewery_amount = 4;

auto BiergartenDataGenerator::QueryCitiesWithCountries()
    -> std::vector<Location> {
   spdlog::info("\n=== GEOGRAPHIC DATA OVERVIEW ===");

   const std::filesystem::path locations_path = "locations.json";

   auto all_locations = JsonLoader::LoadLocations(locations_path.string());
   spdlog::info("  Locations available: {}", all_locations.size());

   const size_t sample_count =
       std::min<size_t>(brewery_amount, all_locations.size());
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
