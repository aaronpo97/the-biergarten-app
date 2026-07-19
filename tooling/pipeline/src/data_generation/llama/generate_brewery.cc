/**
 * @file data_generation/llama/generate_brewery.cc
 * @brief Builds brewery prompts with regional context, performs retry-based
 * inference, and validates structured JSON output for brewery records.
 */

#include <chrono>
#include <format>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

#include "data_generation/json_grammars.h"
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

static constexpr int kBreweryInitialMaxTokens = 2800;

BreweryResult LlamaGenerator::GenerateBrewery(
    const EnrichedCity& enriched_city) {
  const City& location = enriched_city.location;
  const std::string& region_context = enriched_city.region_context;
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
   * Load brewery system prompt via the injected prompt directory.
   * The key "BREWERY_GENERATION" resolves to BREWERY_GENERATION.md inside
   * the configured --prompt-dir.  Throws on missing or empty file.
   */
  const std::string system_prompt =
      prompt_directory_->Load("BREWERY_GENERATION");

  std::string user_prompt = std::format(
      "## CITY:\n{}\n\n## COUNTRY:\n{}\n\n## LOCAL LANGUAGE CODES:\n{}\n\n## "
      "CONTEXT:\n{}",
      location.city, location.country, local_language_codes,
      safe_region_context);

  /**
   * Store location context for retry prompts (without repeating full context)
   */
  const std::string retry_location =
      std::format("City: {}{}\nLocal language codes: {}", location.city,
                  country_suffix, local_language_codes);

  /**
   * RETRY LOOP with validation and error correction
   * Attempts to generate valid brewery data up to 3 times, with
   * feedback-based refinement
   */
  constexpr int max_attempts = 3;
  std::string raw;
  std::string last_error;

  // Token budget: too small risks truncating valid JSON mid-string.
  int max_tokens = kBreweryInitialMaxTokens;

  // Limit output length to keep it concise and focused
  for (int attempt = 0; attempt < max_attempts; ++attempt) {
    // Generate brewery data from LLM
    raw = this->Infer(system_prompt, user_prompt, max_tokens,
                      kBreweryJsonGrammar);
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Debug,
           .phase = PipelinePhase::BreweryAndBeerGeneration,
           .message = std::format("LlamaGenerator: raw output (attempt {}): {}",
                                  attempt + 1, raw)});
    }

    // Validate output: parse JSON and check required fields

    BreweryResult brewery;
    const std::optional<std::string> validation_error =
        ValidateBreweryJson(raw, brewery);

    if (!validation_error.has_value()) {
      // Success: return parsed brewery data

      if (logger_) {
        logger_->Log(
            {.level = LogLevel::Info,
             .phase = PipelinePhase::BreweryAndBeerGeneration,
             .message = std::format("LlamaGenerator: successfully generated "
                                    "brewery data on attempt {}",
                                    attempt + 1)});
      }

      return brewery;
    }

    // Validation failed: log error and prepare corrective feedback

    last_error = *validation_error;
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::BreweryAndBeerGeneration,
           .message = std::format(
               "LlamaGenerator: malformed brewery JSON (attempt {}): {}",
               attempt + 1, *validation_error)});
    }

    // Update prompt with error details to guide LLM toward correct output.
    user_prompt = std::format(
        "Your previous response was invalid. Error: {}\nReturn the thought "
        "process before the JSON if needed, then return ONLY valid JSON "
        "with "
        "exactly these keys, in this exact order: {{\"name_en\": "
        "\"<English "
        "brewery name>\", \"description_en\": \"<English single-paragraph "
        "description>\", \"name_local\": \"<local-language brewery "
        "name>\", "
        "\"description_local\": \"<local-language single-paragraph "
        "description>\"}}.\nDo not include markdown, comments, extra keys, "
        "or "
        "literal placeholder values.\n\nKeep the JSON strings concise "
        "enough "
        "to fit within the token budget.\n\n{}",
        *validation_error, retry_location);
  }

  // All retry attempts exhausted: log failure and throw exception
  if (logger_) {
    logger_->Log({.level = LogLevel::Error,
                  .phase = PipelinePhase::BreweryAndBeerGeneration,
                  .message = std::format(
                      "LlamaGenerator: malformed brewery "
                      "response after {} attempts: {}",
                      max_attempts, last_error.empty() ? raw : last_error)});
  }
  throw std::runtime_error("LlamaGenerator: malformed brewery response");
}
