/**
 * @file wikipedia/get_summary.cpp
 * @brief WikipediaService::GetLocationContext() implementation.
 */

#include <spdlog/spdlog.h>

#include <string>

#include "services/wikipedia_service.h"

auto WikipediaService::GetLocationContext(const Location& loc) -> std::string {
   const std::string cache_key = loc.city + "|" + loc.country;
   const auto cache_it = cache_.find(cache_key);
   if (cache_it != cache_.end()) {
      return cache_it->second;
   }

   std::string result;

   if (!client_) {
      cache_.emplace(cache_key, result);
      return result;
   }

   std::string region_query(loc.city);
   if (!loc.country.empty()) {
      region_query += ", ";
      region_query += loc.country;
   }

   const std::string beer_query = "beer in " + loc.country;

   try {
      const std::string region_extract = FetchExtract(region_query);
      const std::string beer_extract = FetchExtract(beer_query);

      if (!region_extract.empty()) {
         result += region_extract;
      }
      if (!beer_extract.empty()) {
         if (!result.empty()) {
            result += "\n\n";
         }
         result += beer_extract;
      }
   } catch (const std::runtime_error& e) {
      spdlog::debug("WikipediaService lookup failed for '{}': {}", region_query,
                    e.what());
   }

   cache_.emplace(cache_key, result);
   return result;
}
