/**
 * Brewery Data Generation Module
 * Uses the LLM to generate realistic brewery names and descriptions for a given
 * location. Implements retry logic with validation and error correction to
 * ensure valid JSON output conforming to the expected schema.
 */

#include <spdlog/spdlog.h>

#include <stdexcept>
#include <string>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

BreweryResult LlamaGenerator::GenerateBrewery(
    const std::string& city_name, const std::string& country_name,
    const std::string& region_context) {
   /**
    * Preprocess and truncate region context to manageable size
    */
   const std::string safe_region_context =
       PrepareRegionContextPublic(region_context);

   /**
    * System prompt: establishes role and output format constraints
    * Instructs LLM to roleplay as brewery owner and output only JSON
    */
   const std::string system_prompt =
       "You are the brewmaster and owner of a local craft brewery. "
       "Write a name and a short, soulful description for your brewery that "
       "reflects your pride in the local community and your craft. "
       "The tone should be authentic and welcoming, like a note on a "
       "chalkboard "
       "menu. Output ONLY a single JSON object with keys \"name\" and "
       "\"description\". "
       "Do not include markdown formatting or backticks.";

   /**
    * User prompt: provides geographic context to guide generation towards
    * culturally appropriate and locally-inspired brewery attributes
    */
   std::string prompt =
       "Write a brewery name and place-specific long description for a craft "
       "brewery in " +
       city_name +
       (country_name.empty() ? std::string("")
                             : std::string(", ") + country_name) +
       (safe_region_context.empty()
            ? std::string(".")
            : std::string(". Regional context: ") + safe_region_context);

   /**
    * Store location context for retry prompts (without repeating full context)
    */
   const std::string retry_location =
       "Location: " + city_name +
       (country_name.empty() ? std::string("")
                             : std::string(", ") + country_name);

   /**
    * RETRY LOOP with validation and error correction
    * Attempts to generate valid brewery data up to 3 times, with feedback-based
    * refinement
    */
   const int max_attempts = 3;
   std::string raw;
   std::string last_error;

   // Limit output length to keep it concise and focused
   constexpr int max_tokens = 1052;
   for (int attempt = 0; attempt < max_attempts; ++attempt) {
      // Generate brewery data from LLM
      raw = Infer(system_prompt, prompt, max_tokens);
      spdlog::debug("LlamaGenerator: raw output (attempt {}): {}", attempt + 1,
                    raw);

      // Validate output: parse JSON and check required fields

      std::string name;
      std::string description;
      const std::string validation_error =
          ValidateBreweryJsonPublic(raw, name, description);
      if (validation_error.empty()) {
         // Success: return parsed brewery data
         return {std::move(name), std::move(description)};
      }

      // Validation failed: log error and prepare corrective feedback

      last_error = validation_error;
      spdlog::warn("LlamaGenerator: malformed brewery JSON (attempt {}): {}",
                   attempt + 1, validation_error);

      // Update prompt with error details to guide LLM toward correct output.
      // For retries, use a compact prompt format to avoid exceeding token
      // limits.
      prompt =
          "Your previous response was invalid. Error: " + validation_error +
          "\nReturn ONLY valid JSON with this exact schema: "
          "{\"name\": \"string\", \"description\": \"string\"}."
          "\nDo not include markdown, comments, or extra keys."
          "\n\n" +
          retry_location;
   }

   // All retry attempts exhausted: log failure and throw exception
   spdlog::error(
       "LlamaGenerator: malformed brewery response after {} attempts: "
       "{}",
       max_attempts, last_error.empty() ? raw : last_error);
   throw std::runtime_error("LlamaGenerator: malformed brewery response");
}
