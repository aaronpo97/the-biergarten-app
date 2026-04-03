#include <spdlog/spdlog.h>

#include <algorithm>
#include <stdexcept>
#include <string>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

UserResult LlamaGenerator::GenerateUser(const std::string& locale) {
   const std::string system_prompt =
       "You generate plausible social media profiles for craft beer "
       "enthusiasts. "
       "Respond with exactly two lines: "
       "the first line is a username (lowercase, no spaces, 8-20 characters), "
       "the second line is a one-sentence bio (20-40 words). "
       "The profile should feel consistent with the locale. "
       "No preamble, no labels.";

   std::string prompt =
       "Generate a craft beer enthusiast profile. Locale: " + locale;

   const int max_attempts = 3;
   std::string raw;
   for (int attempt = 0; attempt < max_attempts; ++attempt) {
      raw = Infer(system_prompt, prompt, 128);
      spdlog::debug("LlamaGenerator (user): raw output (attempt {}): {}",
                    attempt + 1, raw);

      try {
         auto [username, bio] = ParseTwoLineResponsePublic(
             raw, "LlamaGenerator: malformed user response");

         username.erase(
             std::remove_if(username.begin(), username.end(),
                            [](unsigned char ch) { return std::isspace(ch); }),
             username.end());

         if (username.empty() || bio.empty()) {
            throw std::runtime_error("LlamaGenerator: malformed user response");
         }

         if (bio.size() > 200) bio = bio.substr(0, 200);

         return {username, bio};
      } catch (const std::exception& e) {
         spdlog::warn(
             "LlamaGenerator: malformed user response (attempt {}): {}",
             attempt + 1, e.what());
      }
   }

   spdlog::error(
       "LlamaGenerator: malformed user response after {} attempts: {}",
       max_attempts, raw);
   throw std::runtime_error("LlamaGenerator: malformed user response");
}
