/**
 * @file wikipedia/fetch_extract.cc
 */

#include <boost/json.hpp>
#include <chrono>
#include <format>
#include <string>
#include <string_view>
#include <thread>

#include "services/enrichment/wikipedia_service.h"

using namespace boost;

std::string WikipediaEnrichmentService::FetchExtract(std::string_view query) {
  const std::string cache_key(query);

  // 1. Cache Lookup
  if (const auto cache_it = this->extract_cache_.find(cache_key);
      cache_it != this->extract_cache_.end()) {
    if (logger_) {
      logger_->Log({.level = LogLevel::Debug,
                    .phase = PipelinePhase::Enrichment,
                    .message = std::format("Wikipedia: Cache hit for {}!", cache_key)});
    }
    return cache_it->second;
  }

  const std::string encoded = this->client_->EncodeURL(cache_key);
  const std::string url = std::format(
      "https://en.wikipedia.org/w/"
      "api.php?action=query&titles={}&prop=extracts&explaintext=1&format=json",
      encoded);

  const std::string body = this->client_->Get(url);
  {
    using namespace std::literals::chrono_literals;
    std::this_thread::sleep_for(1s);
  }

  // 2. Parse JSON
  system::error_code ec;
  json::value doc = json::parse(body, ec);

  if (ec) {
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::Enrichment,
           .message = std::format("WikipediaService: JSON parse error for '{}': {}",
                      std::string(query), ec.message())});
    }
    return {};
  }

  // 3. Safe Extraction
  const json::object* obj = doc.if_object();
  if (obj == nullptr) {
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::Enrichment,
           .message =
               std::format("WikipediaService: Expected root object for '{}'",
               std::string(query))});
    }
    return {};
  }

  const json::value* query_ptr = obj->if_contains("query");
  const json::value* pages_ptr =
      ((query_ptr != nullptr) && query_ptr->is_object())
          ? query_ptr->get_object().if_contains("pages")
          : nullptr;

  if ((pages_ptr == nullptr) || !pages_ptr->is_object()) {
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::Enrichment,
           .message =
               std::format("WikipediaService: Missing query.pages for '{}'",
               std::string(query))});
    }
    return {};
  }

  const json::object& pages = pages_ptr->get_object();

  if (pages.empty()) {
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::Enrichment,
           .message = std::format("WikipediaService: No pages returned for '{}'",
                      std::string(query))});
    }
    this->extract_cache_.emplace(cache_key, "");
    return {};
  }

  // Wikipedia returns the page under a dynamic ID key; we just want the first
  // one
  const json::value& page_val = pages.begin()->value();

  if (!page_val.is_object()) {
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::Enrichment,
           .message =
               std::format("WikipediaService: Unexpected page format for '{}'",
               std::string(query))});
    }
    return {};
  }

  const json::object& page = page_val.get_object();

  // Handle 404/Missing status
  if (page.contains("missing")) {
    if (logger_) {
      logger_->Log({.level = LogLevel::Warn,
                    .phase = PipelinePhase::Enrichment,
                    .message = std::format("WikipediaService: Page '{}' does not exist",
                               std::string(query))});
    }
    this->extract_cache_.emplace(cache_key, "");
    return {};
  }

  const json::value* extract_ptr = page.if_contains("extract");

  if ((extract_ptr == nullptr) || !extract_ptr->is_string()) {
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::Enrichment,
           .message =
               std::format("WikipediaService: No extract string found for '{}'",
               std::string(query))});
    }
    this->extract_cache_.emplace(cache_key, "");
    return {};
  }

  // 4. Success
  std::string extract(extract_ptr->as_string());
  if (logger_) {
    logger_->Log({.level = LogLevel::Info,
                  .phase = PipelinePhase::Enrichment,
                  .message = std::format("WikipediaService: Fetched {} chars for '{}'",
                             extract.size(), std::string(query))});
  }

  this->extract_cache_.insert_or_assign(cache_key, extract);

  return extract;
}
