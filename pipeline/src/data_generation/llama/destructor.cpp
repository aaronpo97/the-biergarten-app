/**
 * @file data_generation/llama/destructor.cpp
 * @brief Releases llama model/context resources and backend state during
 * LlamaGenerator teardown to avoid leaks across runs.
 */

#include "data_generation/llama_generator.h"
#include "llama.h"

LlamaGenerator::~LlamaGenerator() {
   /**
    * Free the inference context (contains KV cache and computation state)
    */
   if (context_ != nullptr) {
      llama_free(context_);
      context_ = nullptr;
   }

   /**
    * Free the loaded model (contains weights and vocabulary)
    */
   if (model_ != nullptr) {
      llama_model_free(model_);
      model_ = nullptr;
   }

   /**
    * Clean up the backend (GPU/CPU acceleration resources)
    */
   llama_backend_free();
}
