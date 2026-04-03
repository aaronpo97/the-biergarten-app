#ifndef BIERGARTEN_PIPELINE_BIERGARTEN_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_BIERGARTEN_DATA_GENERATOR_H_

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

#include "data_generation/data_generator.h"
#include "database/database.h"
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

   /// @brief Directory for cached JSON and database files.
   std::string cache_dir;

   /// @brief LLM sampling temperature (0.0 to 1.0, higher = more random).
   float temperature = 0.8f;

   /// @brief LLM nucleus sampling top-p parameter (0.0 to 1.0, higher = more
   /// random).
   float top_p = 0.92f;

   /// @brief Random seed for sampling (-1 for random, otherwise non-negative).
   int seed = -1;

   /// @brief Git commit hash for database consistency (always pinned to
   /// c5eb7772).
   std::string commit = "c5eb7772";
};

/**
 * @brief Main data generator class for the Biergarten pipeline.
 *
 * This class encapsulates the core logic for generating brewery data.
 * It handles database initialization, data loading/downloading, and brewery
 * generation.
 */
class BiergartenDataGenerator {
  public:
   /**
    * @brief Construct a BiergartenDataGenerator with injected dependencies.
    *
    * @param options Application configuration options.
    * @param web_client HTTP client for downloading data.
    * @param database SQLite database instance.
    */
   BiergartenDataGenerator(const ApplicationOptions& options,
                           std::shared_ptr<WebClient> web_client,
                           SqliteDatabase& database);

   /**
    * @brief Run the data generation pipeline.
    *
    * Performs the following steps:
    * 1. Initialize database
    * 2. Download geographic data if needed
    * 3. Initialize the generator (LLM or Mock)
    * 4. Generate brewery data for sample cities
    *
    * @return 0 on success, 1 on failure.
    */
   int Run();

  private:
   /// @brief Immutable application options.
   const ApplicationOptions options_;

   /// @brief Shared HTTP client dependency.
   std::shared_ptr<WebClient> webClient_;

   /// @brief Database dependency.
   SqliteDatabase& database_;

   /**
    * @brief Enriched city data with Wikipedia context.
    */
   struct EnrichedCity {
      int city_id;
      std::string city_name;
      std::string country_name;
      std::string region_context;
   };

   /**
    * @brief Initialize the data generator based on options.
    *
    * Creates either a MockGenerator (if no model path) or LlamaGenerator.
    *
    * @return A unique_ptr to the initialized generator.
    */
   std::unique_ptr<DataGenerator> InitializeGenerator();

   /**
    * @brief Download and load geographic data if not cached.
    */
   void LoadGeographicData();

   /**
    * @brief Query cities from database and build country name map.
    *
    * @return Vector of (City, country_name) pairs capped at 30 entries.
    */
   std::vector<std::pair<City, std::string>> QueryCitiesWithCountries();

   /**
    * @brief Enrich cities with Wikipedia summaries.
    *
    * @param cities Vector of (City, country_name) pairs.
    * @return Vector of enriched city data with context.
    */
   std::vector<EnrichedCity> EnrichWithWikipedia(
       const std::vector<std::pair<City, std::string>>& cities);

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
      int city_id;
      std::string city_name;
      BreweryResult brewery;
   };

   /// @brief Stores generated brewery data.
   std::vector<GeneratedBrewery> generatedBreweries_;
};
#endif  // BIERGARTEN_PIPELINE_BIERGARTEN_DATA_GENERATOR_H_
