#ifndef BIERGARTEN_PIPELINE_BIERGARTEN_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_BIERGARTEN_DATA_GENERATOR_H_

/**
 * @file biergarten_data_generator.h
 * @brief Core orchestration class for pipeline data generation.
 */

#include <memory>
#include <string>
#include <vector>

#include "data_generation/data_generator.h"
#include "data_model/location.h"
#include "web_client/web_client.h"
#include "wikipedia/wikipedia_service.h"

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
    * @param options Application configuration options.
    * @param web_client HTTP client for downloading data.
    */
   BiergartenDataGenerator(ApplicationOptions options,
                           std::unique_ptr<WebClient> web_client);

   /**
    * @brief Run the data generation pipeline.
    *
    * Performs the following steps:
    * 1. Load curated locations from JSON
    * 2. Initialize the generator (LLM or Mock)
    * 3. Generate brewery data for sampled cities
    *
    * @return true if successful, false if not
    */
   bool Run();

  private:
   /// @brief Immutable application options.
   const ApplicationOptions options_;

   /// @brief Shared HTTP client dependency.
   std::shared_ptr<WebClient> webClient_;

   /**
    * @brief Enriched city data with Wikipedia context.
    */
   struct EnrichedCity {
      Location location;
      std::string region_context;
   };

   /**
    * @brief Initialize the data generator based on options.
    *
    * Creates either a MockGenerator (if no model path) or LlamaGenerator.
    *
    * @return A unique_ptr to the initialized generator.
    */
   std::unique_ptr<DataGenerator> InitializeGenerator() const;

   /**
    * @brief Load locations from JSON and sample cities.
    *
    * @return Vector of sampled locations capped at 30 entries.
    */
   static std::vector<Location> QueryCitiesWithCountries();

   /**
    * @brief Enrich cities with Wikipedia summaries.
    *
    * @param cities Vector of sampled locations.
    * @return Vector of enriched city data with context.
    */
   std::vector<EnrichedCity> EnrichWithWikipedia(
       const std::vector<Location>& cities);

   /**
    * @brief Generate breweries for enriched cities.
    *
    * @param generator The data generator instance.
    * @param cities Vector of enriched city data.
    */
   void GenerateBreweries(DataGenerator& generator,
                          const std::vector<EnrichedCity>& cities);

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
