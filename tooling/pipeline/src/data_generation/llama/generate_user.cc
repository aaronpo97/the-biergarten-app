/**
 * @file data_generation/llama/generate_user.cc
 * @brief Builds persona/name-grounded user prompts, performs retry-based
 * inference, and validates structured JSON output for user records.
 */

#include <format>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>

#include "data_generation/json_grammars.h"
#include "data_generation/llama_generator.h"
#include "data_generation/llama_generator_helpers.h"

static constexpr int kUserInitialMaxTokens = 1200;

UserResult LlamaGenerator::GenerateUser(const EnrichedCity& city,
                                        const UserPersona& persona,
                                        const Name& name) {
  std::string style_affinities;
  for (const std::string& style : persona.style_affinities) {
    if (!style_affinities.empty()) {
      style_affinities += ", ";
    }
    style_affinities += style;
  }

  const std::string system_prompt = prompt_directory_->Load("USER_GENERATION");

  std::string user_prompt = std::format(
      "## NAME:\n{} {}\n\n## GENDER:\n{}\n\n## CITY:\n{}\n\n## "
      "COUNTRY:\n{}\n\n"
      "## PERSONA:\n{}\n\n## PERSONA DESCRIPTION:\n{}\n\n## STYLE "
      "AFFINITIES:\n{}",
      name.first_name, name.last_name, name.gender, city.location.city,
      city.location.country, persona.name, persona.description,
      style_affinities);

  const std::string retry_context = std::format(
      "Name: {} {}\nCity: {}, {}\nPersona: {}", name.first_name, name.last_name,
      city.location.city, city.location.country, persona.name);

  constexpr int max_attempts = 3;
  std::string raw;
  std::string last_error;
  int max_tokens = kUserInitialMaxTokens;

  for (int attempt = 0; attempt < max_attempts; ++attempt) {
    raw = this->Infer(system_prompt, user_prompt, max_tokens, kUserJsonGrammar);
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Debug,
           .phase = PipelinePhase::UserGeneration,
           .message = std::format("LlamaGenerator: raw output (attempt {}): {}",
                                  attempt + 1, raw)});
    }

    UserResult user;
    const std::optional<std::string> validation_error =
        ValidateUserJson(raw, user);

    if (!validation_error.has_value()) {
      if (logger_) {
        logger_->Log(
            {.level = LogLevel::Info,
             .phase = PipelinePhase::UserGeneration,
             .message = std::format("LlamaGenerator: successfully "
                                    "generated user data on attempt {}",
                                    attempt + 1)});
      }

      user.first_name = name.first_name;
      user.last_name = name.last_name;
      user.gender = name.gender;
      return user;
    }

    last_error = *validation_error;
    if (logger_) {
      logger_->Log({.level = LogLevel::Warn,
                    .phase = PipelinePhase::UserGeneration,
                    .message = std::format(
                        "LlamaGenerator: malformed user JSON (attempt {}): {}",
                        attempt + 1, *validation_error)});
    }

    user_prompt = std::format(
        "Your previous response was invalid. Error: {}\nReturn the thought "
        "process before the JSON if needed, then return ONLY valid JSON "
        "with "
        "exactly these keys, in this exact order: {{\"username\": "
        "\"<handle "
        "derived from the given name>\", \"bio\": \"<first-person bio "
        "grounded in the persona>\", \"activity_weight\": <number between "
        "0 "
        "and 1>}}.\nDo not include markdown, comments, extra keys, or "
        "literal placeholder values.\n\n{}",
        *validation_error, retry_context);
  }

  if (logger_) {
    logger_->Log({.level = LogLevel::Error,
                  .phase = PipelinePhase::UserGeneration,
                  .message = std::format(
                      "LlamaGenerator: malformed user response "
                      "after {} attempts: {}",
                      max_attempts, last_error.empty() ? raw : last_error)});
  }
  throw std::runtime_error("LlamaGenerator: malformed user response");
}
