/**
 * @file data_generation/llama/constructor.cpp
 * @brief LlamaGenerator constructor implementation.
 */

#include <random>
#include <stdexcept>
#include <string>

#include "biergarten_data_generator.h"
#include "data_generation/llama_generator.h"

LlamaGenerator::LlamaGenerator(const ApplicationOptions& options,
                               const std::string& model_path)
    : rng_() {
   if (model_path.empty()) {
      throw std::runtime_error("LlamaGenerator: model path must not be empty");
   }

   if (options.temperature < 0.0F) {
      throw std::runtime_error(
          "LlamaGenerator: sampling temperature must be >= 0");
   }

   if (options.top_p <= 0.0F || options.top_p > 1.0F) {
      throw std::runtime_error(
          "LlamaGenerator: sampling top-p must be in (0, 1]");
   }

   if (options.seed < -1) {
      throw std::runtime_error(
          "LlamaGenerator: seed must be >= 0, or -1 for random");
   }

   if (options.n_ctx == 0 || options.n_ctx > 32768) {
      throw std::runtime_error(
          "LlamaGenerator: context size must be in range [1, 32768]");
   }

   sampling_temperature_ = options.temperature;
   sampling_top_p_ = options.top_p;
   if (options.seed == -1) {
      std::random_device random_device;
      rng_.seed(random_device());
   } else {
      rng_.seed(static_cast<uint32_t>(options.seed));
   }
   n_ctx_ = options.n_ctx;

   Load(model_path);
}
