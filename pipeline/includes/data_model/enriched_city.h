#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_ENRICHED_CITY_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_ENRICHED_CITY_H_

/**
 * @file data_model/enriched_city.h
 * @brief Enriched city data with Wikipedia context.
 */

#include <string>

#include "data_model/location.h"

/**
 * @brief Enriched city data with Wikipedia context.
 */
struct EnrichedCity {
   Location location;
   std::string region_context{};
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_ENRICHED_CITY_H_
