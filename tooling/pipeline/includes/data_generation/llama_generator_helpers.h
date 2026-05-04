#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_

/**
 * @file data_generation/llama_generator_helpers.h
 * @brief Shared helper APIs used by LlamaGenerator translation units.
 */

#include <cstddef>
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>

#include "data_model/generated_models.h"

struct llama_vocab;
using llama_token = int32_t;

/**
 * @brief Normalizes and truncates regional context.
 *
 * @param region_context Input regional context text.
 * @param max_chars Maximum output length.
 * @return Processed region context.
 */
std::string PrepareRegionContext(std::string_view region_context,
                                 size_t max_chars = 2000);

/**
 * @brief Decodes a sampled token and appends it to output text.
 *
 * @param vocab Model vocabulary.
 * @param token Sampled token id.
 * @param output Output text buffer.
 */
void AppendTokenPiece(const llama_vocab* vocab, llama_token token,
                      std::string& output);

/**
 * @brief Validates and parses brewery JSON output.
 *
 * @param raw Raw model output.
 * @param brewery_out Parsed brewery payload.
 * @return Validation error message if invalid, or std::nullopt on success.
 */
std::optional<std::string> ValidateBreweryJson(const std::string& raw,
                                               BreweryResult& brewery_out);

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_
