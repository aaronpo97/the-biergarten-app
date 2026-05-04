#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_GENERATED_MODELS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_GENERATED_MODELS_H_

/**
 * @file data_model/generated_models.h
 * @brief Generated output models from the pipeline: brewery/user results, enriched data,
 * and complete generation results.
 */

#include <string>

#include "data_model/models.h"

// ============================================================================
// Generation Output Models
// ============================================================================

/**
 * @brief Generated brewery payload.
 */
struct BreweryResult {
  /// @brief Brewery display name in English.
  std::string name_en;

  /// @brief Brewery description text in English.
  std::string description_en;

  /// @brief Brewery display name in the local language.
  std::string name_local;

  /// @brief Brewery description text in the local language.
  std::string description_local;
};

/**
 * @brief Generated user profile payload.
 */
struct UserResult {
  /// @brief Username handle.
  std::string username{};

  /// @brief Short user biography.
  std::string bio{};
};

// ============================================================================
// Pipeline Data Models
// ============================================================================

/**
 * @brief Enriched city data with Wikipedia context.
 */
struct EnrichedCity {
  Location location;
  std::string region_context{};
};

/**
 * @brief Helper struct to store generated brewery data.
 */
struct GeneratedBrewery {
  Location location;
  BreweryResult brewery;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_GENERATED_MODELS_H_
