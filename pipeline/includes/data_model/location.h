#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_LOCATION_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_LOCATION_H_

/**
 * @file data_model/location.h
 * @brief Location data model used throughout generation pipeline.
 */

#include <string>

/**
 * @brief Canonical location record for city-level generation.
 */
struct Location {
  /// @brief City name.
  std::string city{};

  /// @brief State or province name.
  std::string state_province{};

  /// @brief ISO 3166-2 subdivision code.
  std::string iso3166_2{};

  /// @brief Country name.
  std::string country{};

  /// @brief ISO 3166-1 country code.
  std::string iso3166_1{};

  /// @brief Latitude in decimal degrees.
  double latitude{};

  /// @brief Longitude in decimal degrees.
  double longitude{};
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_LOCATION_H_
