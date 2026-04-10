/**
 * @file biergarten_data_generator/biergarten_data_generator.cpp
 * @brief BiergartenDataGenerator constructor implementation.
 */

#include "biergarten_data_generator.h"

#include <utility>

BiergartenDataGenerator::BiergartenDataGenerator(
    std::unique_ptr<IEnrichmentService> context_service,
    std::unique_ptr<DataGenerator> generator)
    : context_service_(std::move(context_service)),
      generator_(std::move(generator)) {}
