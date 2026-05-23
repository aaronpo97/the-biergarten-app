/**
 * @file data_generation/llama/llama_generator.cc
 * @brief LlamaGenerator constructor and destructor implementation.
 */

#include "data_generation/llama_generator.h"

#include <filesystem>
#include <memory>
#include <random>
#include <stdexcept>
#include <string>

#include "data_model/models.h"
#include "llama.h"

static constexpr uint32_t kMaxContextSize = 32768U;

void LlamaGenerator::ModelDeleter::operator()(
    llama_model* model) const noexcept {
  if (model != nullptr) {
    llama_model_free(model);
  }
}

void LlamaGenerator::ContextDeleter::operator()(
    llama_context* context) const noexcept {
  if (context != nullptr) {
    llama_free(context);
  }
}

LlamaGenerator::LlamaGenerator(
    const ApplicationOptions& options, const std::string& model_path,
    std::shared_ptr<ILogger> logger,
    std::unique_ptr<IPromptFormatter> prompt_formatter,
    std::unique_ptr<IPromptDirectory> prompt_directory)
    : rng_(std::random_device{}()),
      logger_(std::move(logger)),
      prompt_formatter_(std::move(prompt_formatter)),
      prompt_directory_(std::move(prompt_directory)) {
  if (model_path.empty()) {
    throw std::runtime_error("LlamaGenerator: model path must not be empty");
  }

  if (!prompt_formatter_) {
    throw std::runtime_error(
        "LlamaGenerator: prompt formatter dependency must not be null");
  }

  if (!prompt_directory_) {
    throw std::runtime_error(
        "LlamaGenerator: prompt directory dependency must not be null");
  }

  const auto sampling = options.generator.sampling.value_or(SamplingOptions{});

  if (sampling.temperature < 0.0F) {
    throw std::runtime_error(
        "LlamaGenerator: sampling temperature must be >= 0");
  }

  if (sampling.top_p <= 0.0F || sampling.top_p > 1.0F) {
    throw std::runtime_error(
        "LlamaGenerator: sampling top-p must be in (0, 1]");
  }

  if (sampling.top_k == 0U) {
    throw std::runtime_error("LlamaGenerator: sampling top-k must be > 0");
  }

  if (sampling.seed < -1) {
    throw std::runtime_error(
        "LlamaGenerator: seed must be >= 0, or -1 for random");
  }

  if (sampling.n_ctx == 0 || sampling.n_ctx > kMaxContextSize) {
    throw std::runtime_error(
        "LlamaGenerator: context size must be in range [1, 32768]");
  }

  sampling_temperature_ = sampling.temperature;
  sampling_top_p_ = sampling.top_p;
  sampling_top_k_ = sampling.top_k;

  if (sampling.seed == -1) {
    std::random_device random_device;
    rng_.seed(random_device());
  } else {
    rng_.seed(static_cast<uint32_t>(sampling.seed));
  }

  n_ctx_ = sampling.n_ctx;
  n_gpu_layers_ = sampling.n_gpu_layers;

  this->Load(model_path);
}

LlamaGenerator::~LlamaGenerator() = default;
