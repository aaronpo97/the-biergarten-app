#include <spdlog/spdlog.h>

#include <algorithm>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"
#include "llama.h"

std::string LlamaGenerator::Infer(const std::string& prompt, int max_tokens) {
   if (model_ == nullptr || context_ == nullptr)
      throw std::runtime_error("LlamaGenerator: model not loaded");

   const llama_vocab* vocab = llama_model_get_vocab(model_);
   if (vocab == nullptr)
      throw std::runtime_error("LlamaGenerator: vocab unavailable");

   llama_memory_clear(llama_get_memory(context_), true);

   const std::string formatted_prompt = ToChatPromptPublic(model_, prompt);

   std::vector<llama_token> prompt_tokens(formatted_prompt.size() + 8);
   int32_t token_count = llama_tokenize(
       vocab, formatted_prompt.c_str(),
       static_cast<int32_t>(formatted_prompt.size()), prompt_tokens.data(),
       static_cast<int32_t>(prompt_tokens.size()), true, true);

   if (token_count < 0) {
      prompt_tokens.resize(static_cast<std::size_t>(-token_count));
      token_count = llama_tokenize(
          vocab, formatted_prompt.c_str(),
          static_cast<int32_t>(formatted_prompt.size()), prompt_tokens.data(),
          static_cast<int32_t>(prompt_tokens.size()), true, true);
   }

   if (token_count < 0)
      throw std::runtime_error("LlamaGenerator: prompt tokenization failed");

   const int32_t n_ctx = static_cast<int32_t>(llama_n_ctx(context_));
   const int32_t n_batch = static_cast<int32_t>(llama_n_batch(context_));
   if (n_ctx <= 1 || n_batch <= 0) {
      throw std::runtime_error("LlamaGenerator: invalid context or batch size");
   }

   const int32_t effective_max_tokens =
       std::max(1, std::min(max_tokens, n_ctx - 1));
   int32_t prompt_budget = std::min(n_batch, n_ctx - effective_max_tokens);
   prompt_budget = std::max<int32_t>(1, prompt_budget);

   prompt_tokens.resize(static_cast<std::size_t>(token_count));
   if (token_count > prompt_budget) {
      spdlog::warn(
          "LlamaGenerator: prompt too long ({} tokens), truncating to {} "
          "tokens "
          "to fit n_batch/n_ctx limits",
          token_count, prompt_budget);
      prompt_tokens.resize(static_cast<std::size_t>(prompt_budget));
      token_count = prompt_budget;
   }

   const llama_batch prompt_batch = llama_batch_get_one(
       prompt_tokens.data(), static_cast<int32_t>(prompt_tokens.size()));
   if (llama_decode(context_, prompt_batch) != 0)
      throw std::runtime_error("LlamaGenerator: prompt decode failed");

   llama_sampler_chain_params sampler_params =
       llama_sampler_chain_default_params();
   using SamplerPtr =
       std::unique_ptr<llama_sampler, decltype(&llama_sampler_free)>;
   SamplerPtr sampler(llama_sampler_chain_init(sampler_params),
                      &llama_sampler_free);
   if (!sampler)
      throw std::runtime_error("LlamaGenerator: failed to initialize sampler");

   llama_sampler_chain_add(sampler.get(),
                           llama_sampler_init_temp(sampling_temperature_));
   llama_sampler_chain_add(sampler.get(),
                           llama_sampler_init_top_p(sampling_top_p_, 1));
   llama_sampler_chain_add(sampler.get(),
                           llama_sampler_init_dist(sampling_seed_));

   std::vector<llama_token> generated_tokens;
   generated_tokens.reserve(static_cast<std::size_t>(max_tokens));

   for (int i = 0; i < effective_max_tokens; ++i) {
      const llama_token next =
          llama_sampler_sample(sampler.get(), context_, -1);
      if (llama_vocab_is_eog(vocab, next)) break;
      generated_tokens.push_back(next);
      llama_token token = next;
      const llama_batch one_token_batch = llama_batch_get_one(&token, 1);
      if (llama_decode(context_, one_token_batch) != 0)
         throw std::runtime_error(
             "LlamaGenerator: decode failed during generation");
   }

   std::string output;
   for (const llama_token token : generated_tokens)
      AppendTokenPiecePublic(vocab, token, output);
   return output;
}

