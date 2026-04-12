#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_

/**
 * @file data_generation/llama_generator_helpers.h
 * @brief Shared helper APIs used by LlamaGenerator translation units.
 */

#include <cstddef>
#include <optional>
#include <string>
#include <string_view>
#include <utility>

struct llama_model;
struct llama_vocab;
typedef int llama_token;

/**
 * @brief Normalizes and truncates regional context.
 *
 * @param region_context Input regional context text.
 * @param max_chars Maximum output length.
 * @return Processed region context.
 */
std::string PrepareRegionContextPublic(std::string_view region_context,
                                       std::size_t max_chars = 2000);

/**
 * @brief Parses a response expected to contain two logical lines.
 *
 * @param raw Raw model output.
 * @param error_message Error message thrown on parse failure.
 * @return Pair containing first and second parsed fields.
 */
std::pair<std::string, std::string> ParseTwoLineResponsePublic(
    const std::string& raw, const std::string& error_message);

/**
 * @brief Applies model chat template to system and user prompts.
 *
 * @param model Loaded llama model.
 * @param system_prompt System prompt text.
 * @param user_prompt User prompt text.
 * @return Model-formatted prompt.
 */
std::string ToChatPromptPublic(const llama_model* model,
                               const std::string& system_prompt,
                               const std::string& user_prompt);

/**
 * @brief Decodes a sampled token and appends it to output text.
 *
 * @param vocab Model vocabulary.
 * @param token Sampled token id.
 * @param output Output text buffer.
 */
void AppendTokenPiecePublic(const llama_vocab* vocab, llama_token token,
                            std::string& output);

/**
 * @brief Validates and parses brewery JSON output.
 *
 * @param raw Raw model output.
 * @param name_out Parsed brewery name.
 * @param description_out Parsed brewery description.
 * @return Validation error message if invalid, or std::nullopt on success.
 */
std::optional<std::string> ValidateBreweryJsonPublic(
    const std::string& raw, std::string& name_out,
    std::string& description_out);

/**
 * @brief Extracts the last balanced JSON object from text.
 *
 * @param text Input text.
 * @return Extracted JSON object or an empty string if none exists.
 */
std::string ExtractLastJsonObjectPublic(const std::string& text);

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_