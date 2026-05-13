/**
 * @file wikipedia/get_summary.cc
 * @brief WikipediaService::GetLocationContext() implementation.
 */

#include <spdlog/spdlog.h>

#include <chrono>
#include <string>
#include <thread>

#include "services/enrichment/wikipedia_service.h"
std::string WikipediaService::GetLocationContext(const Location& loc) {
  using namespace std::literals::chrono_literals;
  if (!this->client_) {
    spdlog::warn("Client is nullptr.");
    return {};
  }

  std::string result;

  // std::string region_query(loc.city);
  // if (!loc.country.empty()) {
  //   region_query += loc.state_province,
  //   region_query += ", ";
  //   region_query += loc.country;
  // }

  constexpr std::string_view brewing_query = "brewing";
  const std::string location_query =
      std::format("{}, {}", loc.city, loc.iso3166_2);
  const std::string beer_query = std::format("beer in {}", loc.country);

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
    append_extract(FetchExtract(brewing_query));
    append_extract(FetchExtract(beer_query));
    spdlog::info("Done fetching for {}. Sleeping for 10 seconds.",
                 location_query);
    std::this_thread::sleep_for(10s);

  } catch (const std::runtime_error& e) {
    spdlog::debug("WikipediaService lookup failed for '{}': {}", location_query,
                  e.what());
  }
  return result;
}
