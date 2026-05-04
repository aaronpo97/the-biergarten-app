#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_H_

#include <filesystem>

/**
 * @file data_generation/llama_generator.h
 * @brief llama.cpp-backed implementation of DataGenerator.
 */

#include <cstdint>
#include <memory>
#include <random>
#include <string>
#include <string_view>

#include "data_generation/data_generator.h"
#include "data_generation/prompt_formatting/prompt_formatter.h"
#include "data_model/models.h"
#include "../services/prompting/prompt_directory.h"

struct llama_model;
struct llama_context;

/**
 * @brief Data generator implementation backed by llama.cpp.
 */
class LlamaGenerator final : public DataGenerator {
 public:
  /**
   * @brief Constructs a generator using parsed application options and loads
   * the configured model immediately.
   *
   * @param options Parsed application options.
   * @param model_path Filesystem path to GGUF model assets.
   * @param prompt_formatter Formatter that produces model-specific prompts.
   * @param prompt_directory Directory service for loading named prompt files.
   */
  LlamaGenerator(const ApplicationOptions& options,
                 const std::string& model_path,
                 std::unique_ptr<IPromptFormatter> prompt_formatter,
                 std::unique_ptr<IPromptDirectory> prompt_directory);

  ~LlamaGenerator() override;

  // disable copy constructor
  LlamaGenerator(const LlamaGenerator&) = delete;

  // disable copy assignment operator
  LlamaGenerator& operator=(const LlamaGenerator&) = delete;
  // disable move constructor
  LlamaGenerator(LlamaGenerator&&) = delete;
  // disable move assignment operator
  LlamaGenerator& operator=(LlamaGenerator&&) = delete;

  /**
   * @brief Generates brewery data for a specific location.
   *
   * @param location Location object.
   * @param region_context Additional regional context.
   * @return Generated brewery result.
   */
  BreweryResult GenerateBrewery(const Location& location,
                                const std::string& region_context) override;

  /**
   * @brief Generates a user profile for the provided locale.
   *
   * @param locale Locale hint.
   * @return Generated user profile.
   */
  UserResult GenerateUser(const std::string& locale) override;

 private:
  static constexpr int32_t kDefaultMaxTokens = 10000;
  static constexpr float kDefaultSamplingTopP = 0.95F;
  static constexpr uint32_t kDefaultSamplingTopK = 64;
  static constexpr uint32_t kDefaultContextSize = 8192;

  struct ModelDeleter {
    void operator()(llama_model* model) const noexcept;
  };
  struct ContextDeleter {
    void operator()(llama_context* context) const noexcept;
  };

  using ModelHandle = std::unique_ptr<llama_model, ModelDeleter>;
  using ContextHandle = std::unique_ptr<llama_context, ContextDeleter>;

  /**
   * @brief Loads model and prepares inference context.
   *
   * @param model_path Filesystem path to GGUF model.
   */
  void Load(const std::string& model_path);

  /**
   * @brief Infers text from separate system and user prompts.
   *
   * This helps chat-capable models preserve system-role behavior instead of
   * concatenating system text into user input.
   *
   * @param system_prompt System role prompt.
   * @param prompt User prompt.
   * @param max_tokens Maximum tokens to generate.
   * @param grammar Optional GBNF grammar constraining generated output.
   * @return Generated text.
   */
  std::string Infer(const std::string& system_prompt, const std::string& prompt,
                    int max_tokens = kDefaultMaxTokens,
                    std::string_view grammar = {});

  /**
   * @brief Runs inference on an already-formatted prompt.
   *
   * @param formatted_prompt Prompt preformatted for model chat template.
   * @param max_tokens Maximum tokens to generate.
   * @param grammar Optional GBNF grammar constraining generated output.
   * @return Generated text.
   */
  std::string InferFormatted(const std::string& formatted_prompt,
                             int max_tokens = kDefaultMaxTokens,
                             std::string_view grammar = {});

  ModelHandle model_;
  ContextHandle context_;
  float sampling_temperature_ = 1.0F;
  float sampling_top_p_ = kDefaultSamplingTopP;
  uint32_t sampling_top_k_ = kDefaultSamplingTopK;
  std::mt19937 rng_;
  uint32_t n_ctx_ = kDefaultContextSize;
  std::unique_ptr<IPromptFormatter> prompt_formatter_;
  std::unique_ptr<IPromptDirectory> prompt_directory_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_H_
