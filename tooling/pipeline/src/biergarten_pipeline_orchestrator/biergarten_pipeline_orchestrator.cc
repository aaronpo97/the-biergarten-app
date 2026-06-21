/**
 * @file biergarten_pipeline_orchestrator/biergarten_pipeline_orchestrator.cc
 * @brief BiergartenDataGenerator constructor implementation.
 */

#include "biergarten_pipeline_orchestrator.h"

#include <utility>

BiergartenPipelineOrchestrator::BiergartenPipelineOrchestrator(
    std::shared_ptr<ILogger> logger,
    std::unique_ptr<IEnrichmentService> context_service,
    std::unique_ptr<DataGenerator> generator,
    std::unique_ptr<IExportService> exporter,
    const ApplicationOptions& app_options)
    : logger_(std::move(logger)),
      context_service_(std::move(context_service)),
      generator_(std::move(generator)),
      exporter_(std::move(exporter)),
      application_options_(app_options) {}
