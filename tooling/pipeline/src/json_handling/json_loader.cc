/**
 * @file json_handling/json_loader.cc
 * @brief Parses curated location JSON input into strongly typed Location
 * records with strict field validation and descriptive error reporting.
 */

#include "json_handling/json_loader.h"

#include <boost/json.hpp>
#include <format>
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <string_view>
#include <unordered_map>
#include <utility>

#include "services/logging/logger.h"

static std::string ReadRequiredString(const boost::json::object& object,
                                      const char* key) {
  const boost::json::value* value = object.if_contains(key);
  if (value == nullptr || !value->is_string()) {
    throw std::runtime_error(
        std::format("Missing or invalid string field: {}", key));
  }
  const std::string_view text = value->as_string();
  return std::string(text);
}

static double ReadRequiredNumber(const boost::json::object& object,
                                 const char* key) {
  const boost::json::value* value = object.if_contains(key);
  if (value == nullptr || !value->is_number()) {
    throw std::runtime_error(
        std::format("Missing or invalid numeric field: {}", key));
  }
  return value->to_number<double>();
}

static std::vector<std::string> ReadRequiredStringArray(
    const boost::json::object& object, const char* key) {
  const boost::json::value* value = object.if_contains(key);
  if (value == nullptr || !value->is_array()) {
    throw std::runtime_error(
        std::format("Missing or invalid string array field: {}", key));
  }

  const auto& array = value->as_array();
  std::vector<std::string> items;
  items.reserve(array.size());
  for (const auto& item : array) {
    if (!item.is_string()) {
      throw std::runtime_error(
          std::format("Missing or invalid string array field: {}", key));
    }
    items.emplace_back(item.as_string());
  }
  return items;
}

namespace {

boost::json::value ParseJsonFile(const std::filesystem::path& filepath,
                                 const char* what) {
  std::ifstream input(filepath);
  if (!input.is_open()) {
    throw std::runtime_error(
        std::format("Failed to open {} file: {}", what, filepath.string()));
  }

  std::stringstream buffer;
  buffer << input.rdbuf();

  boost::system::error_code error;
  boost::json::value root = boost::json::parse(buffer.str(), error);
  if (error) {
    throw std::runtime_error(
        std::format("Failed to parse {} JSON: {}", what, error.message()));
  }
  return root;
}

/// @brief Returns the first element of a string array field, falling back to
/// `fallback_key` if `key` is missing/empty (some source entries only have a
/// "localized" form and no "romanized" form).
std::string ReadFirstOfStringArray(const boost::json::object& object,
                                   const char* key, const char* fallback_key) {
  for (const char* candidate_key : {key, fallback_key}) {
    const boost::json::value* value = object.if_contains(candidate_key);
    if (value == nullptr || !value->is_array()) {
      continue;
    }
    const auto& array = value->as_array();
    if (!array.empty() && array.front().is_string()) {
      return std::string(array.front().as_string());
    }
  }
  throw std::runtime_error(
      std::format("Missing or invalid string array field: {}", key));
}

}  // namespace

std::vector<Location> JsonLoader::LoadLocations(
    const std::filesystem::path& filepath, std::shared_ptr<ILogger> logger) {
  const boost::json::value root = ParseJsonFile(filepath, "locations");

  if (!root.is_array()) {
    throw std::runtime_error(
        "Invalid locations JSON: root element must be an array");
  }

  std::vector<Location> locations;
  const auto& items = root.as_array();
  locations.reserve(items.size());

  for (const auto& item : items) {
    if (!item.is_object()) {
      throw std::runtime_error(
          "Invalid locations JSON: each entry must be an object");
    }

    const auto& object = item.as_object();
    locations.push_back(Location{
        .city = ReadRequiredString(object, "city"),
        .state_province = ReadRequiredString(object, "state_province"),
        .iso3166_2 = ReadRequiredString(object, "iso3166_2"),
        .country = ReadRequiredString(object, "country"),
        .iso3166_1 = ReadRequiredString(object, "iso3166_1"),
        .local_languages = ReadRequiredStringArray(object, "local_languages"),
        .latitude = ReadRequiredNumber(object, "latitude"),
        .longitude = ReadRequiredNumber(object, "longitude"),
    });
  }

  return locations;
}

std::vector<UserPersona> JsonLoader::LoadPersonas(
    const std::filesystem::path& filepath, std::shared_ptr<ILogger> logger) {
  const boost::json::value root = ParseJsonFile(filepath, "personas");

  if (!root.is_array()) {
    throw std::runtime_error(
        "Invalid personas JSON: root element must be an array");
  }

  std::vector<UserPersona> personas;
  const auto& items = root.as_array();
  personas.reserve(items.size());

  for (const auto& item : items) {
    if (!item.is_object()) {
      throw std::runtime_error(
          "Invalid personas JSON: each entry must be an object");
    }

    const auto& object = item.as_object();
    personas.push_back(UserPersona{
        .name = ReadRequiredString(object, "name"),
        .description = ReadRequiredString(object, "description"),
        .style_affinities = ReadRequiredStringArray(object, "style_affinities"),
    });
  }

  return personas;
}

NamesByCountry JsonLoader::LoadNamesByCountry(
    const std::filesystem::path& forenames_filepath,
    const std::filesystem::path& surnames_filepath,
    std::shared_ptr<ILogger> logger) {
  const boost::json::value forenames_root =
      ParseJsonFile(forenames_filepath, "forenames-by-country");
  const boost::json::value surnames_root =
      ParseJsonFile(surnames_filepath, "surnames-by-country");

  if (!forenames_root.is_object() || !surnames_root.is_object()) {
    throw std::runtime_error(
        "Invalid names-by-country JSON: root element must be an object "
        "keyed by ISO 3166-1 country code");
  }

  std::unordered_map<std::string, std::vector<ForenameEntry>>
      forenames_by_country;
  for (const auto& [country_code, regions] : forenames_root.as_object()) {
    if (!regions.is_array()) {
      continue;
    }
    std::vector<ForenameEntry> entries;
    for (const auto& region : regions.as_array()) {
      if (!region.is_object()) {
        continue;
      }
      const boost::json::value* names = region.as_object().if_contains("names");
      if (names == nullptr || !names->is_array()) {
        continue;
      }
      for (const auto& name_value : names->as_array()) {
        if (!name_value.is_object()) {
          continue;
        }
        const auto& name_object = name_value.as_object();
        entries.push_back(ForenameEntry{
            .name =
                ReadFirstOfStringArray(name_object, "romanized", "localized"),
            .gender = ReadRequiredString(name_object, "gender"),
        });
      }
    }
    forenames_by_country.emplace(country_code, std::move(entries));
  }

  std::unordered_map<std::string, std::vector<std::string>> surnames_by_country;
  for (const auto& [country_code, name_entries] : surnames_root.as_object()) {
    if (!name_entries.is_array()) {
      continue;
    }
    std::vector<std::string> surnames;
    for (const auto& name_value : name_entries.as_array()) {
      if (!name_value.is_object()) {
        continue;
      }
      surnames.push_back(ReadFirstOfStringArray(name_value.as_object(),
                                                "romanized", "localized"));
    }
    surnames_by_country.emplace(country_code, std::move(surnames));
  }

  return NamesByCountry(std::move(forenames_by_country),
                        std::move(surnames_by_country));
}
