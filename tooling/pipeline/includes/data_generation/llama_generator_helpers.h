#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_

/**
 * @file data_generation/llama_generator_helpers.h
 * @brief Llama.cpp-specific helper APIs used by LlamaGenerator translation
 * units. Generator-agnostic helpers (prompt-context prep, JSON validation)
 * live in data_generation/generation_json_validation.h instead.
 */

#include <cstdint>
#include <string>

struct llama_vocab;
using llama_token = int32_t;

/**
 * @brief Decodes a sampled token and appends it to output text.
 *
 * @param vocab Model vocabulary.
 * @param token Sampled token id.
 * @param output Output text buffer.
 */
void AppendTokenPiece(const llama_vocab* vocab, llama_token token,
                      std::string& output);

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_
