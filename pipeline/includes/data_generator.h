#pragma once

#include <string>

struct BreweryResult {
  std::string name;
  std::string description;
};

struct UserResult {
  std::string username;
  std::string bio;
};

class IDataGenerator {
public:
  virtual ~IDataGenerator() = default;

  virtual void load(const std::string &modelPath) = 0;

  virtual BreweryResult generateBrewery(const std::string &cityName,
                                        const std::string &regionContext) = 0;

  virtual UserResult generateUser(const std::string &locale) = 0;
};
