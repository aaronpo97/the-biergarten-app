/**
 * @file biergarten_data_generator/initialize_generator.cpp
 * @brief BiergartenDataGenerator::InitializeGenerator() implementation.
 */

#include <spdlog/spdlog.h>

#include "biergarten_data_generator.h"
#include "data_generation/llama_generator.h"
#include "data_generation/mock_generator.h"

auto BiergartenDataGenerator::InitializeGenerator() const
    -> std::unique_ptr<DataGenerator> {
   spdlog::info("Initializing brewery generator...");

   std::unique_ptr<DataGenerator> generator;
   if (options_.model_path.empty()) {
      generator = std::make_unique<MockGenerator>();
      spdlog::info("[Generator] Using MockGenerator (no model path provided)");
   } else {
      auto llama_generator = std::make_unique<LlamaGenerator>();
      llama_generator->SetSamplingOptions(options_.temperature, options_.top_p,
                                          options_.seed);
      llama_generator->SetContextSize(options_.n_ctx);
      spdlog::info(
          "[Generator] Using LlamaGenerator: {} (temperature={}, top-p={}, "
          "n_ctx={}, seed={})",
          options_.model_path, options_.temperature, options_.top_p,
          options_.n_ctx, options_.seed);
      generator = std::move(llama_generator);
   }
   generator->Load(options_.model_path);

   return generator;
}
