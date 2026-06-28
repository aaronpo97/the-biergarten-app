/**
 * @file data_generation/llama/load.cc
 * @brief Initializes llama backend, loads model weights, creates inference
 * context, and resets prior resources during model initialization.
 */

#include <ggml-backend.h>
#include <llama.h>

#include <algorithm>
#include <chrono>
#include <stdexcept>
#include <string>
#include <utility>

#include "data_generation/llama_generator.h"

// Maximum batch size for decode operations. Capping the batch prevents
// excessive memory allocation while maintaining inference performance.
static constexpr uint32_t kMaxBatchSize = 5000U;

void LlamaGenerator::Load(const std::string& model_path) {
  context_.reset();
  model_.reset();

  // Specifically load dynamic ggml backends (like CUDA) that are provided
  // externally before attempting to load a model.
  ggml_backend_load_all();

  llama_model_params model_params = llama_model_default_params();
  model_params.n_gpu_layers = n_gpu_layers_;

  ModelHandle loaded_model(
      llama_model_load_from_file(model_path.c_str(), model_params));

  if (!loaded_model) {
    throw std::runtime_error(
        "LlamaGenerator: failed to load model from path: " + model_path);
  }

  llama_context_params context_params = llama_context_default_params();
  context_params.n_ctx = n_ctx_;
  context_params.n_batch = std::min(n_ctx_, kMaxBatchSize);

  ContextHandle loaded_context(
      llama_init_from_model(loaded_model.get(), context_params));

  if (!loaded_context) {
    throw std::runtime_error("LlamaGenerator: failed to create context");
  }

  model_ = std::move(loaded_model);
  context_ = std::move(loaded_context);

  if (logger_) {
    logger_->Log({.level = LogLevel::Info,
                  .phase = PipelinePhase::Startup,
                  .message = std::format("[LlamaGenerator] Loaded model: {} ",
                                         model_path)});
  }
}
