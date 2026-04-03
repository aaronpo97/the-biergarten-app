#ifndef BIERGARTEN_PIPELINE_DATA_GENERATION_LLAMA_GENERATOR_H_
#define BIERGARTEN_PIPELINE_DATA_GENERATION_LLAMA_GENERATOR_H_

#include <cstdint>
#include <string>

#include "data_generation/data_generator.h"

struct llama_model;
struct llama_context;

class LlamaGenerator final : public DataGenerator {
  public:
   LlamaGenerator() = default;
   ~LlamaGenerator() override;

   void SetSamplingOptions(float temperature, float top_p, int seed = -1);

   void SetContextSize(uint32_t n_ctx);

   void Load(const std::string& model_path) override;
   BreweryResult GenerateBrewery(const std::string& city_name,
                                 const std::string& country_name,
                                 const std::string& region_context) override;
   UserResult GenerateUser(const std::string& locale) override;

  private:
   std::string Infer(const std::string& prompt, int max_tokens = 10000);
   // Overload that allows passing a system message separately so chat-capable
   // models receive a proper system role instead of having the system text
   // concatenated into the user prompt (helps avoid revealing internal
   // reasoning or instructions in model output).
   std::string Infer(const std::string& system_prompt,
                     const std::string& prompt, int max_tokens = 10000);

   std::string InferFormatted(const std::string& formatted_prompt,
                              int max_tokens = 10000);

   std::string LoadBrewerySystemPrompt(const std::string& prompt_file_path);
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
