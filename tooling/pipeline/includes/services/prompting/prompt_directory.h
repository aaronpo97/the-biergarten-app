#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_PROMPTING_PROMPT_DIRECTORY_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_PROMPTING_PROMPT_DIRECTORY_H_

/**
 * @file services/prompt_directory.h
 * @brief Interface and filesystem-backed implementation for named prompt
 * loading.
 *
 * Prompt files are resolved by key: a key of "BREWERY_GENERATION" maps to the
 * file <prompt_dir>/BREWERY_GENERATION.md.  The interface is kept intentionally
 * narrow so test doubles can be injected without touching the filesystem.
 */

#include <filesystem>
#include <memory>
#include <stdexcept>
#include <string>
#include <string_view>
#include <unordered_map>

#include "services/logging/logger.h"

/**
 * @brief Interface for loading named prompt files.
 */
class IPromptDirectory {
  public:
   IPromptDirectory() = default;
   IPromptDirectory(const IPromptDirectory&) = delete;
   IPromptDirectory& operator=(const IPromptDirectory&) = delete;
   IPromptDirectory(IPromptDirectory&&) = delete;
   IPromptDirectory& operator=(IPromptDirectory&&) = delete;
   virtual ~IPromptDirectory() = default;

   /**
    * @brief Loads the prompt associated with @p key.
    *
    * @param key Logical prompt key, e.g. "BREWERY_GENERATION".
    * @return Prompt text.
    * @throws std::runtime_error if the prompt file cannot be found or read.
    */
   [[nodiscard]] virtual std::string Load(std::string_view key) = 0;
};

/**
 * @brief Filesystem-backed IPromptDirectory implementation.
 *
 * Each call to Load() checks an in-process cache first, then reads
 * <prompt_dir>/<key>.md from disk.  The directory must exist and be readable
 * at construction time; individual file absence is reported lazily at Load().
 */
class PromptDirectory final : public IPromptDirectory {
  public:
   /**
    * @brief Constructs a PromptDirectory rooted at @p prompt_dir.
    *
    * @param prompt_dir Absolute or relative path to the prompt directory.
    * @throws std::runtime_error if @p prompt_dir does not exist or is not a
    *         directory.
    */
   explicit PromptDirectory(const std::filesystem::path& prompt_dir);
   PromptDirectory(const std::filesystem::path& prompt_dir,
                   std::shared_ptr<ILogger> logger);

   /**
    * @brief Loads the prompt for @p key, caching the result.
    *
    * Maps @p key → <prompt_dir>/<key>.md.
    *
    * @param key Logical prompt key.
    * @return Prompt text.
    * @throws std::runtime_error if the file does not exist or is empty.
    */
   [[nodiscard]] std::string Load(std::string_view key) override;

  private:
   std::filesystem::path prompt_dir_;
   std::shared_ptr<ILogger> logger_;
   std::unordered_map<std::string, std::string> cache_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_PROMPTING_PROMPT_DIRECTORY_H_
