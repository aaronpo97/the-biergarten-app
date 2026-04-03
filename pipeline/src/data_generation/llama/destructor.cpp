#include "data_generation/llama_generator.h"
#include "llama.h"

LlamaGenerator::~LlamaGenerator() {
   if (context_ != nullptr) {
      llama_free(context_);
      context_ = nullptr;
   }

   if (model_ != nullptr) {
      llama_model_free(model_);
      model_ = nullptr;
   }

   llama_backend_free();
}
