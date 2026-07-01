#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_DATA_GENERATOR_H_

/**
 * @file data_generation/data_generator.h
 * @brief Shared generator interfaces and result models.
 */

#include <string>

#include "data_model/generated_models.h"

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
   * @brief Generates a user profile grounded in a sampled name and persona.
   *
   * @param city Enriched city the user is associated with.
   * @param persona Persona archetype grounding the generated bio.
   * @param name Sampled first/last name (and gender)
   * @return User generation result.
   */
  virtual UserResult GenerateUser(const EnrichedCity& city,
                                  const UserPersona& persona,
                                  const Name& name) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_DATA_GENERATOR_H_
