#ifndef BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_DATA_GENERATOR_H_

/**
 * @file biergarten_data_generator.h
 * @brief Orchestration for end-to-end brewery data generation pipeline.
 *
 * Intent: Coordinates location loading, enrichment, and generation phases
 * to produce a complete dataset. Coordinates dependencies via composition root.
 */

#include <memory>
#include <span>
#include <vector>

#include "data_generation/data_generator.h"
#include "data_model/generated_models.h"
#include "services/database/export_service.h"
#include "services/enrichment/enrichment_service.h"

#include "services/logging/logger.h"

/**
 * @brief Main data generator class for the Biergarten pipeline.
 *
 * This class encapsulates the core logic for generating brewery data.
 * It handles location loading, city enrichment, and brewery generation.
 */
class BiergartenPipelineOrchestrator {
 public:
/**
 * @brief Constructs the orchestrator with injected pipeline dependencies.
 *
 * @param context_service Provides regional context for locations.
 * @param generator Implementation (Llama or Mock) for brewery/user generation.
 * @param exporter Database backend for persisting generated records.
 * @param application_options CLI configuration and paths.
 */
  BiergartenPipelineOrchestrator(
      std::shared_ptr<ILogger> logger,
      std::unique_ptr<IEnrichmentService> context_service,
      std::unique_ptr<DataGenerator> generator,
      std::unique_ptr<IExportService> exporter,
      const ApplicationOptions& application_options);

  /**
   * @brief Run the data generation pipeline.
   *
   * Performs the following steps:
   * 1. Load curated locations from JSON
   * 2. Resolve context for each city using the injected context service
   * 3. Generate brewery data for sampled cities
   *
   * @note STRUCTURAL CONCURRENCY REQUIREMENT:
   * When transitioned to a multithreaded design, this method MUST structurally
   * enforce that all deployed worker threads are joined before returning (e.g.
   * by using std::jthread or a structured concurrency primitive). This ensures
   * workers do not attempt to log to a closed channel during application teardown.
   *
   * @return true if successful, false if not
   */
  bool Run();

 private:
  /// @brief Logger instance for emitting pipeline messages.
  std::shared_ptr<ILogger> logger_;

  /// @brief Owning context provider dependency.
  std::unique_ptr<IEnrichmentService> context_service_;

  /// @brief Generator dependency selected in the composition root.
  std::unique_ptr<DataGenerator> generator_;

   /// @brief Storage backend for generated brewery records.
   std::unique_ptr<IExportService> exporter_;

   /// @brief CLI configuration: paths, model settings, generation parameters.
   ApplicationOptions application_options_;

  /**
   * @brief Load locations from JSON and sample cities.
   *
   * @return Vector of sampled locations capped at 50 entries.
   */
  std::vector<Location> QueryCitiesWithCountries();

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
   * Loads personas.json / forenames-by-country.json / surnames-by-country.json
   * itself, mirroring how QueryCitiesWithCountries() owns its own
   * locations.json load.
   *
   * @param cities Span of enriched city data.
   */
  void GenerateUsers(std::span<const EnrichedCity> cities);

  /**
   * @brief Log the generated brewery results.
   */
  void LogResults() const;

  /// @brief Stores generated brewery data.
  std::vector<GeneratedBrewery> generated_breweries_;

  /// @brief Stores generated user data.
  std::vector<GeneratedUser> generated_users_;
};
#endif  // BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_DATA_GENERATOR_H_
