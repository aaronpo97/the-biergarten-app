#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_BREWERY_LOCATION_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_BREWERY_LOCATION_H_

/**
 * @file data_model/brewery_location.h
 * @brief Non-owning brewery location input.
 */

#include <string_view>

/**
 * @brief Non-owning brewery location input.
 */
struct BreweryLocation {
   /// @brief City name.
   std::string_view city_name;

   /// @brief Country name.
   std::string_view country_name;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_BREWERY_LOCATION_H_
