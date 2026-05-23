/**
 * @file json_handling/json_loader.cc
 * @brief Parses curated location JSON input into strongly typed Location
 * records with strict field validation and descriptive error reporting.
 */

#include "json_handling/json_loader.h"

#include <format>
#include "services/logging/logger.h"
#include <iostream>

#include <boost/json.hpp>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <string_view>

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

std::vector<Location> JsonLoader::LoadLocations(
    const std::filesystem::path& filepath, std::shared_ptr<ILogger> logger) {
  std::ifstream input(filepath);
  if (!input.is_open()) {
    throw std::runtime_error("Failed to open locations file: " +
                             filepath.string());
  }

  std::stringstream buffer;
  buffer << input.rdbuf();
  const std::string content = buffer.str();

  boost::system::error_code error;
  boost::json::value root = boost::json::parse(content, error);
  if (error) {
    throw std::runtime_error("Failed to parse locations JSON: " +
                             error.message());
  }

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
