/**
 * @file biergarten_data_generator/biergarten_data_generator.cc
 * @brief BiergartenDataGenerator constructor implementation.
 */

#include "biergarten_data_generator.h"

#include <utility>

BiergartenDataGenerator::BiergartenDataGenerator(
    std::unique_ptr<IEnrichmentService> context_service,
    std::unique_ptr<DataGenerator> generator,
    std::unique_ptr<IExportService> exporter)
    : context_service_(std::move(context_service)),
      generator_(std::move(generator)),
      exporter_(std::move(exporter)) {}
