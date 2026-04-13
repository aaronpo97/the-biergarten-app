/**
 * @file wikipedia/fetch_extract.cc
 * @brief WikipediaService::FetchExtract() implementation.
 */

#include <spdlog/spdlog.h>

#include <boost/json.hpp>
#include <string>
#include <string_view>

#include "services/wikipedia_service.h"

std::string WikipediaService::FetchExtract(std::string_view query) {
  const std::string cache_key(query);
  const auto cache_it = this->extract_cache_.find(cache_key);
  if (cache_it != this->extract_cache_.end()) {
    return cache_it->second;
  }

  const std::string encoded = this->client_->UrlEncode(cache_key);
  const std::string url =
      "https://en.wikipedia.org/w/api.php?action=query&titles=" + encoded +
      "&prop=extracts&explaintext=1&format=json";

  const std::string body = this->client_->Get(url);

  boost::system::error_code parse_error;
  boost::json::value doc = boost::json::parse(body, parse_error);

  if (!parse_error && doc.is_object()) {
    try {
      auto& pages = doc.at("query").at("pages").get_object();
      if (!pages.empty()) {
        auto& page = pages.begin()->value().get_object();
        if (page.contains("extract") && page.at("extract").is_string()) {
          const std::string_view extract_view = page.at("extract").as_string();
          std::string extract(extract_view);

          spdlog::debug("WikipediaService fetched {} chars for '{}'",
                        extract.size(), query);

          this->extract_cache_.emplace(cache_key, extract);
          return extract;
        }
      }
      this->extract_cache_.emplace(cache_key, std::string{});
    } catch (const std::exception& e) {
      spdlog::warn(
          "WikipediaService: failed to parse response structure for '{}': "
          "{}",
          query, e.what());
      return {};
    }
  } else if (parse_error) {
    spdlog::warn("WikipediaService: JSON parse error for '{}': {}", query,
                 parse_error.message());
  }

  return {};
}
