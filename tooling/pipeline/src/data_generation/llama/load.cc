/**
 * @file data_generation/llama/load.cc
 * @brief Initializes llama backend, loads model weights, creates inference
 * context, and resets prior resources during model initialization.
 */

#include <spdlog/spdlog.h>

#include <algorithm>
#include <stdexcept>
#include <string>
#include <utility>

#include "data_generation/llama_generator.h"
#include "llama.h"

// Maximum batch size for decode operations. Capping the batch prevents
// excessive memory allocation while maintaining inference performance.
static constexpr uint32_t kMaxBatchSize = 5000U;

void LlamaGenerator::Load(const std::string& model_path) {
  context_.reset();
  model_.reset();

  const llama_model_params model_params = llama_model_default_params();
  LlamaGenerator::ModelHandle loaded_model(
      llama_model_load_from_file(model_path.c_str(), model_params));
  if (!loaded_model) {
    throw std::runtime_error(
        "LlamaGenerator: failed to load model from path: " + model_path);
  }

  llama_context_params context_params = llama_context_default_params();
  context_params.n_ctx = n_ctx_;
  context_params.n_batch = std::min(n_ctx_, kMaxBatchSize);

  LlamaGenerator::ContextHandle loaded_context(
      llama_init_from_model(loaded_model.get(), context_params));
  if (!loaded_context) {
    throw std::runtime_error("LlamaGenerator: failed to create context");
  }

  model_ = std::move(loaded_model);
  context_ = std::move(loaded_context);

  spdlog::info("[LlamaGenerator] Loaded model: {}", model_path);
}
