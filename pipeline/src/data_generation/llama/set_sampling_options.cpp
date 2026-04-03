#include <stdexcept>

#include "llama.h"

#include "data_generation/llama_generator.h"

void LlamaGenerator::SetSamplingOptions(float temperature, float top_p,
                                        int seed) {
  if (temperature < 0.0f) {
    throw std::runtime_error(
        "LlamaGenerator: sampling temperature must be >= 0");
  }
  if (!(top_p > 0.0f && top_p <= 1.0f)) {
    throw std::runtime_error(
        "LlamaGenerator: sampling top-p must be in (0, 1]");
  }
  if (seed < -1) {
    throw std::runtime_error(
        "LlamaGenerator: seed must be >= 0, or -1 for random");
  }

  sampling_temperature_ = temperature;
  sampling_top_p_ = top_p;
  sampling_seed_ = (seed < 0) ? static_cast<uint32_t>(LLAMA_DEFAULT_SEED)
                              : static_cast<uint32_t>(seed);
}
