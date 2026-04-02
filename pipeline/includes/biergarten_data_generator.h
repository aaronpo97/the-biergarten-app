#pragma once

#include <memory>
#include <string>
#include <vector>
#include <unordered_map>

#include "application_options.h"
#include "data_generation/data_generator.h"
#include "database/database.h"
#include "web_client/web_client.h"
#include "wikipedia/wikipedia_service.h"


/**
 * @brief Program options for the Biergarten pipeline application.
 */
struct ApplicationOptions {
  /// @brief Path to the LLM model file (gguf format).
  std::string modelPath;

  /// @brief Directory for cached JSON and database files.
  std::string cacheDir;

  /// @brief LLM sampling temperature (0.0 to 1.0, higher = more random).
  float temperature = 0.8f;

  /// @brief LLM nucleus sampling top-p parameter (0.0 to 1.0, higher = more random).
  float topP = 0.92f;

  /// @brief Random seed for sampling (-1 for random, otherwise non-negative).
  int seed = -1;

  /// @brief Git commit hash for database consistency.
  std::string commit = "c5eb7772";
};


/**
 * @brief Main data generator class for the Biergarten pipeline.
 *
 * This class encapsulates the core logic for generating brewery data.
 * It handles database initialization, data loading/downloading, and brewery generation.
 */
class BiergartenDataGenerator {
public:
  /**
   * @brief Construct a BiergartenDataGenerator with injected dependencies.
   *
   * @param options Application configuration options.
   * @param webClient HTTP client for downloading data.
   * @param database SQLite database instance.
   */
  BiergartenDataGenerator(const ApplicationOptions &options,
                          std::shared_ptr<IWebClient> webClient,
                          SqliteDatabase &database);

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
  std::shared_ptr<IWebClient> webClient_;

  /// @brief Database dependency.
  SqliteDatabase &database_;

  /**
   * @brief Initialize the data generator based on options.
   *
   * Creates either a MockGenerator (if no model path) or LlamaGenerator.
   *
   * @return A unique_ptr to the initialized generator.
   */
  std::unique_ptr<IDataGenerator> InitializeGenerator();

  /**
   * @brief Download and load geographic data if not cached.
   */
  void LoadGeographicData();

  /**
   * @brief Generate sample breweries for demonstration.
   */
  void GenerateSampleBreweries();

  /**
   * @brief Helper struct to store generated brewery data.
   */
  struct GeneratedBrewery {
    int cityId;
    std::string cityName;
    BreweryResult brewery;
  };

  /// @brief Stores generated brewery data.
  std::vector<GeneratedBrewery> generatedBreweries_;
};
