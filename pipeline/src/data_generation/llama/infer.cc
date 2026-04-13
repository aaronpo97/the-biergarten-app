/**
 * Text Generation / Inference Module
 * Core module that performs LLM inference: converts text prompts into tokens,
 * runs the neural network forward pass, samples the next token, and converts
 * output tokens back to text for system+user chat prompts.
 */

#include <spdlog/spdlog.h>

#include <algorithm>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"
#include "llama.h"

static constexpr std::size_t kPromptTokenSlack = 8;

std::string LlamaGenerator::Infer(const std::string& system_prompt,
                                  const std::string& prompt,
                                  const int max_tokens) {
  return InferFormatted(ToChatPromptPublic(model_, system_prompt, prompt),
                        max_tokens);
}

std::string LlamaGenerator::InferFormatted(const std::string& formatted_prompt,
                                           const int max_tokens) {
  /**
   * Validate that model and context are loaded
   */
  if (model_ == nullptr || context_ == nullptr) {
    throw std::runtime_error("LlamaGenerator: model not loaded");
  }

  /**
   * Get vocabulary for tokenization and token-to-text conversion
   */
  const llama_vocab* vocab = llama_model_get_vocab(model_);
  if (vocab == nullptr) {
    throw std::runtime_error("LlamaGenerator: vocab unavailable");
  }

  /**
   * Clear KV cache to ensure clean inference state (no residual context)
   */
  llama_memory_clear(llama_get_memory(context_), true);

  /**
   * TOKENIZATION PHASE
   * Convert text prompt into token IDs (integers) that the model understands
   */
  std::vector<llama_token> prompt_tokens(formatted_prompt.size() +
                                         kPromptTokenSlack);
  int32_t token_count = llama_tokenize(
      vocab, formatted_prompt.c_str(),
      static_cast<int32_t>(formatted_prompt.size()), prompt_tokens.data(),
      static_cast<int32_t>(prompt_tokens.size()), true, true);

  /**
   * If buffer too small, negative return indicates required size
   */
  if (token_count < 0) {
    prompt_tokens.resize(static_cast<std::size_t>(-token_count));
    token_count = llama_tokenize(
        vocab, formatted_prompt.c_str(),
        static_cast<int32_t>(formatted_prompt.size()), prompt_tokens.data(),
        static_cast<int32_t>(prompt_tokens.size()), true, true);
  }

  if (token_count < 0) {
    throw std::runtime_error("LlamaGenerator: prompt tokenization failed");
  }

  /**
   * CONTEXT SIZE VALIDATION
   * Validate and compute effective token budgets based on context window
   * constraints
   */
  const auto n_ctx = static_cast<int32_t>(llama_n_ctx(context_));
  const auto n_batch = static_cast<int32_t>(llama_n_batch(context_));
  if (n_ctx <= 1 || n_batch <= 0) {
    throw std::runtime_error("LlamaGenerator: invalid context or batch size");
  }

  /**
   * Clamp generation limit to available context window, reserve space for
   * output
   */
  const int32_t effective_max_tokens =
      std::max(1, std::min(max_tokens, n_ctx - 1));
  /**
   * Prompt can use remaining context after reserving space for generation
   */
  int32_t prompt_budget = std::min(n_batch, n_ctx - effective_max_tokens);
  prompt_budget = std::max<int32_t>(1, prompt_budget);

  /**
   * Truncate prompt if necessary to fit within constraints
   */
  prompt_tokens.resize(static_cast<std::size_t>(token_count));
  if (token_count > prompt_budget) {
    spdlog::warn(
        "LlamaGenerator: prompt too long ({} tokens), truncating to {} "
        "tokens to fit n_batch/n_ctx limits",
        token_count, prompt_budget);
    prompt_tokens.resize(static_cast<std::size_t>(prompt_budget));
    token_count = prompt_budget;
  }

  /**
   * PROMPT PROCESSING PHASE
   * Create a batch containing all prompt tokens and feed through the model
   * This computes internal representations and fills the KV cache
   */
  const llama_batch prompt_batch = llama_batch_get_one(
      prompt_tokens.data(), static_cast<int32_t>(prompt_tokens.size()));
  if (llama_decode(context_, prompt_batch) != 0) {
    throw std::runtime_error("LlamaGenerator: prompt decode failed");
  }

  /**
   * TOKEN GENERATION LOOP
   * Iteratively generate tokens one at a time until max_tokens or
   * end-of-sequence
   */
  std::vector<llama_token> generated_tokens;
  generated_tokens.reserve(static_cast<std::size_t>(effective_max_tokens));

  if (sampler_ == nullptr || sampler_->chain == nullptr) {
    throw std::runtime_error("LlamaGenerator: sampler not initialized");
  }

  for (int i = 0; i < effective_max_tokens; ++i) {
    /**
     * Sample next token using configured sampler chain and model logits
     * Index -1 means use the last output position from previous batch
     */
    const llama_token next =
        llama_sampler_sample(sampler_->chain, context_, -1);
    /**
     * Stop if model predicts end-of-generation token (EOS/EOT)
     */
    if (llama_vocab_is_eog(vocab, next)) {
      break;
    }
    generated_tokens.push_back(next);
    /**
     * Feed the sampled token back into model for next iteration
     * (autoregressive)
     */
    llama_token decode_token = next;
    const llama_batch one_token_batch = llama_batch_get_one(&decode_token, 1);
    if (llama_decode(context_, one_token_batch) != 0) {
      throw std::runtime_error(
          "LlamaGenerator: decode failed during generation");
    }
  }

  /**
   * DETOKENIZATION PHASE
   * Convert generated token IDs back to text using vocabulary
   */
  std::string output;
  for (const llama_token token : generated_tokens) {
    AppendTokenPiecePublic(vocab, token, output);
  }

  return output;
}
