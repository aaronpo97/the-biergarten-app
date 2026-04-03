#include <spdlog/spdlog.h>

#include <stdexcept>
#include <string>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

BreweryResult LlamaGenerator::GenerateBrewery(
    const std::string& city_name, const std::string& country_name,
    const std::string& region_context) {
   const std::string safe_region_context =
       PrepareRegionContextPublic(region_context);

   const std::string system_prompt =
       "You are the brewmaster and owner of a local craft brewery. "
       "Write a name and a short, soulful description for your brewery that "
       "reflects your pride in the local community and your craft. "
       "The tone should be authentic and welcoming, like a note on a "
       "chalkboard "
       "menu. Output ONLY a single JSON object with keys \"name\" and "
       "\"description\". "
       "Do not include markdown formatting or backticks.";

   std::string prompt =
       "Write a brewery name and place-specific description for a craft "
       "brewery in " +
       city_name +
       (country_name.empty() ? std::string("")
                             : std::string(", ") + country_name) +
       (safe_region_context.empty()
            ? std::string(".")
            : std::string(". Regional context: ") + safe_region_context);

   const int max_attempts = 3;
   std::string raw;
   std::string last_error;
   for (int attempt = 0; attempt < max_attempts; ++attempt) {
      raw = Infer(system_prompt, prompt, 384);
      spdlog::debug("LlamaGenerator: raw output (attempt {}): {}", attempt + 1,
                    raw);

      std::string name;
      std::string description;
      const std::string validation_error =
          ValidateBreweryJsonPublic(raw, name, description);
      if (validation_error.empty()) {
         return {std::move(name), std::move(description)};
      }

      last_error = validation_error;
      spdlog::warn("LlamaGenerator: malformed brewery JSON (attempt {}): {}",
                   attempt + 1, validation_error);

      prompt =
          "Your previous response was invalid. Error: " + validation_error +
          "\nReturn ONLY valid JSON with this exact schema: "
          "{\"name\": \"string\", \"description\": \"string\"}."
          "\nDo not include markdown, comments, or extra keys."
          "\n\nLocation: " +
          city_name +
          (country_name.empty() ? std::string("")
                                : std::string(", ") + country_name) +
          (safe_region_context.empty()
               ? std::string("")
               : std::string("\nRegional context: ") + safe_region_context);
   }

   spdlog::error(
       "LlamaGenerator: malformed brewery response after {} attempts: "
       "{}",
       max_attempts, last_error.empty() ? raw : last_error);
   throw std::runtime_error("LlamaGenerator: malformed brewery response");
}
