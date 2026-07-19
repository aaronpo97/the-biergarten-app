#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_ENRICHMENT_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_ENRICHMENT_SERVICE_H_

/**
 * @file services/enrichment_service.h
 * @brief Abstraction for resolving contextual enrichment for a location.
 */

#include <string>

#include "data_model/models.h"

/**
 * @brief Interface for services that can enrich a location with context.
 */
class IEnrichmentService {
  public:
   virtual ~IEnrichmentService() = default;

   /**
    * @brief Resolves contextual enrichment for a location.
    *
    * @param loc City to enrich.
    * @return Context text, or an empty string if unavailable.
    */
   virtual std::string GetLocationContext(const City& loc) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ENRICHMENT_ENRICHMENT_SERVICE_H_
