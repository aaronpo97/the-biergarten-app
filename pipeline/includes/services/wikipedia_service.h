#ifndef BIERGARTEN_PIPELINE_WIKIPEDIA_SERVICE_H_
#define BIERGARTEN_PIPELINE_WIKIPEDIA_SERVICE_H_

/**
 * @file services/wikipedia_service.h
 * @brief Wikipedia summary retrieval service with in-memory caching.
 */

#include <memory>
#include <string>
#include <string_view>
#include <unordered_map>

#include "services/enrichment_service.h"
#include "web_client/web_client.h"

/// @brief Provides cached Wikipedia summary lookups for city and country pairs.
class WikipediaService final : public IEnrichmentService {
  public:
   /// @brief Creates a new Wikipedia service with the provided web client.
   explicit WikipediaService(std::shared_ptr<WebClient> client);

   /// @brief Returns the Wikipedia-derived context for a location.
   [[nodiscard]] std::string GetLocationContext(const Location& loc) override;

  private:
   std::string FetchExtract(std::string_view query) const;
   std::shared_ptr<WebClient> client_;
   std::unordered_map<std::string, std::string> cache_;
};

#endif  // BIERGARTEN_PIPELINE_WIKIPEDIA_SERVICE_H_
