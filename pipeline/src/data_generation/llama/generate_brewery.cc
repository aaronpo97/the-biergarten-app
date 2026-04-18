/**
 * @file data_generation/llama/generate_brewery.cc
 * @brief Builds brewery prompts with regional context, performs retry-based
 * inference, and validates structured JSON output for brewery records.
 */

#include <spdlog/spdlog.h>

#include <format>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

static std::string FormatLocalLanguageCodes(
    const std::vector<std::string>& codes) {
  if (codes.empty()) {
    return "Not provided";
  }

  std::string formatted;
  for (const std::string& code : codes) {
    if (!formatted.empty()) {
      formatted += ", ";
    }
    formatted += code;
  }

  return formatted;
}

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

BreweryResult LlamaGenerator::GenerateBrewery(
    const Location& location, const std::string& region_context) {
  /**
   * Preprocess and truncate region context to manageable size
   */
  const std::string safe_region_context = PrepareRegionContext(region_context);

  const std::string local_language_codes =
      FormatLocalLanguageCodes(location.local_languages);

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
      "## CITY:\n{}\n\n## COUNTRY:\n{}\n\n## LOCAL LANGUAGE CODES:\n{}\n\n## "
      "CONTEXT:\n{}",
      location.city, location.country, local_language_codes,
      safe_region_context);

  /**
   * Store location context for retry prompts (without repeating full context)
   */
  const std::string retry_location =
      std::format("Location: {}{}\nLocal language codes: {}", location.city,
                  country_suffix, local_language_codes);

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
    raw = this->Infer(system_prompt, user_prompt, max_tokens,
                      kBreweryJsonGrammar);
    spdlog::debug("LlamaGenerator: raw output (attempt {}): {}", attempt + 1,
                  raw);

    // Validate output: parse JSON and check required fields

    BreweryResult brewery;
    const std::optional<std::string> validation_error =
        ValidateBreweryJson(raw, brewery);

    if (!validation_error.has_value()) {
      // Success: return parsed brewery data

      spdlog::info(
          "LlamaGenerator: successfully generated brewery data on attempt {}",
          attempt + 1);

      return brewery;
    }

    // Validation failed: log error and prepare corrective feedback

    last_error = *validation_error;
    spdlog::warn("LlamaGenerator: malformed brewery JSON (attempt {}): {}",
                 attempt + 1, *validation_error);

    // Update prompt with error details to guide LLM toward correct output.
    user_prompt = std::format(
        "Your previous response was invalid. Error: {}\nReturn the thought "
        "process before the JSON if needed, then return ONLY valid JSON with "
        "exactly these keys, in this exact order: {{\"name_en\": \"<English "
        "brewery name>\", \"description_en\": \"<English single-paragraph "
        "description>\", \"name_local\": \"<local-language brewery name>\", "
        "\"description_local\": \"<local-language single-paragraph "
        "description>\"}}.\nDo not include markdown, comments, extra keys, or "
        "literal placeholder values.\n\nKeep the JSON strings concise enough "
        "to fit within the token budget.\n\n{}",
        *validation_error, retry_location);
  }

  // All retry attempts exhausted: log failure and throw exception
  spdlog::error(
      "LlamaGenerator: malformed brewery response after {} attempts: "
      "{}",
      max_attempts, last_error.empty() ? raw : last_error);
  throw std::runtime_error("LlamaGenerator: malformed brewery response");
}
