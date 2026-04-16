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
#include <string_view>
#include <vector>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"
#include "llama.h"

static constexpr size_t kPromptTokenSlack = 8;

namespace {

using SamplerHandle = std::unique_ptr<llama_sampler, decltype(&llama_sampler_free)>;

struct SamplerConfig {
  float temperature;
  uint32_t top_k;
  float top_p;
  uint32_t seed;
};

SamplerHandle MakeSamplerChain(const llama_vocab* vocab,
                               const SamplerConfig& config,
                               std::string_view grammar) {
  const llama_sampler_chain_params sampler_params =
      llama_sampler_chain_default_params();

  SamplerHandle chain(llama_sampler_chain_init(sampler_params),
                      llama_sampler_free);
  if (!chain) {
    throw std::runtime_error("LlamaGenerator: failed to initialize sampler");
  }

  auto add_sampler = [&](llama_sampler* sampler, const char* error_message) {
    if (sampler == nullptr) {
      throw std::runtime_error(error_message);
    }

    llama_sampler_chain_add(chain.get(), sampler);
  };

  if (!grammar.empty()) {
    const std::string grammar_text(grammar);
    add_sampler(llama_sampler_init_grammar(vocab, grammar_text.c_str(), "root"),
                "LlamaGenerator: failed to initialize grammar sampler");
  }

  add_sampler(llama_sampler_init_temp(config.temperature),
              "LlamaGenerator: failed to initialize temperature sampler");
  add_sampler(llama_sampler_init_top_k(static_cast<int32_t>(config.top_k)),
              "LlamaGenerator: failed to initialize top-k sampler");
  add_sampler(llama_sampler_init_top_p(config.top_p, 1),
              "LlamaGenerator: failed to initialize top-p sampler");
  add_sampler(llama_sampler_init_dist(config.seed),
              "LlamaGenerator: failed to initialize distribution sampler");

  return chain;
}

}  // namespace

std::string LlamaGenerator::Infer(const std::string& system_prompt,
                                  const std::string& prompt,
                                  const int max_tokens,
                                  std::string_view grammar) {
  return InferFormatted(ToChatPrompt(model_.get(), system_prompt, prompt),
                        max_tokens, grammar);
}

std::string LlamaGenerator::InferFormatted(const std::string& formatted_prompt,
                                           const int max_tokens,
                                           std::string_view grammar) {
  /**
   * Validate that model and context are loaded
   */
  if (!model_ || !context_) {
    throw std::runtime_error("LlamaGenerator: model not loaded");
  }

  /**
   * Get vocabulary for tokenization and token-to-text conversion
   */
  const llama_vocab* vocab = llama_model_get_vocab(model_.get());
  if (vocab == nullptr) {
    throw std::runtime_error("LlamaGenerator: vocab unavailable");
  }

  const SamplerConfig sampler_config{
      .temperature = sampling_temperature_,
      .top_k = sampling_top_k_,
      .top_p = sampling_top_p_,
      .seed = static_cast<uint32_t>(rng_()),
  };
  auto sampler = MakeSamplerChain(vocab, sampler_config, grammar);

  /**
   * Clear KV cache to ensure clean inference state (no residual context)
   */
  llama_memory_clear(llama_get_memory(context_.get()), true);

  /**
   * TOKENIZATION PHASE
   * Convert text prompt into token IDs (integers) that the model understands
   */
  std::vector<llama_token> prompt_tokens(formatted_prompt.size() +
                                         kPromptTokenSlack);




  int32_t token_count = llama_tokenize(
      vocab,
      formatted_prompt.c_str(),
      static_cast<int32_t>(formatted_prompt.size()),
      prompt_tokens.data(),
      static_cast<int32_t>(prompt_tokens.size()),
      true,
      true);

  /**
   * If buffer too small, negative return indicates required size
   */
  if (token_count < 0) {
    prompt_tokens.resize(static_cast<size_t>(-token_count));


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
  const auto n_ctx = static_cast<int32_t>(llama_n_ctx(context_.get()));
  const auto n_batch = static_cast<int32_t>(llama_n_batch(context_.get()));
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
  prompt_tokens.resize(static_cast<size_t>(token_count));
  if (token_count > prompt_budget) {
    spdlog::warn(
        "LlamaGenerator: prompt too long ({} tokens), truncating to {} "
        "tokens to fit n_batch/n_ctx limits",
        token_count, prompt_budget);
    prompt_tokens.resize(static_cast<size_t>(prompt_budget));
    token_count = prompt_budget;
  }

  /**
   * PROMPT PROCESSING PHASE
   * Create a batch containing all prompt tokens and feed through the model
   * This computes internal representations and fills the KV cache
   */
  const llama_batch prompt_batch = llama_batch_get_one(
      prompt_tokens.data(), static_cast<int32_t>(prompt_tokens.size()));
  if (llama_decode(context_.get(), prompt_batch) != 0) {
    throw std::runtime_error("LlamaGenerator: prompt decode failed");
  }

  /**
   * TOKEN GENERATION LOOP
   * Iteratively generate tokens one at a time until max_tokens or
   * end-of-sequence
   */
  std::vector<llama_token> generated_tokens;
  generated_tokens.reserve(static_cast<size_t>(effective_max_tokens));

  for (int i = 0; i < effective_max_tokens; ++i) {
    /**
     * Sample next token using configured sampler chain and model logits
     * Index -1 means use the last output position from previous batch
     */
    const llama_token next =
        llama_sampler_sample(sampler.get(), context_.get(), -1);
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
    if (llama_decode(context_.get(), one_token_batch) != 0) {
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
    AppendTokenPiece(vocab, token, output);
  }

  return output;
}
