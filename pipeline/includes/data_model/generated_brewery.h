#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_GENERATED_BREWERY_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_GENERATED_BREWERY_H_

/**
 * @file data_model/generated_brewery.h
 * @brief Helper struct to store generated brewery data.
 */

#include "data_model/brewery_result.h"
#include "data_model/location.h"

/**
 * @brief Helper struct to store generated brewery data.
 */
struct GeneratedBrewery {
   Location location;
   BreweryResult brewery;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_GENERATED_BREWERY_H_
