/**
 * @file data_generation/llama/load_brewery_prompt.cpp
 * @brief Resolves brewery system prompt content from cache or a configured
 * filesystem path and provides a robust inline fallback prompt when absent.
 */

#include <spdlog/spdlog.h>

#include <filesystem>
#include <fstream>
#include <stdexcept>

#include "data_generation/llama_generator.h"

namespace fs = std::filesystem;

/**
 * @brief Loads brewery system prompt from disk or cache.
 *
 * @param prompt_file_path Preferred prompt file location.
 * @return Prompt text loaded from disk.
 */
std::string LlamaGenerator::LoadBrewerySystemPrompt(
    const std::string& prompt_file_path) {
  // Return cached version if already loaded
  if (!brewery_system_prompt_.empty()) {
    return brewery_system_prompt_;
  }

  // Try the provided path only
  const fs::path prompt_path(prompt_file_path);
  std::ifstream prompt_file(prompt_path);
  if (!prompt_file.is_open()) {
    spdlog::error(
        "LlamaGenerator: Failed to open brewery system prompt file '{}'",
        prompt_path.string());
    throw std::runtime_error(
        "LlamaGenerator: missing brewery system prompt file: " +
        prompt_path.string());
  }

  const std::string prompt((std::istreambuf_iterator(prompt_file)),
                           std::istreambuf_iterator<char>());
  prompt_file.close();

  if (prompt.empty()) {
    spdlog::error("LlamaGenerator: Brewery system prompt file '{}' is empty",
                  prompt_path.string());
    throw std::runtime_error(
        "LlamaGenerator: empty brewery system prompt file: " +
        prompt_path.string());
  }

  spdlog::info(
      "LlamaGenerator: Loaded brewery system prompt from '{}' ({} chars)",
      prompt_path.string(), prompt.length());
  brewery_system_prompt_ = prompt;
  return brewery_system_prompt_;
}