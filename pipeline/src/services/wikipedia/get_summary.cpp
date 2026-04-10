/**
 * @file wikipedia/get_summary.cpp
 * @brief WikipediaService::GetLocationContext() implementation.
 */

#include <spdlog/spdlog.h>

#include <string>

#include "services/wikipedia_service.h"

std::string WikipediaService::GetLocationContext(const Location& loc) {
  if (!client_) {
    return {};
  }

  std::string result;

  std::string region_query(loc.city);
  if (!loc.country.empty()) {
    region_query += ", ";
    region_query += loc.country;
  }

  const std::string beer_query = "beer in " + loc.country;
  const std::string city_beer_query = "beer in " + loc.city;

  auto append_extract = [&result](const std::string& extract) -> void {
    if (extract.empty()) {
      return;
    }
    if (!result.empty()) {
      result += "\n\n";
    }
    result += extract;
  };

  try {
    append_extract(FetchExtract(region_query));
    append_extract(FetchExtract(beer_query));
    append_extract(FetchExtract(city_beer_query));
  } catch (const std::runtime_error& e) {
    spdlog::debug("WikipediaService lookup failed for '{}': {}", region_query,
                  e.what());
  }
  return result;
}
