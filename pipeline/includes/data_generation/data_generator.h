#ifndef BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_GENERATOR_H_

/**
 * @file data_generation/data_generator.h
 * @brief Shared generator interfaces and result models.
 */

#include <string>

/**
 * @brief Generated brewery payload.
 */
struct BreweryResult {
   /// @brief Brewery display name.
   std::string name;

   /// @brief Brewery description text.
   std::string description;
};

/**
 * @brief Generated user profile payload.
 */
struct UserResult {
   /// @brief Username handle.
   std::string username;

   /// @brief Short user biography.
   std::string bio;
};

/**
 * @brief Interface for data generator implementations.
 */
class DataGenerator {
  public:
   /// @brief Virtual destructor for polymorphic cleanup.
   virtual ~DataGenerator() = default;

   /**
    * @brief Generates brewery data for a location.
    *
    * @param city_name City name.
    * @param country_name Country name.
    * @param region_context Additional regional context text.
    * @return Brewery generation result.
    */
   virtual BreweryResult GenerateBrewery(const std::string& city_name,
                                         const std::string& country_name,
                                         const std::string& region_context) = 0;

   /**
    * @brief Generates a user profile for a locale.
    *
    * @param locale Locale hint used by generator.
    * @return User generation result.
    */
   virtual UserResult GenerateUser(const std::string& locale) = 0;
};

#endif  // BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_GENERATOR_H_
