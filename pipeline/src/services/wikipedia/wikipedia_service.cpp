/**
 * @file services/wikipedia/wikipedia_service.cpp
 * @brief WikipediaService constructor implementation.
 */

#include "services/wikipedia_service.h"

#include <utility>

WikipediaService::WikipediaService(std::unique_ptr<WebClient> client)
    : client_(std::move(client)) {}
