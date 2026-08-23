#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_GENERATION_JSON_VALIDATION_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_GENERATION_JSON_VALIDATION_H_

/**
 * @file data_generation/generation_json_validation.h
 * @brief Generator-agnostic helpers for preparing prompt context and
 * validating structured JSON output. Shared across all DataGenerator
 * implementations (Llama, OpenAI, ...).
 */

#include <cstddef>
#include <optional>
#include <string>
#include <string_view>

#include "data_model/generated_models.h"

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
 * @brief Validates and parses brewery JSON output.
 *
 * @param raw Raw model output.
 * @param brewery_out Parsed brewery payload.
 * @return Validation error message if invalid, or std::nullopt on success.
 */
std::optional<std::string> ValidateBreweryJson(const std::string& raw,
                                               BreweryResult& brewery_out);

/**
 * @brief Validates and parses user JSON output.
 *
 * Only populates `username`, `bio`, and `activity_weight` -- `first_name`
 * and `last_name` are not LLM-authored and are set separately from the
 * sampled Name.
 *
 * @param raw Raw model output.
 * @param user_out Parsed user payload.
 * @return Validation error message if invalid, or std::nullopt on success.
 */
std::optional<std::string> ValidateUserJson(const std::string& raw,
                                            UserResult& user_out);

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_GENERATION_JSON_VALIDATION_H_
