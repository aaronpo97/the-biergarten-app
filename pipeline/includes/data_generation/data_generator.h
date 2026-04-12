#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_DATA_GENERATOR_H_

/**
 * @file data_generation/data_generator.h
 * @brief Shared generator interfaces and result models.
 */

#include <string>

#include "data_model/brewery_result.h"
#include "data_model/location.h"
#include "data_model/user_result.h"

/**
 * @brief Interface for data generator implementations.
 */
class DataGenerator {
 public:
  virtual ~DataGenerator() = default;

  /**
   * @brief Generates brewery data for a location.
   *
   * @param location Location data
   * @param region_context Additional regional context text.
   * @return Brewery generation result.
   */
  virtual BreweryResult GenerateBrewery(const Location& location,
                                        const std::string& region_context) = 0;

  /**
   * @brief Generates a user profile for a locale.
   *
   * @param locale Locale hint used by generator.
   * @return User generation result.
   */
  virtual UserResult GenerateUser(const std::string& locale) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_DATA_GENERATOR_H_
