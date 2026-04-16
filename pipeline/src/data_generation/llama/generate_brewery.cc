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
root ::= ws "{" ws "\"reasoning\"" ws ":" ws string ws "," ws "\"name\"" ws ":" ws string ws "," ws "\"description\"" ws ":" ws string ws "}" ws
ws ::= [ \t\n\r]*
string ::= "\"" char+ "\""
char ::= [^"\\\x7F\x00-\x1F] | [\\] escape
escape ::= ["\\/bfnrt] | "u" hex hex hex hex
hex ::= [0-9a-fA-F]
)json_brewery";

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

  /**
   * User prompt: provides geographic context to guide generation towards
   * culturally relevant and locally-inspired brewery attributes
   */
  std::string prompt = std::format(
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

  // Limit output length to keep it concise and focused
  for (int attempt = 0; attempt < max_attempts; ++attempt) {
    constexpr int max_tokens = 1052;
    // Generate brewery data from LLM
    raw = this->Infer(system_prompt, prompt, max_tokens, kBreweryJsonGrammar);
    spdlog::debug("LlamaGenerator: raw output (attempt {}): {}", attempt + 1,
                  raw);

    // Validate output: parse JSON and check required fields

    std::string name;
    std::string description;
    const std::optional<std::string> validation_error =
        ValidateBreweryJson(raw, name, description);
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
Return ONLY valid JSON with exactly these keys, in this exact order: {{"reasoning": "<brief planning summary>", "name": "<brewery name>", "description": "<single-paragraph description>"}}.
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
