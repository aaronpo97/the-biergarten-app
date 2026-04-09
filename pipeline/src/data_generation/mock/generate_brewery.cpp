/**
 * @file data_generation/mock/generate_brewery.cpp
 * @brief Builds deterministic brewery names and descriptions by hashing city
 * and country into fixed mock phrase catalogs.
 */

#include <string>

#include "data_generation/mock_generator.h"

auto MockGenerator::GenerateBrewery(const std::string& city_name,
                                    const std::string& country_name,
                                    const std::string& /*region_context*/)
    -> BreweryResult {
   const std::size_t hash = DeterministicHash(city_name, country_name);

   const std::string& adjective =
       kBreweryAdjectives.at(hash % kBreweryAdjectives.size());
   const std::string& noun =
       kBreweryNouns.at((hash / 7) % kBreweryNouns.size());
   const std::string& base_description =
       kBreweryDescriptions.at((hash / 13) % kBreweryDescriptions.size());

   const std::string name = city_name + " " + adjective + " " + noun;
   const std::string description =
       base_description + " Based in " + city_name +
       (country_name.empty() ? std::string(".")
                             : std::string(", ") + country_name + ".");

   return {name, description};
}
