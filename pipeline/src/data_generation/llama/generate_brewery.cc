/**
 * @file data_generation/llama/generate_brewery.cc
 * @brief Builds brewery prompts with regional context, performs retry-based
 * inference, and validates structured JSON output for brewery records.
 */

#include <spdlog/spdlog.h>

#include <array>
#include <format>
#include <optional>
#include <stdexcept>
#include <string>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

static std::string ExtractFinalJsonPayload(std::string raw_response) {
  auto trim = [](const std::string_view text) -> std::string_view {
    const std::size_t first = text.find_first_not_of(" \t\n\r");
    if (first == std::string_view::npos) {
      return {};
    }

    const std::size_t last = text.find_last_not_of(" \t\n\r");
    return text.substr(first, last - first + 1);
  };

  static constexpr std::array<std::string_view, 6> separator_tokens = {
      "<|think|>", "<think|>",   "<|turn|>",
      "<turn|>",   "<channel|>", "<|channel|>"};

  std::size_t separator_pos = std::string::npos;
  std::size_t separator_length = 0;
  for (const std::string_view token : separator_tokens) {
    const std::size_t candidate_pos = raw_response.rfind(token);
    if (candidate_pos != std::string::npos &&
        (separator_pos == std::string::npos || candidate_pos > separator_pos)) {
      separator_pos = candidate_pos;
      separator_length = token.size();
    }
  }

  if (separator_pos != std::string::npos) {
    raw_response.erase(0, separator_pos + separator_length);
  }

  const std::string_view trimmed = trim(raw_response);
  const std::string json_candidate =
      ExtractLastJsonObjectPublic(std::string(trimmed));

  if (!json_candidate.empty()) {
    return ExtractLastJsonObjectPublic(std::string(trimmed));
  }

  return std::string(trimmed);
}

BreweryResult LlamaGenerator::GenerateBrewery(
    const Location& location, const std::string& region_context) {
  /**
   * Preprocess and truncate region context to manageable size
   */
  const std::string safe_region_context =
      PrepareRegionContextPublic(region_context);

  const std::string country_suffix =
      location.country.empty() ? std::string{}
                               : std::format(", {}", location.country);
  const std::string region_suffix =
      safe_region_context.empty()
          ? "."
          : std::format(". Regional context: {}", safe_region_context);

  /**
   * Load brewery system prompt from file
   * Falls back to minimal inline prompt if file not found
   */
  const std::string system_prompt =
      LoadBrewerySystemPrompt("prompts/system.md");

  /**
   * User prompt: provides geographic context to guide generation towards
   * culturally relevant and locally-inspired brewery attributes
   */
  std::string prompt = std::format(
      "Write a brewery name and place-specific long description for a craft "
      "brewery in {}{}{}",
      location.city, country_suffix, region_suffix);

  /**
   * Store location context for retry prompts (without repeating full context)
   */
  const std::string retry_location =
      std::format("Location: {}{}", location.city, country_suffix);

  /**
   * RETRY LOOP with validation and error correction
   * Attempts to generate valid brewery data up to 3 times, with feedback-based
   * refinement
   */
  constexpr int max_attempts = 3;
  std::string raw;
  std::string last_error;

  // Limit output length to keep it concise and focused
  for (int attempt = 0; attempt < max_attempts; ++attempt) {
    constexpr int max_tokens = 1052;
    // Generate brewery data from LLM
    raw = this->Infer(system_prompt, prompt, max_tokens);
    spdlog::debug("LlamaGenerator: raw output (attempt {}): {}", attempt + 1,
                  raw);

    // Validate output: parse JSON and check required fields

    std::string name;
    std::string description;
    const std::string json_only = ExtractFinalJsonPayload(raw);
    const std::optional<std::string> validation_error =
        ValidateBreweryJsonPublic(json_only, name, description);
    if (!validation_error.has_value()) {
      // Success: return parsed brewery data
      return BreweryResult{.name = std::move(name),
                           .description = std::move(description)};
    }

    // Validation failed: log error and prepare corrective feedback

    last_error = *validation_error;
    spdlog::warn("LlamaGenerator: malformed brewery JSON (attempt {}): {}",
                 attempt + 1, *validation_error);

    // Update prompt with error details to guide LLM toward correct output.
    prompt = std::format(
        R"(Your previous response was invalid. Error: {}
Return ONLY valid JSON with exactly these keys: {{"name": "<brewery name>", "description": "<single-paragraph description>"}}.
Do not include markdown, comments, extra keys, or literal placeholder values.

{})",
        *validation_error, retry_location);
  }

  // All retry attempts exhausted: log failure and throw exception
  spdlog::error(
      "LlamaGenerator: malformed brewery response after {} attempts: "
      "{}",
      max_attempts, last_error.empty() ? raw : last_error);
  throw std::runtime_error("LlamaGenerator: malformed brewery response");
}
