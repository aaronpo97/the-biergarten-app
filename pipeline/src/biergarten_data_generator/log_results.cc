/**
 * @file biergarten_data_generator/log_results.cc
 * @brief BiergartenDataGenerator::LogResults() implementation.
 */

#include <spdlog/spdlog.h>

#include "biergarten_data_generator.h"

void BiergartenDataGenerator::LogResults() const {
  spdlog::info("\n=== GENERATED DATA DUMP ===");
  size_t index = 1;
  for (const auto& [location, brewery] : generated_breweries_) {
    spdlog::info(
        "{}. city=\"{}\" country=\"{}\" state=\"{}\" "
        "iso3166_2={} lat={} lon={}",
        index, location.city, location.country, location.state_province,
        location.iso3166_2, location.latitude, location.longitude);
    spdlog::info("   brewery_name_en=\"{}\"", brewery.name_en);
    spdlog::info("   brewery_description_en=\"{}\"",
                 brewery.description_en);
    spdlog::info("   brewery_name_local=\"{}\"", brewery.name_local);
    spdlog::info("   brewery_description_local=\"{}\"",
                 brewery.description_local);
    ++index;
  }
}
