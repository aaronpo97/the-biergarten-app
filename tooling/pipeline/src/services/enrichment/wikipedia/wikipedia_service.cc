/**
 * @file services/wikipedia/wikipedia_service.cc
 * @brief WikipediaService constructor implementation.
 */

#include "services/enrichment/wikipedia_service.h"

#include <utility>

WikipediaEnrichmentService::WikipediaEnrichmentService(
    std::unique_ptr<WebClient> client)
    : client_(std::move(client)) {}
