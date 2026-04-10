/**
 * @file data_generation/llama/load.cpp
 * @brief Initializes llama backend, loads model weights, creates inference
 * context, and resets prior resources during model initialization.
 */

#include <spdlog/spdlog.h>

#include <algorithm>
#include <stdexcept>
#include <string>

#include "data_generation/llama_generator.h"
#include "llama.h"

void LlamaGenerator::Load(const std::string& model_path) {
   if (context_ != nullptr) {
      llama_free(context_);
      context_ = nullptr;
   }
   if (model_ != nullptr) {
      llama_model_free(model_);
      model_ = nullptr;
   }

   const llama_model_params model_params = llama_model_default_params();
   model_ = llama_model_load_from_file(model_path.c_str(), model_params);
   if (model_ == nullptr) {
      throw std::runtime_error(
          "LlamaGenerator: failed to load model from path: " + model_path);
   }

   llama_context_params context_params = llama_context_default_params();
   context_params.n_ctx = n_ctx_;
   context_params.n_batch = std::min(n_ctx_, static_cast<uint32_t>(5000));

   context_ = llama_init_from_model(model_, context_params);
   if (context_ == nullptr) {
      llama_model_free(model_);
      model_ = nullptr;
      throw std::runtime_error("LlamaGenerator: failed to create context");
   }

   spdlog::info("[LlamaGenerator] Loaded model: {}", model_path);
}
