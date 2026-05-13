/**
 * @file wikipedia/fetch_extract.cc
 */

#include <spdlog/spdlog.h>

#include <boost/json.hpp>
#include <format>
#include <string>
#include <string_view>

#include "services/enrichment/wikipedia_service.h"

using namespace boost;

std::string WikipediaService::FetchExtract(std::string_view query) {

  const std::string cache_key(query);

  // 1. Cache Lookup
  if (const auto cache_it = this->extract_cache_.find(cache_key);
      cache_it != this->extract_cache_.end()) {
    spdlog::debug("Wikipedia: Cache hit for {}!", cache_key);
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
    spdlog::warn("WikipediaService: JSON parse error for '{}': {}", query,
                 ec.message());
    return {};
  }

  // 3. Safe Extraction
  const json::object* obj = doc.if_object();
  if (!obj) {
    spdlog::warn("WikipediaService: Expected root object for '{}'", query);
    return {};
  }

  const json::value* query_ptr = obj->if_contains("query");
  const json::value* pages_ptr =
      (query_ptr && query_ptr->is_object())
          ? query_ptr->get_object().if_contains("pages")
          : nullptr;

  if (!pages_ptr || !pages_ptr->is_object()) {
    spdlog::warn("WikipediaService: Missing query.pages for '{}'", query);
    return {};
  }

  const json::object& pages = pages_ptr->get_object();
  if (pages.empty()) {
    spdlog::warn("WikipediaService: No pages returned for '{}'", query);
    this->extract_cache_.emplace(cache_key, "");
    return {};
  }

  // Wikipedia returns the page under a dynamic ID key; we just want the first
  // one
  const json::value& page_val = pages.begin()->value();
  if (!page_val.is_object()) {
    spdlog::warn("WikipediaService: Unexpected page format for '{}'", query);
    return {};
  }

  const json::object& page = page_val.get_object();

  // Handle 404/Missing status
  if (page.contains("missing")) {
    spdlog::warn("WikipediaService: Page '{}' does not exist", query);
    this->extract_cache_.emplace(cache_key, "");
    return {};
  }

  const json::value* extract_ptr = page.if_contains("extract");
  if (!extract_ptr || !extract_ptr->is_string()) {
    spdlog::warn("WikipediaService: No extract string found for '{}'", query);
    this->extract_cache_.emplace(cache_key, "");
    return {};
  }

  // 4. Success
  std::string extract(extract_ptr->as_string());
  spdlog::info("WikipediaService: Fetched {} chars for '{}'", extract.size(),
                query);

  this->extract_cache_.insert_or_assign(cache_key, extract);
  return extract;
}