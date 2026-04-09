/**
 * @file biergarten_data_generator/enrich_with_wikipedia.cpp
 * @brief BiergartenDataGenerator::EnrichWithWikipedia() implementation.
 */

#include <spdlog/spdlog.h>

#include <atomic>
#include <future>
#include <optional>

#include "biergarten_data_generator.h"
#include "wikipedia/wikipedia_service.h"

static auto TryGetRegionContext(
    const std::shared_ptr<WebClient>& web_client, const Location* city_ptr,
    std::atomic<size_t>* skipped_enrichment_count) noexcept
    -> std::optional<std::string> {
   try {
      WikipediaService wikipedia_service(web_client);
      return wikipedia_service.GetSummary(city_ptr->city, city_ptr->country);
   } catch (...) {
      skipped_enrichment_count->fetch_add(1, std::memory_order_relaxed);
      return std::nullopt;
   }
}

auto BiergartenDataGenerator::EnrichWithWikipedia(
    const std::vector<Location>& cities) -> std::vector<EnrichedCity> {
   std::vector<EnrichedCity> enriched;
   enriched.reserve(cities.size());

   std::atomic<size_t> skipped_enrichment_count = 0;
   std::vector<std::future<std::optional<std::string>>> pending;
   pending.reserve(cities.size());

   for (const auto& city : cities) {
      const Location* city_ptr = &city;
      pending.push_back(std::async(std::launch::async, TryGetRegionContext,
                                   webClient_, city_ptr,
                                   &skipped_enrichment_count));
   }

   auto city_it = cities.cbegin();
   for (auto& task : pending) {
      auto maybe_region_context = task.get();
      if (maybe_region_context.has_value()) {
         spdlog::debug("[Pipeline] Region context for {}: {}", city_it->city,
                       *maybe_region_context);
         enriched.push_back(
             EnrichedCity{.location = *city_it,
                          .region_context = std::move(*maybe_region_context)});
      }
      ++city_it;
   }

   if (skipped_enrichment_count.load(std::memory_order_relaxed) > 0) {
      spdlog::warn(
          "[Pipeline] Skipped {} city/cities due to Wikipedia enrichment "
          "errors",
          skipped_enrichment_count.load(std::memory_order_relaxed));
   }

   return enriched;
}
