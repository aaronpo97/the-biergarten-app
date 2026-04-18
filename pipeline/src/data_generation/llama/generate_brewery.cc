/**
 * @file data_generation/llama/generate_brewery.cc
 * @brief Builds brewery prompts with regional context, performs retry-based
 * inference, and validates structured JSON output for brewery records.
 */

#include "data_generation/llama_generator.h"

#include <format>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>

#include <spdlog/spdlog.h>

#include "data_generation/llama_generator_helpers.h"

static constexpr std::string_view kBreweryJsonGrammar = R"json_brewery(
root ::= thought-block "{" ws "\"name_en\"" ws ":" ws string ws "," ws "\"description_en\"" ws ":" ws string ws "," ws "\"name_local\"" ws ":" ws string ws "," ws "\"description_local\"" ws ":" ws string ws "}" ws
thought-block ::= [^{]*
ws ::= [ \t\n\r]*
string ::= "\"" char+ "\""
char ::= [^"\\\x7F\x00-\x1F] | [\\] escape
escape ::= ["\\/bfnrt] | "u" hex hex hex hex
hex ::= [0-9a-fA-F]
)json_brewery";

static constexpr int kBreweryInitialMaxTokens = 2800;
static constexpr int kBreweryTruncationRetryTokenBump = 700;
static constexpr int kBreweryMaxTokensCeiling = 5000;

BreweryResult LlamaGenerator::GenerateBrewery(
    const Location& location, const std::string& region_context) {
  /**
   * Preprocess and truncate region context to manageable size
   */
  const std::string safe_region_context =
      PrepareRegionContext(region_context);

  const std::string country_suffix =
      location.country.empty() ? std::string{}
                               : std::format(", {}", location.country);
  /**
   * Load brewery system prompt from file
   * Falls back to minimal inline prompt if file not found
   */
  const std::string system_prompt =
      LoadBrewerySystemPrompt("prompts/system.md");


  std::string user_prompt = std::format(
      "## CITY:\n{}\n\n## COUNTRY:\n{}\n\n## CONTEXT:\n{}",
      location.city, location.country, safe_region_context);

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

    // Token budget: too small risks truncating valid JSON mid-string.
    // Start conservatively but allow adaptive increases on truncation.
    int max_tokens = kBreweryInitialMaxTokens;

  // Limit output length to keep it concise and focused
  for (int attempt = 0; attempt < max_attempts; ++attempt) {
    // Generate brewery data from LLM
    raw = this->Infer(system_prompt, user_prompt, max_tokens, kBreweryJsonGrammar);
    spdlog::info("LlamaGenerator: raw output (attempt {}): {}", attempt + 1,
                  raw);

    // Validate output: parse JSON and check required fields

    BreweryResult brewery;
    const std::optional<std::string> validation_error =
        ValidateBreweryJson(raw, brewery);

    if (!validation_error.has_value()) {
      // Success: return parsed brewery data

      spdlog::info(
          "LlamaGenerator: successfully generated brewery data on attempt {}:\n name_en='{}',\n description_en='{}',\n name_local='{}',\n description_local='{}'",
          attempt + 1, brewery.name_en, brewery.description_en,
          brewery.name_local, brewery.description_local);

      return brewery;
    }

    // Validation failed: log error and prepare corrective feedback

    last_error = *validation_error;
    spdlog::warn("LlamaGenerator: malformed brewery JSON (attempt {}): {}",
                 attempt + 1, *validation_error);


        if (last_error == "JSON parse error: incomplete JSON") {
            const int previous_max_tokens = max_tokens;
            max_tokens = std::min(max_tokens + kBreweryTruncationRetryTokenBump,
                                                        kBreweryMaxTokensCeiling);
      spdlog::info(
          "LlamaGenerator: detected truncated JSON; increasing max_tokens from {} to {} and retrying",
          previous_max_tokens, max_tokens);

      continue;
    }

    // Update prompt with error details to guide LLM toward correct output.
    user_prompt = std::format(
        R"(Your previous response was invalid. Error: {}
Return the thought process before the JSON if needed, then return ONLY valid JSON with exactly these keys, in this exact order: {{"name_en": "<English brewery name>", "description_en": "<English single-paragraph description>", "name_local": "<local-language brewery name>", "description_local": "<local-language single-paragraph description>"}}.
Do not include markdown, comments, extra keys, or literal placeholder values.

Keep the JSON strings concise enough to fit within the token budget.

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
