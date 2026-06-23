#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_WIKIPEDIA_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_WIKIPEDIA_SERVICE_H_

/**
 * @file services/wikipedia_service.h
 * @brief Wikipedia summary retrieval service with in-memory caching.
 */

#include <memory>
#include <string>
#include <string_view>
#include <unordered_map>

#include "enrichment_service.h"
#include "services/logging/logger.h"
#include "web_client/web_client.h"

/**
 * @brief Provides Wikipedia summary lookups backed by cached raw extracts.
 */
class WikipediaEnrichmentService final : public IEnrichmentService {
 public:
  /**
   * @brief Creates a new Wikipedia service with the provided web client.
   */
  explicit WikipediaEnrichmentService(std::unique_ptr<WebClient> client,
                                      std::shared_ptr<ILogger> logger);

  /**
   * @brief Returns the Wikipedia-derived context for a location.
   */
  [[nodiscard]] std::string GetLocationContext(const Location& loc) override;

 private:
  std::string FetchExtract(std::string_view query);
  std::unique_ptr<WebClient> client_;
  std::shared_ptr<ILogger> logger_;
  /**
   * @brief Canonical cache for raw Wikipedia query extracts.
   */
  std::unordered_map<std::string, std::string> extract_cache_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_WIKIPEDIA_SERVICE_H_
