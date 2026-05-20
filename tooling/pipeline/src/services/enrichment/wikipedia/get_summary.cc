/**
 * @file wikipedia/get_summary.cc
 * @brief WikipediaService::GetLocationContext() implementation.
 */

#include <chrono>
#include <format>
#include <string>
#include <thread>

#include "services/enrichment/wikipedia_service.h"

std::string WikipediaEnrichmentService::GetLocationContext(
    const Location& loc) {
  using namespace std::literals::chrono_literals;
  if (!this->client_) {
    if (logger_) {
      logger_->Log({.level = LogLevel::Warn,
                    .phase = PipelinePhase::UserGeneration,
                    .message = "Wikipedia client is nullptr."});
    }
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
    if (logger_) {
      logger_->Log({.level = LogLevel::Info,
                    .phase = PipelinePhase::UserGeneration,
                    .message = std::format("Done fetching for {}. Sleeping for 10 seconds.",
                               location_query)});
    }
    std::this_thread::sleep_for(10s);

  } catch (const std::runtime_error& e) {
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Debug,
           .phase = PipelinePhase::UserGeneration,
           .message = std::format("WikipediaService lookup failed for '{}': {}",
                      location_query, e.what())});
    }
  }
  return result;
}
