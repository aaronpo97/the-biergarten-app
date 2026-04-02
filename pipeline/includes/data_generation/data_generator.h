#ifndef BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_GENERATOR_H_

#include <string>

struct BreweryResult {
  std::string name;
  std::string description;
};

struct UserResult {
  std::string username;
  std::string bio;
};

class DataGenerator {
public:
  virtual ~DataGenerator() = default;

  virtual void Load(const std::string &model_path) = 0;

  virtual BreweryResult GenerateBrewery(const std::string &city_name,
                                        const std::string &country_name,
                                        const std::string &region_context) = 0;

  virtual UserResult GenerateUser(const std::string &locale) = 0;
};

#endif  // BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_GENERATOR_H_
