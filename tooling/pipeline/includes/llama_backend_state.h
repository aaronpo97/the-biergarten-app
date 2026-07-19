#ifndef BIERGARTEN_PIPELINE_INCLUDES_LLAMA_BACKEND_STATE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_LLAMA_BACKEND_STATE_H_

/**
 * @file llama_backend_state.h
 * @brief RAII guard for llama.cpp backend process lifetime.
 */

#include <llama.h>

/**
 * @brief RAII wrapper for llama_backend_init and llama_backend_free.
 *
 * Create one instance in application startup before using llama.cpp and keep
 * it alive for application lifetime.
 */
class LlamaBackendState {
  public:
   LlamaBackendState() { llama_backend_init(); }
   ~LlamaBackendState() { llama_backend_free(); }

   LlamaBackendState(const LlamaBackendState&) = delete;
   LlamaBackendState& operator=(const LlamaBackendState&) = delete;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_LLAMA_BACKEND_STATE_H_
