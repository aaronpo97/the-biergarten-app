/**
 * @file biergarten_data_generator/constructor.cpp
 * @brief BiergartenDataGenerator constructor implementation.
 */

#include <utility>

#include "biergarten_data_generator.h"

BiergartenDataGenerator::BiergartenDataGenerator(
    std::shared_ptr<IEnrichmentService> context_service,
    std::unique_ptr<DataGenerator> generator)
    : context_service_(std::move(context_service)),
      generator_(std::move(generator)) {}
