/**
 * @file data_generation/mock/generate_brewery.cc
 * @brief Builds deterministic brewery names and descriptions by hashing city
 * and country into fixed mock phrase catalogs.
 */

#include <format>
#include <string>
#include <string_view>

#include "data_generation/mock_generator.h"

BreweryResult MockGenerator::GenerateBrewery(
    const Location& location, const std::string& /*region_context*/) {
  const size_t hash = DeterministicHash(location);

  const std::string_view adjective =
      kBreweryAdjectives.at(hash % kBreweryAdjectives.size());
  const std::string_view noun =
      kBreweryNouns.at(hash / 7 % kBreweryNouns.size());
  const std::string_view base_description =
      kBreweryDescriptions.at((hash / 13) % kBreweryDescriptions.size());

  const std::string name =
      std::format("{} {} {}", location.city, adjective, noun);

  const std::string state_suffix =
      location.state_province.empty()
          ? std::string{}
          : std::format(", {}", location.state_province);
  const std::string country_suffix =
      location.country.empty() ? std::string{}
                               : std::format(", {}", location.country);
  const std::string description =
      std::format("{} Located in {}{}{}.", base_description, location.city,
                  state_suffix, country_suffix);

  return {
      .name_en = name,
      .description_en = description,
      .name_local = name,
      .description_local = description,
  };
}
