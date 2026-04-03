#include <stdexcept>
#include <string>

#include <spdlog/spdlog.h>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

BreweryResult
LlamaGenerator::GenerateBrewery(const std::string& city_name,
                                const std::string& country_name,
                                const std::string& region_context) {
  const std::string safe_region_context =
      PrepareRegionContextPublic(region_context);

  const std::string system_prompt =
      "You are a copywriter for a craft beer travel guide. "
      "Your writing is vivid, specific to place, and avoids generic beer "
      "cliches. "
      "You must output ONLY valid JSON. "
      "The JSON schema must be exactly: {\"name\": \"string\", "
      "\"description\": \"string\"}. "
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

    prompt = "Your previous response was invalid. Error: " + validation_error +
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

  spdlog::error("LlamaGenerator: malformed brewery response after {} attempts: "
                "{}",
                max_attempts, last_error.empty() ? raw : last_error);
  throw std::runtime_error("LlamaGenerator: malformed brewery response");
}
