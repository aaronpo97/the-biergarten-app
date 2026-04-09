/**
 * @file biergarten_data_generator/run.cpp
 * @brief BiergartenDataGenerator::Run() implementation.
 */

#include <spdlog/spdlog.h>

#include "biergarten_data_generator.h"

auto BiergartenDataGenerator::Run() -> bool {
   try {
      const std::unique_ptr<DataGenerator> generator = InitializeGenerator();
      const std::vector<Location> cities = QueryCitiesWithCountries();
      const std::vector<EnrichedCity> enriched = EnrichWithWikipedia(cities);
      this->GenerateBreweries(*generator, enriched);
      this->LogResults();
      return true;
   } catch (const std::exception& e) {
      spdlog::error("Pipeline execution failed with error: {}", e.what());
      return false;
   }
}
