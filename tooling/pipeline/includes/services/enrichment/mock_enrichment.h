#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_MOCK_ENRICHMENT_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_MOCK_ENRICHMENT_H_

/**
 * @file services/enrichment/mock_enrichment.h
 * @brief No-op IEnrichmentService used when network enrichment is disabled.
 */

#include <string>

#include "services/enrichment/enrichment_service.h"

/**
 * @brief Enrichment service that returns no context for any location.
 */
class MockEnrichmentService final : public IEnrichmentService {
 public:
  std::string GetLocationContext(const City& /*loc*/) override {
    return {};
  }
};
#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_MOCK_ENRICHMENT_H_
