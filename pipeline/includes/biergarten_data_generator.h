#ifndef BIERGARTEN_PIPELINE_BIERGARTEN_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_BIERGARTEN_DATA_GENERATOR_H_

/**
 * @file biergarten_data_generator.h
 * @brief Core orchestration class for pipeline data generation.
 */

#include <cstdint>
#include <memory>
#include <string>
#include <vector>

#include "data_generation/data_generator.h"
#include "data_model/location.h"
#include "services/enrichment_service.h"

/**
 * @brief Program options for the Biergarten pipeline application.
 */
struct ApplicationOptions {
   /// @brief Path to the LLM model file (gguf format); mutually exclusive with
   /// use_mocked.
   std::string model_path;

   /// @brief Use mocked generator instead of LLM; mutually exclusive with
   /// model_path.
   bool use_mocked = false;

   /// @brief LLM sampling temperature (0.0 to 1.0, higher = more random).
   float temperature = 0.8f;

   /// @brief LLM nucleus sampling top-p parameter (0.0 to 1.0, higher = more
   /// random).
   float top_p = 0.92f;

   /// @brief Context window size (tokens) for LLM inference. Higher values
   /// support longer prompts but use more memory.
   uint32_t n_ctx = 2048;

   /// @brief Random seed for sampling (-1 for random, otherwise non-negative).
   int seed = -1;
};

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
    */
   BiergartenDataGenerator(std::shared_ptr<IEnrichmentService> context_service,
                           std::unique_ptr<DataGenerator> generator);

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
   /// @brief Shared context provider dependency.
   std::shared_ptr<IEnrichmentService> context_service_;

   /// @brief Generator dependency selected in the composition root.
   std::unique_ptr<DataGenerator> generator_;

   /**
    * @brief Enriched city data with Wikipedia context.
    */
   struct EnrichedCity {
      Location location;
      std::string region_context;
   };

   /**
    * @brief Load locations from JSON and sample cities.
    *
    * @return Vector of sampled locations capped at 30 entries.
    */
   static std::vector<Location> QueryCitiesWithCountries();

   /**
    * @brief Generate breweries for enriched cities.
    *
    * @param cities Vector of enriched city data.
    */
   void GenerateBreweries(const std::vector<EnrichedCity>& cities);

   /**
    * @brief Log the generated brewery results.
    */
   void LogResults() const;

   /**
    * @brief Helper struct to store generated brewery data.
    */
   struct GeneratedBrewery {
      Location location;
      BreweryResult brewery;
   };

   /// @brief Stores generated brewery data.
   std::vector<GeneratedBrewery> generatedBreweries_;
};
#endif  // BIERGARTEN_PIPELINE_BIERGARTEN_DATA_GENERATOR_H_
