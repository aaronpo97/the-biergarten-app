#ifndef BIERGARTEN_PIPELINE_DATA_GENERATION_LLAMA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_DATA_GENERATION_LLAMA_GENERATOR_H_

/**
 * @file data_generation/llama_generator.h
 * @brief Llama.cpp-backed implementation of DataGenerator.
 */

#include <cstdint>
#include <string>

#include "data_generation/data_generator.h"

struct ApplicationOptions;

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
    */
   LlamaGenerator(const ApplicationOptions& options,
                  const std::string& model_path);

   /// @brief Releases model/context resources.
   ~LlamaGenerator() override;

   /**
    * @brief Generates brewery data for a specific location.
    *
    * @param city_name City name.
    * @param country_name Country name.
    * @param region_context Additional regional context.
    * @return Generated brewery result.
    */
   BreweryResult GenerateBrewery(const std::string& city_name,
                                 const std::string& country_name,
                                 const std::string& region_context) override;

   /**
    * @brief Generates a user profile for the provided locale.
    *
    * @param locale Locale hint.
    * @return Generated user profile.
    */
   UserResult GenerateUser(const std::string& locale) override;

  private:
   /**
    * @brief Loads model and prepares inference context.
    *
    * @param model_path Filesystem path to GGUF model.
    */
   void Load(const std::string& model_path);

   /**
    * @brief Infers text from a user prompt.
    *
    * @param prompt User prompt.
    * @param max_tokens Maximum tokens to generate.
    * @return Generated text.
    */
   std::string Infer(const std::string& prompt, int max_tokens = 10000);

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
   std::string Infer(const std::string& system_prompt,
                     const std::string& prompt, int max_tokens = 10000);

   /**
    * @brief Runs inference on an already-formatted prompt.
    *
    * @param formatted_prompt Prompt preformatted for model chat template.
    * @param max_tokens Maximum tokens to generate.
    * @return Generated text.
    */
   std::string InferFormatted(const std::string& formatted_prompt,
                              int max_tokens = 10000);

   /**
    * @brief Loads the brewery system prompt from disk.
    *
    * @param prompt_file_path Prompt file path to try first.
    * @return Loaded prompt text or fallback prompt.
    */
   std::string LoadBrewerySystemPrompt(const std::string& prompt_file_path);

   /**
    * @brief Returns a built-in fallback system prompt.
    *
    * @return Fallback prompt text.
    */
   std::string GetFallbackBreweryPrompt();

   llama_model* model_ = nullptr;
   llama_context* context_ = nullptr;
   float sampling_temperature_ = 0.8f;
   float sampling_top_p_ = 0.92f;
   uint32_t sampling_seed_ = 0xFFFFFFFFu;
   uint32_t n_ctx_ = 8192;
   std::string brewery_system_prompt_;
};

#endif  // BIERGARTEN_PIPELINE_DATA_GENERATION_LLAMA_GENERATOR_H_
