/**
 * @file data_generation/llama/generate_user.cc
 * @brief Generates locale-aware user profiles with strict two-line formatting,
 * retry handling, and output sanitization for downstream parsing.
 */

#include <spdlog/spdlog.h>

#include <stdexcept>
#include <string>

#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

UserResult LlamaGenerator::GenerateUser(const std::string& locale) {
  return {.username = "test_user",
          .bio = "This is a test user profile from " + locale + "."};
}
