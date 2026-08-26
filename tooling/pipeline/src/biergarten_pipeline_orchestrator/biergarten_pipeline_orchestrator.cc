/**
 * @file biergarten_pipeline_orchestrator/biergarten_pipeline_orchestrator.cc
 * @brief BiergartenPipelineOrchestrator constructor implementation.
 */

#include "biergarten_pipeline_orchestrator.h"

#include <utility>

BiergartenPipelineOrchestrator::BiergartenPipelineOrchestrator(
    std::shared_ptr<ILogger> logger,
    std::unique_ptr<IEnrichmentService> context_service,
    std::unique_ptr<DataGenerator> generator,
    std::unique_ptr<IExportService> exporter,
    std::unique_ptr<ICuratedDataService> curated_data_service,
    std::unique_ptr<IAddressService> address_service,
    const ApplicationOptions& application_options)
    : logger_(std::move(logger)),
      context_service_(std::move(context_service)),
      generator_(std::move(generator)),
      exporter_(std::move(exporter)),
      curated_data_service_(std::move(curated_data_service)),
      address_service_(std::move(address_service)),
      application_options_(application_options) {}