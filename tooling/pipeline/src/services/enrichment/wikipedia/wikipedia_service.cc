/**
 * @file services/wikipedia/wikipedia_service.cc
 * @brief WikipediaEnrichmentService constructor implementation.
 */

#include "services/enrichment/wikipedia_service.h"

#include <utility>

WikipediaEnrichmentService::WikipediaEnrichmentService(
    std::unique_ptr<WebClient> client, std::shared_ptr<ILogger> logger)
    : client_(std::move(client)), logger_(std::move(logger)) {}
