/**
 * @file data_generation/llama/generate_user.cpp
 * @brief Generates locale-aware user profiles with strict two-line formatting,
 * retry handling, and output sanitization for downstream parsing.
 */

#include <spdlog/spdlog.h>

#include <algorithm>
#include <stdexcept>
#include <string>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

UserResult LlamaGenerator::GenerateUser(const std::string& locale) {
   /**
    * System prompt: specifies exact output format to minimize parsing errors
    * Constraints: 2-line output, username format, bio length bounds
    */
   const std::string system_prompt =
       "You generate plausible social media profiles for craft beer "
       "enthusiasts. "
       "Respond with exactly two lines: "
       "the first line is a username (lowercase, no spaces, 8-20 characters), "
       "the second line is a one-sentence bio (20-40 words). "
       "The profile should feel consistent with the locale. "
       "No preamble, no labels.";

   /**
    * User prompt: locale parameter guides cultural appropriateness of generated
    * profiles
    */
   std::string prompt =
       "Generate a craft beer enthusiast profile. Locale: " + locale;

   /**
    * RETRY LOOP with format validation
    * Attempts up to 3 times to generate valid user profile with correct format
    */
   const int max_attempts = 3;
   std::string raw;
   for (int attempt = 0; attempt < max_attempts; ++attempt) {
      /**
       * Generate user profile (max 128 tokens - should fit 2 lines easily)
       */
      raw = Infer(system_prompt, prompt, 128);
      spdlog::debug("LlamaGenerator (user): raw output (attempt {}): {}",
                    attempt + 1, raw);

      try {
         /**
          * Parse two-line response: first line = username, second line = bio
          */
         auto [username, bio] = ParseTwoLineResponsePublic(
             raw, "LlamaGenerator: malformed user response");

         /**
          * Remove any whitespace from username (usernames shouldn't have
          * spaces)
          */
         username.erase(
             std::remove_if(username.begin(), username.end(),
                            [](unsigned char ch) { return std::isspace(ch); }),
             username.end());

         /**
          * Validate both fields are non-empty after processing
          */
         if (username.empty() || bio.empty()) {
            throw std::runtime_error("LlamaGenerator: malformed user response");
         }

         /**
          * Truncate bio if exceeds reasonable length for bio field
          */
         if (bio.size() > 200) bio = bio.substr(0, 200);

         /**
          * Success: return parsed user profile
          */
         return {username, bio};
      } catch (const std::exception& e) {
         /**
          * Parsing failed: log and continue to next attempt
          */
         spdlog::warn(
             "LlamaGenerator: malformed user response (attempt {}): {}",
             attempt + 1, e.what());
      }
   }

   /**
    * All retry attempts exhausted: log failure and throw exception
    */
   spdlog::error(
       "LlamaGenerator: malformed user response after {} attempts: {}",
       max_attempts, raw);
   throw std::runtime_error("LlamaGenerator: malformed user response");
}
