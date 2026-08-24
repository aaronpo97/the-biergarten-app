/**
 * @file data_generation/openai/generate_brewery.cc
 * @brief Builds brewery prompts with regional context, calls the OpenAI
 * Chat Completions API, and validates structured JSON output for brewery
 * records.
 */

#include <format>
#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

#include "data_generation/generation_json_validation.h"
#include "data_generation/openai_generator.h"
#include "data_generation/openai_json_schemas.h"

namespace {

std::string FormatLocalLanguageCodes(const std::vector<std::string>& codes) {
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

constexpr int kBreweryMaxTokens = 2800;

// Structured outputs already guarantee schema-valid JSON, so retries here only
// cover transient failures or the model returning placeholder text.
constexpr int kMaxAttempts = 2;

}  // namespace

BreweryResult OpenAIGenerator::GenerateBrewery(
    const EnrichedCity& enriched_city) {
   const City& location = enriched_city.location;
   const std::string& region_context = enriched_city.region_context;
   const std::string safe_region_context = PrepareRegionContext(region_context);

   const std::string local_language_codes =
       FormatLocalLanguageCodes(location.local_languages);

   /**
    * Loads the backend-agnostic brewery system prompt via the injected prompt
    * directory.
    */
   const std::string system_prompt =
       prompt_directory_->Load("BREWERY_GENERATION");

   std::string user_prompt = std::format(
       "## CITY:\n{}\n\n## COUNTRY:\n{}\n\n## LOCAL LANGUAGE CODES:\n{}\n\n## "
       "CONTEXT:\n{}",
       location.city, location.country, local_language_codes,
       safe_region_context);

   const std::string retry_location =
       std::format("City: {}, {}\nLocal language codes: {}", location.city,
                   location.country, local_language_codes);

   std::string raw;
   std::string last_error;

   for (int attempt = 0; attempt < kMaxAttempts; ++attempt) {
      raw =
          CallChatCompletionsApi(system_prompt, user_prompt, kBreweryJsonSchema,
                                 "brewery_result", kBreweryMaxTokens);
      if (logger_) {
         logger_->Log({.level = LogLevel::Debug,
                       .phase = PipelinePhase::BreweryAndBeerGeneration,
                       .message = std::format(
                           "OpenAIGenerator: raw output (attempt {}): {}",
                           attempt + 1, raw)});
      }

      BreweryResult brewery;
      const std::optional<std::string> validation_error =
          ValidateBreweryJson(raw, brewery);

      if (!validation_error.has_value()) {
         if (logger_) {
            logger_->Log({.level = LogLevel::Info,
                          .phase = PipelinePhase::BreweryAndBeerGeneration,
                          .message = std::format(
                              "OpenAIGenerator: successfully generated "
                              "brewery data on attempt {}",
                              attempt + 1)});
         }

         return brewery;
      }

      last_error = *validation_error;
      if (logger_) {
         logger_->Log(
             {.level = LogLevel::Warn,
              .phase = PipelinePhase::BreweryAndBeerGeneration,
              .message = std::format(
                  "OpenAIGenerator: malformed brewery JSON (attempt {}): {}",
                  attempt + 1, *validation_error)});
      }

      user_prompt = std::format(
          "Your previous response was invalid. Error: {}\nReturn real "
          "content matching the required schema -- do not return "
          "placeholder values.\n\n{}",
          *validation_error, retry_location);
   }

   if (logger_) {
      logger_->Log({.level = LogLevel::Error,
                    .phase = PipelinePhase::BreweryAndBeerGeneration,
                    .message = std::format(
                        "OpenAIGenerator: malformed brewery "
                        "response after {} attempts: {}",
                        kMaxAttempts, last_error.empty() ? raw : last_error)});
   }
   throw std::runtime_error("OpenAIGenerator: malformed brewery response");
}
