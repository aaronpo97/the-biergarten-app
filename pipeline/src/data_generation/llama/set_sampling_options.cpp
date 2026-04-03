/**
 * Sampling Configuration Module
 * Configures the hyperparameters that control probabilistic token selection
 * during text generation. These settings affect the randomness, diversity, and
 * quality of generated output.
 */

#include <stdexcept>

#include "data_generation/llama_generator.h"
#include "llama.h"

void LlamaGenerator::SetSamplingOptions(float temperature, float top_p,
                                        int seed) {
   /**
    * Validate temperature: controls randomness in output distribution
    * 0.0 = deterministic (always pick highest probability token)
    * Higher values = more random/diverse output
    */
   if (temperature < 0.0f) {
      throw std::runtime_error(
          "LlamaGenerator: sampling temperature must be >= 0");
   }

   /**
    * Validate top-p (nucleus sampling): only sample from top cumulative
    * probability e.g., top-p=0.9 means sample from tokens that make up 90% of
    * probability mass
    */
   if (!(top_p > 0.0f && top_p <= 1.0f)) {
      throw std::runtime_error(
          "LlamaGenerator: sampling top-p must be in (0, 1]");
   }

   /**
    * Validate seed: for reproducible results (-1 uses random seed)
    */
   if (seed < -1) {
      throw std::runtime_error(
          "LlamaGenerator: seed must be >= 0, or -1 for random");
   }

   /**
    * Store sampling parameters for use during token generation
    */
   sampling_temperature_ = temperature;
   sampling_top_p_ = top_p;
   sampling_seed_ = (seed < 0) ? static_cast<uint32_t>(LLAMA_DEFAULT_SEED)
                               : static_cast<uint32_t>(seed);
}
