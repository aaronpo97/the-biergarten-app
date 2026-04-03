#include "wikipedia/wikipedia_service.h"

#include <spdlog/spdlog.h>

#include <boost/json.hpp>

WikipediaService::WikipediaService(std::shared_ptr<WebClient> client)
    : client_(std::move(client)) {}

std::string WikipediaService::FetchExtract(std::string_view query) {
   const std::string encoded = client_->UrlEncode(std::string(query));
   const std::string url =
       "https://en.wikipedia.org/w/api.php?action=query&titles=" + encoded +
       "&prop=extracts&explaintext=true&format=json";

   const std::string body = client_->Get(url);

   boost::system::error_code ec;
   boost::json::value doc = boost::json::parse(body, ec);

   if (!ec && doc.is_object()) {
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
   }

   return {};
}

std::string WikipediaService::GetSummary(std::string_view city,
                                         std::string_view country) {
   const std::string key = std::string(city) + "|" + std::string(country);
   const auto cacheIt = cache_.find(key);
   if (cacheIt != cache_.end()) {
      return cacheIt->second;
   }

   std::string result;

   if (!client_) {
      cache_.emplace(key, result);
      return result;
   }

   std::string regionQuery(city);
   if (!country.empty()) {
      regionQuery += ", ";
      regionQuery += country;
   }

   const std::string beerQuery = "beer in " + std::string(city);

   try {
      const std::string regionExtract = FetchExtract(regionQuery);
      const std::string beerExtract = FetchExtract(beerQuery);

      if (!regionExtract.empty()) {
         result += regionExtract;
      }
      if (!beerExtract.empty()) {
         if (!result.empty()) result += "\n\n";
         result += beerExtract;
      }
   } catch (const std::runtime_error& e) {
      spdlog::debug("WikipediaService lookup failed for '{}': {}", regionQuery,
                    e.what());
   }

   cache_.emplace(key, result);
   return result;
}
