/**
 * @file wikipedia/get_summary.cpp
 * @brief WikipediaService::GetSummary() implementation.
 */

#include <spdlog/spdlog.h>

#include <string>

#include "wikipedia/wikipedia_service.h"

auto WikipediaService::GetSummary(std::string_view city,
                                  std::string_view country) -> std::string {
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

   const std::string beerQuery = "beer in " + std::string(country);

   try {
      const std::string regionExtract = FetchExtract(regionQuery);
      const std::string beerExtract = FetchExtract(beerQuery);

      if (!regionExtract.empty()) {
         result += regionExtract;
      }
      if (!beerExtract.empty()) {
         if (!result.empty()) {
            result += "\n\n";
         }
         result += beerExtract;
      }
   } catch (const std::runtime_error& e) {
      spdlog::debug("WikipediaService lookup failed for '{}': {}", regionQuery,
                    e.what());
   }

   cache_.emplace(key, result);
   return result;
}
