//
// Created by aaronpo on 13/05/2026.
//

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_MOCK_ENRICHMENT_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_MOCK_ENRICHMENT_H_
#include <string>

#include "enrichment_service.h"

class MockEnrichmentService final : public IEnrichmentService {
 public:
  std::string GetLocationContext(const Location& /*loc*/) override {
    return {};
  }
};
#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_MOCK_ENRICHMENT_H_
