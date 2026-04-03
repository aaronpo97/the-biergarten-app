#include <stdexcept>
#include <string>

#include "llama.h"
#include <spdlog/spdlog.h>

#include "data_generation/llama_generator.h"

void LlamaGenerator::Load(const std::string& model_path) {
  if (model_path.empty())
    throw std::runtime_error("LlamaGenerator: model path must not be empty");

  if (context_ != nullptr) {
    llama_free(context_);
    context_ = nullptr;
  }
  if (model_ != nullptr) {
    llama_model_free(model_);
    model_ = nullptr;
  }

  llama_backend_init();

  llama_model_params model_params = llama_model_default_params();
  model_ = llama_model_load_from_file(model_path.c_str(), model_params);
  if (model_ == nullptr) {
    throw std::runtime_error(
        "LlamaGenerator: failed to load model from path: " + model_path);
  }

  llama_context_params context_params = llama_context_default_params();
  context_params.n_ctx = 2048;

  context_ = llama_init_from_model(model_, context_params);
  if (context_ == nullptr) {
    llama_model_free(model_);
    model_ = nullptr;
    throw std::runtime_error("LlamaGenerator: failed to create context");
  }

  spdlog::info("[LlamaGenerator] Loaded model: {}", model_path);
}
