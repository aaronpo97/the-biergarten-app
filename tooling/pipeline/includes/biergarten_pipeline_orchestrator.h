#ifndef BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_ORCHESTRATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_ORCHESTRATOR_H_

/**
 * @file biergarten_pipeline_orchestrator.h
 * @brief Orchestration for end-to-end brewery and user data generation.
 */

#include <memory>
#include <span>
#include <vector>

#include "data_generation/data_generator.h"
#include "data_model/generated_models.h"
#include "services/address/address_service.h"
#include "services/curated_data/curated_data_service.h"
#include "services/database/export_service.h"
#include "services/enrichment/enrichment_service.h"
#include "services/logging/logger.h"

/**
 * @brief Main orchestrator for the Biergarten data generation pipeline.
 *
 * Handles location loading, city enrichment, and brewery/user generation.
 */
class BiergartenPipelineOrchestrator {
  public:
   /**
    * @brief Constructs the orchestrator with injected pipeline dependencies.
    *
    * @param logger Sink for pipeline diagnostics.
    * @param context_service Provides regional context for locations.
    * @param generator Implementation (Llama or Mock) for brewery/user
    * generation.
    * @param exporter Database backend for persisting generated records.
    * @param curated_data_service Loads curated location, persona, and name
    * data used to seed generation.
    * @param address_service Resolves a street address for generated
    * brewery coordinates.
    * @param application_options CLI configuration and paths.
    */
   BiergartenPipelineOrchestrator(
       std::shared_ptr<ILogger> logger,
       std::unique_ptr<IEnrichmentService> context_service,
       std::unique_ptr<DataGenerator> generator,
       std::unique_ptr<IExportService> exporter,
       std::unique_ptr<ICuratedDataService> curated_data_service,
       std::unique_ptr<IAddressService> address_service,
       const ApplicationOptions& application_options);

   /**
    * @brief Run the data generation pipeline.
    *
    * Performs the following steps:
    * 1. Load curated locations from JSON
    * 2. Resolve context for each city using the injected context service
    * 3. Generate brewery and user data for sampled cities
    *
    * @note STRUCTURAL CONCURRENCY REQUIREMENT:
    * When transitioned to a multithreaded design, this method MUST
    * structurally enforce that all deployed worker threads are joined before
    * returning (e.g. by using std::jthread or a structured concurrency
    * primitive). This ensures workers do not attempt to log to a closed
    * channel during application teardown.
    *
    * @return true if successful, false if not
    */
   bool Run();

  private:
   std::shared_ptr<ILogger> logger_;
   std::unique_ptr<IEnrichmentService> context_service_;

   /**
    * @brief Generator implementation selected at the composition root (Llama
    * or Mock).
    */
   std::unique_ptr<DataGenerator> generator_;

   /**
    * @brief Storage backend for generated brewery and user records.
    */
   std::unique_ptr<IExportService> exporter_;
   std::unique_ptr<ICuratedDataService> curated_data_service_;
   std::unique_ptr<IAddressService> address_service_;

   ApplicationOptions application_options_;

   /**
    * @brief Load locations from JSON and sample cities.
    *
    * @return Vector of locations randomly sampled per
    * PipelineOptions::location_count.
    */
   std::vector<City> QueryLocations();

   /**
    * @brief Generate breweries for enriched cities.
    *
    * @param cities Span of enriched city data.
    */
   void GenerateBreweries(std::span<const EnrichedCity> cities);

   /**
    * @brief Generate users grounded in sampled names and personas for
    * enriched cities.
    *
    * @param cities Span of enriched city data.
    */
   void GenerateUsers(std::span<const EnrichedCity> cities);

   /**
    * @brief Log the generated brewery and user results.
    */
   void LogResults() const;

   std::vector<BreweryRecord> generated_breweries_;
   std::vector<UserRecord> generated_users_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_ORCHESTRATOR_H_
