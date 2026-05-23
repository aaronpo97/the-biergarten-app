/**
 * @file data_generation/llama/generate_user.cc
 * @brief Generates locale-aware user profiles with strict two-line formatting,
 * retry handling, and output sanitization for downstream parsing.
 */


#include <format>
#include <string>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

// TODO: Implement locale-aware user profile generation.
// Current implementation returns a hardcoded test value and ignores the
// locale parameter. Future implementation should:
// 1. Load a USER_GENERATION.md prompt template with locale context
// 2. Perform LLM inference with locale-specific username/bio generation
// 3. Parse and validate JSON output with retry handling (similar to brewery)
// 4. Return locale-aware username and biography
UserResult LlamaGenerator::GenerateUser(const std::string& locale) {
  return {.username = "test_user",
          .bio = std::format("This is a test user profile from {}.", locale)};
}
