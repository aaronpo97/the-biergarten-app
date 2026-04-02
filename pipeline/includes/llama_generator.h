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
                                const std::string &countryName,
                                const std::string &regionContext) override;
  UserResult generateUser(const std::string &locale) override;

private:
  std::string infer(const std::string &prompt, int maxTokens = 5000);
  // Overload that allows passing a system message separately so chat-capable
  // models receive a proper system role instead of having the system text
  // concatenated into the user prompt (helps avoid revealing internal
  // reasoning or instructions in model output).
  std::string infer(const std::string &systemPrompt, const std::string &prompt,
                    int maxTokens = 5000);

  llama_model *model_ = nullptr;
  llama_context *context_ = nullptr;
};
