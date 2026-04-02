#pragma once

#include "data_generator.h"
#include <memory>
#include <string>

struct llama_model;
struct llama_context;

class LlamaGenerator final : public IDataGenerator {
public:
  ~LlamaGenerator() override;

  void load(const std::string &modelPath) override;
  BreweryResult generateBrewery(const std::string &cityName,
                                const std::string &regionContext) override;
  UserResult generateUser(const std::string &locale) override;

private:
  std::string infer(const std::string &prompt, int maxTokens = 256);

  llama_model *model_ = nullptr;
  llama_context *context_ = nullptr;
};
