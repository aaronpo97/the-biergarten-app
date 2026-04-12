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
   /// @brief Brewery display name.
   std::string name{};

   /// @brief Brewery description text.
   std::string description{};
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_BREWERY_RESULT_H_
