/**
 * @file wikipedia/fetch_extract.cpp
 * @brief WikipediaService::FetchExtract() implementation.
 */

#include <spdlog/spdlog.h>

#include <boost/json.hpp>
#include <string>
#include <string_view>

#include "services/wikipedia_service.h"

auto WikipediaService::FetchExtract(std::string_view query) const
    -> std::string {
   const std::string encoded = client_->UrlEncode(std::string(query));
   const std::string url =
       "https://en.wikipedia.org/w/api.php?action=query&titles=" + encoded +
       "&prop=extracts&explaintext=1&format=json";

   const std::string body = client_->Get(url);

   boost::system::error_code ec;
   boost::json::value doc = boost::json::parse(body, ec);

   if (!ec && doc.is_object()) {
      try {
         auto& pages = doc.at("query").at("pages").get_object();
         if (!pages.empty()) {
            auto& page = pages.begin()->value().get_object();
            if (page.contains("extract") && page.at("extract").is_string()) {
               std::string extract(page.at("extract").as_string().c_str());
               spdlog::debug("WikipediaService fetched {} chars for '{}'",
                             extract.size(), query);
               return extract;
            }
         }
      } catch (const std::exception& e) {
         spdlog::warn(
             "WikipediaService: failed to parse response structure for '{}': "
             "{}",
             query, e.what());
         return {};
      }
   } else if (ec) {
      spdlog::warn("WikipediaService: JSON parse error for '{}': {}", query,
                   ec.message());
   }

   return {};
}
