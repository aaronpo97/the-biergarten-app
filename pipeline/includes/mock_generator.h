#pragma once

#include "data_generator.h"
#include <string>
#include <vector>

class MockGenerator final : public IDataGenerator {
public:
  void load(const std::string &modelPath) override;
  BreweryResult generateBrewery(const std::string &cityName,
                                const std::string &countryName,
                                const std::string &regionContext) override;
  UserResult generateUser(const std::string &locale) override;

private:
  static std::size_t deterministicHash(const std::string &a,
                                       const std::string &b);

  static const std::vector<std::string> kBreweryAdjectives;
  static const std::vector<std::string> kBreweryNouns;
  static const std::vector<std::string> kBreweryDescriptions;
  static const std::vector<std::string> kUsernames;
  static const std::vector<std::string> kBios;
};