std::string LlamaGenerator::Infer(const std::string& system_prompt,
                                  const std::string& prompt, int max_tokens) {
   if (model_ == nullptr || context_ == nullptr)
      throw std::runtime_error("LlamaGenerator: model not loaded");

   const llama_vocab* vocab = llama_model_get_vocab(model_);
   if (vocab == nullptr)
      throw std::runtime_error("LlamaGenerator: vocab unavailable");

   llama_memory_clear(llama_get_memory(context_), true);

   const std::string formatted_prompt =
       ToChatPromptPublic(model_, system_prompt, prompt);

   std::vector<llama_token> prompt_tokens(formatted_prompt.size() + 8);
   int32_t token_count = llama_tokenize(
       vocab, formatted_prompt.c_str(),
       static_cast<int32_t>(formatted_prompt.size()), prompt_tokens.data(),
       static_cast<int32_t>(prompt_tokens.size()), true, true);

   if (token_count < 0) {
      prompt_tokens.resize(static_cast<std::size_t>(-token_count));
      token_count = llama_tokenize(
          vocab, formatted_prompt.c_str(),
          static_cast<int32_t>(formatted_prompt.size()), prompt_tokens.data(),
          static_cast<int32_t>(prompt_tokens.size()), true, true);
   }

   if (token_count < 0)
      throw std::runtime_error("LlamaGenerator: prompt tokenization failed");

   const int32_t n_ctx = static_cast<int32_t>(llama_n_ctx(context_));
   const int32_t n_batch = static_cast<int32_t>(llama_n_batch(context_));
   if (n_ctx <= 1 || n_batch <= 0) {
      throw std::runtime_error("LlamaGenerator: invalid context or batch size");
   }

   const int32_t effective_max_tokens =
       std::max(1, std::min(max_tokens, n_ctx - 1));
   int32_t prompt_budget = std::min(n_batch, n_ctx - effective_max_tokens);
   prompt_budget = std::max<int32_t>(1, prompt_budget);

   prompt_tokens.resize(static_cast<std::size_t>(token_count));
   if (token_count > prompt_budget) {
      spdlog::warn(
          "LlamaGenerator: prompt too long ({} tokens), truncating to {} "
          "tokens "
          "to fit n_batch/n_ctx limits",
          token_count, prompt_budget);
      prompt_tokens.resize(static_cast<std::size_t>(prompt_budget));
      token_count = prompt_budget;
   }

   const llama_batch prompt_batch = llama_batch_get_one(
       prompt_tokens.data(), static_cast<int32_t>(prompt_tokens.size()));
   if (llama_decode(context_, prompt_batch) != 0)
      throw std::runtime_error("LlamaGenerator: prompt decode failed");

   llama_sampler_chain_params sampler_params =
       llama_sampler_chain_default_params();
   using SamplerPtr =
       std::unique_ptr<llama_sampler, decltype(&llama_sampler_free)>;
   SamplerPtr sampler(llama_sampler_chain_init(sampler_params),
                      &llama_sampler_free);
   if (!sampler)
      throw std::runtime_error("LlamaGenerator: failed to initialize sampler");

   llama_sampler_chain_add(sampler.get(),
                           llama_sampler_init_temp(sampling_temperature_));
   llama_sampler_chain_add(sampler.get(),
                           llama_sampler_init_top_p(sampling_top_p_, 1));
   llama_sampler_chain_add(sampler.get(),
                           llama_sampler_init_dist(sampling_seed_));

   std::vector<llama_token> generated_tokens;
   generated_tokens.reserve(static_cast<std::size_t>(max_tokens));

   for (int i = 0; i < effective_max_tokens; ++i) {
      const llama_token next =
          llama_sampler_sample(sampler.get(), context_, -1);
      if (llama_vocab_is_eog(vocab, next)) break;
      generated_tokens.push_back(next);
      llama_token token = next;
      const llama_batch one_token_batch = llama_batch_get_one(&token, 1);
      if (llama_decode(context_, one_token_batch) != 0)
         throw std::runtime_error(
             "LlamaGenerator: decode failed during generation");
   }

   std::string output;
   for (const llama_token token : generated_tokens)
      AppendTokenPiecePublic(vocab, token, output);
   return output;
}
