/**
 * @file data_generation/openai/openai_generator.cc
 * @brief OpenAIGenerator constructor.
 */

#include "data_generation/openai_generator.h"

#include <memory>
#include <string>
#include <utility>

OpenAIGenerator::OpenAIGenerator(
    std::string api_key, std::string model, std::shared_ptr<ILogger> logger,
    std::unique_ptr<IPromptDirectory> prompt_directory,
    std::unique_ptr<WebClient> web_client)
    : api_key_(std::move(api_key)),
      model_(std::move(model)),
      logger_(std::move(logger)),
      prompt_directory_(std::move(prompt_directory)),
      web_client_(std::move(web_client)) {}
