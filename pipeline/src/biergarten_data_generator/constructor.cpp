/**
 * @file biergarten_data_generator/constructor.cpp
 * @brief BiergartenDataGenerator constructor implementation.
 */

#include <utility>

#include "biergarten_data_generator.h"

BiergartenDataGenerator::BiergartenDataGenerator(
    ApplicationOptions options, std::unique_ptr<WebClient> web_client)
    : options_(std::move(options)), webClient_(std::move(web_client)) {}
