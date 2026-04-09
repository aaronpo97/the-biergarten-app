/**
 * @file wikipedia/constructor.cpp
 * @brief WikipediaService constructor implementation.
 */

#include <utility>

#include "wikipedia/wikipedia_service.h"

WikipediaService::WikipediaService(std::shared_ptr<WebClient> client)
    : client_(std::move(client)) {}
