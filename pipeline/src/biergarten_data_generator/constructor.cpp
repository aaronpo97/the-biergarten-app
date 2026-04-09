/**
 * @file biergarten_data_generator/constructor.cpp
 * @brief BiergartenDataGenerator constructor implementation.
 */

#include <utility>

#include "biergarten_data_generator.h"

BiergartenDataGenerator::BiergartenDataGenerator(
   ApplicationOptions const& options, std::shared_ptr<WebClient> web_client)
   : options_(options), webClient_(std::move(web_client)) {
}