/**
 * @file services/prompt_directory.cc
 * @brief PromptDirectory implementation: validates the directory at
 * construction and loads named prompt files on demand with in-process caching.
 */

#include "services/prompt_directory.h"

#include <spdlog/spdlog.h>

#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <string>
#include <string_view>

// ---------------------------------------------------------------------------
// PromptDirectory
// ---------------------------------------------------------------------------

PromptDirectory::PromptDirectory(const std::filesystem::path& prompt_dir)
    : prompt_dir_(prompt_dir) {
  std::error_code ec;

  // Scenario 4: directory must exist.
  if (!std::filesystem::exists(prompt_dir_, ec) || ec) {
    throw std::runtime_error(
        "PromptDirectory: prompt directory does not exist: " +
        prompt_dir_.string());
  }

  // Scenario 4: path must be a directory, not a file.
  if (!std::filesystem::is_directory(prompt_dir_, ec) || ec) {
    throw std::runtime_error(
        "PromptDirectory: prompt directory path is not a directory: " +
        prompt_dir_.string());
  }

  // Scenario 4: directory must be readable (probe with directory_iterator).
  std::filesystem::directory_iterator probe(prompt_dir_, ec);
  if (ec) {
    throw std::runtime_error(
        "PromptDirectory: prompt directory is not readable: " +
        prompt_dir_.string() + " (" + ec.message() + ")");
  }

  spdlog::info("[PromptDirectory] Resolved prompt directory: {}",
               prompt_dir_.string());
}

std::string PromptDirectory::Load(std::string_view key) {
  const std::string key_str(key);

  // Return cached content if already loaded during this run.
  const auto cache_it = cache_.find(key_str);
  if (cache_it != cache_.end()) {
    return cache_it->second;
  }

  // Scenario 3: resolve <prompt_dir>/<key>.md and require it to exist.
  const std::filesystem::path file_path =
      prompt_dir_ / std::filesystem::path(key_str + ".md");

  std::ifstream file(file_path);
  if (!file.is_open()) {
    throw std::runtime_error(
        "PromptDirectory: prompt file not found for key '" + key_str +
        "': " + file_path.string());
  }

  std::string content((std::istreambuf_iterator<char>(file)),
                      std::istreambuf_iterator<char>());
  file.close();

  if (content.empty()) {
    throw std::runtime_error("PromptDirectory: prompt file for key '" +
                             key_str + "' is empty: " + file_path.string());
  }

  spdlog::info("[PromptDirectory] Loaded prompt '{}' from '{}' ({} chars)",
               key_str, file_path.string(), content.size());

  cache_.emplace(key_str, content);
  return content;
}
