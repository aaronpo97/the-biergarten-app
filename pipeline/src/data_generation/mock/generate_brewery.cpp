#include <functional>
#include <string>

#include "data_generation/mock_generator.h"

BreweryResult MockGenerator::GenerateBrewery(
    const std::string& city_name, const std::string& country_name,
    const std::string& region_context) {
   const std::string location_key =
       country_name.empty() ? city_name : city_name + "," + country_name;
   const std::size_t hash =
       region_context.empty() ? std::hash<std::string>{}(location_key)
                              : DeterministicHash(location_key, region_context);

   BreweryResult result;
   result.name = kBreweryAdjectives[hash % kBreweryAdjectives.size()] + " " +
                 kBreweryNouns[(hash / 7) % kBreweryNouns.size()];
   result.description =
       kBreweryDescriptions[(hash / 13) % kBreweryDescriptions.size()];
   return result;
}
