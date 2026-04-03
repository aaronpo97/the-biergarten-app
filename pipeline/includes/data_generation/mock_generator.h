#ifndef BIERGARTEN_PIPELINE_DATA_GENERATION_MOCK_GENERATOR_H_
#define BIERGARTEN_PIPELINE_DATA_GENERATION_MOCK_GENERATOR_H_

#include <string>
#include <vector>

#include "data_generation/data_generator.h"

class MockGenerator final : public DataGenerator {
  public:
   void Load(const std::string& model_path) override;
   BreweryResult GenerateBrewery(const std::string& city_name,
                                 const std::string& country_name,
                                 const std::string& region_context) override;
   UserResult GenerateUser(const std::string& locale) override;

  private:
   static std::size_t DeterministicHash(const std::string& a,
                                        const std::string& b);

   static const std::vector<std::string> kBreweryAdjectives;
   static const std::vector<std::string> kBreweryNouns;
   static const std::vector<std::string> kBreweryDescriptions;
   static const std::vector<std::string> kUsernames;
   static const std::vector<std::string> kBios;
};

#endif  // BIERGARTEN_PIPELINE_DATA_GENERATION_MOCK_GENERATOR_H_
