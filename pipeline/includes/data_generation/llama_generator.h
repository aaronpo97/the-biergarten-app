#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_H_

/**
 * @file data_generation/llama_generator.h
 * @brief llama.cpp-backed implementation of DataGenerator.
 */

#include <cstdint>
#include <random>
#include <string>
#include <string_view>

#include "data_generation/data_generator.h"
#include "data_model/application_options.h"

struct llama_model;
struct llama_context;
struct llama_sampler;

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
   */
  LlamaGenerator(const ApplicationOptions& options,
                 const std::string& model_path);

  /// @brief Releases model/context resources.
  ~LlamaGenerator() override;

  LlamaGenerator(const LlamaGenerator&) = delete;
  LlamaGenerator& operator=(const LlamaGenerator&) = delete;
  LlamaGenerator(LlamaGenerator&&) = delete;
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
  static constexpr int kDefaultMaxTokens = 10000;
  static constexpr float kDefaultSamplingTopP = 0.95F;
  static constexpr uint32_t kDefaultSamplingTopK = 64;
  static constexpr uint32_t kDefaultContextSize = 8192;

  struct SamplerState {
    SamplerState() = default;
    ~SamplerState();

    SamplerState(const SamplerState&) = delete;
    SamplerState& operator=(const SamplerState&) = delete;
    SamplerState(SamplerState&&) = delete;
    SamplerState& operator=(SamplerState&&) = delete;

    llama_sampler* chain = nullptr;
  };

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
   * @return Generated text.
   */
  std::string Infer(const std::string& system_prompt, const std::string& prompt,
                    int max_tokens = kDefaultMaxTokens);

  /**
   * @brief Runs inference on an already-formatted prompt.
   *
   * @param formatted_prompt Prompt preformatted for model chat template.
   * @param max_tokens Maximum tokens to generate.
   * @return Generated text.
   */
  std::string InferFormatted(const std::string& formatted_prompt,
                             int max_tokens = kDefaultMaxTokens);

  /**
   * @brief Loads the brewery system prompt from disk.
   *
   * @param prompt_file_path Prompt file path to try first.
   * @return Loaded prompt text.
   */
  std::string LoadBrewerySystemPrompt(const std::string& prompt_file_path);

  llama_model* model_ = nullptr;
  llama_context* context_ = nullptr;
  /// @brief Persistent sampler chain reused across inference calls.
  std::unique_ptr<SamplerState> sampler_;
  float sampling_temperature_ = 1.0F;
  float sampling_top_p_ = kDefaultSamplingTopP;
  uint32_t sampling_top_k_ = kDefaultSamplingTopK;
  std::mt19937 rng_;
  uint32_t n_ctx_ = kDefaultContextSize;
  std::string brewery_system_prompt_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_H_
