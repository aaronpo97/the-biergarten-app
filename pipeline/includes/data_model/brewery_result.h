#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_BREWERY_RESULT_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_BREWERY_RESULT_H_

/**
 * @file data_model/brewery_result.h
 * @brief Generated brewery payload.
 */

#include <string>

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

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_BREWERY_RESULT_H_
