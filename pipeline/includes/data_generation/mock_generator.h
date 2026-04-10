#ifndef BIERGARTEN_PIPELINE_DATA_GENERATION_MOCK_GENERATOR_H_
#define BIERGARTEN_PIPELINE_DATA_GENERATION_MOCK_GENERATOR_H_

/**
 * @file data_generation/mock_generator.h
 * @brief Deterministic mock implementation of DataGenerator.
 */

#include <string>
#include <vector>

#include "data_generation/data_generator.h"

/**
 * @brief Mock generator used for deterministic, model-free outputs.
 */
class MockGenerator final : public DataGenerator {
  public:
   /**
    * @brief Generates deterministic brewery data for a location.
    *
    * @param city_name City name.
    * @param country_name Country name.
    * @param region_context Unused for mock generation.
    * @return Generated brewery result.
    */
   BreweryResult GenerateBrewery(const std::string& city_name,
                                 const std::string& country_name,
                                 const std::string& region_context) override;

   /**
    * @brief Generates deterministic user data for a locale.
    *
    * @param locale Locale hint.
    * @return Generated user result.
    */
   UserResult GenerateUser(const std::string& locale) override;

  private:
   /**
    * @brief Combines two strings into a stable hash value.
    *
    * @param a First key.
    * @param b Second key.
    * @return Deterministic hash value.
    */
   static std::size_t DeterministicHash(const std::string& a,
                                        const std::string& b);

   static const std::vector<std::string> kBreweryAdjectives;
   static const std::vector<std::string> kBreweryNouns;
   static const std::vector<std::string> kBreweryDescriptions;
   static const std::vector<std::string> kUsernames;
   static const std::vector<std::string> kBios;
};

#endif  // BIERGARTEN_PIPELINE_DATA_GENERATION_MOCK_GENERATOR_H_
