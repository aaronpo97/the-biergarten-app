#ifndef BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_DATA_GENERATOR_H_

/**
 * @file biergarten_data_generator.h
 * @brief Core orchestration class for pipeline data generation.
 */

#include <memory>
#include <span>
#include <vector>

#include "data_generation/data_generator.h"
#include "data_model/enriched_city.h"
#include "data_model/generated_brewery.h"
#include "data_model/location.h"
#include "services/enrichment_service.h"
#include "services/export_service.h"

/**
 * @brief Main data generator class for the Biergarten pipeline.
 *
 * This class encapsulates the core logic for generating brewery data.
 * It handles location loading, city enrichment, and brewery generation.
 */
class BiergartenDataGenerator {
 public:
  /**
   * @brief Construct a BiergartenDataGenerator with injected dependencies.
   *
   * @param context_service Context provider for sampled locations.
   * @param generator Brewery and user data generator.
   * @param exporter Storage backend for generated brewery data.
   */
  BiergartenDataGenerator(std::unique_ptr<IEnrichmentService> context_service,
                          std::unique_ptr<DataGenerator> generator,
                          std::unique_ptr<IExportService> exporter);

  /**
   * @brief Run the data generation pipeline.
   *
   * Performs the following steps:
   * 1. Load curated locations from JSON
   * 2. Resolve context for each city using the injected context service
   * 3. Generate brewery data for sampled cities
   *
   * @return true if successful, false if not
   */
  bool Run();

 private:
  /// @brief Owning context provider dependency.
  std::unique_ptr<IEnrichmentService> context_service_;

  /// @brief Generator dependency selected in the composition root.
  std::unique_ptr<DataGenerator> generator_;

  /// @brief Storage backend for generated brewery records.
  std::unique_ptr<IExportService> exporter_;

  /**
   * @brief Load locations from JSON and sample cities.
   *
   * @return Vector of sampled locations capped at 50 entries.
   */
  static std::vector<Location> QueryCitiesWithCountries();

  /**
   * @brief Generate breweries for enriched cities.
   *
   * @param cities Span of enriched city data.
   */
  void GenerateBreweries(std::span<const EnrichedCity> cities);

  /**
   * @brief Log the generated brewery results.
   */
  void LogResults() const;

  /// @brief Stores generated brewery data.
  std::vector<GeneratedBrewery> generated_breweries_;
};
#endif  // BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_DATA_GENERATOR_H_
