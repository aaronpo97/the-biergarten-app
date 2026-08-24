/**
 * @file data_generation/openai/generate_user.cc
 * @brief Builds persona/name-grounded user prompts, calls the OpenAI Chat
 * Completions API, and validates structured JSON output for user records.
 */

#include <format>
#include <optional>
#include <stdexcept>
#include <string>

#include "data_generation/generation_json_validation.h"
#include "data_generation/openai_generator.h"
#include "data_generation/openai_json_schemas.h"

namespace {
constexpr int kUserMaxTokens = 1200;

// Structured outputs already guarantee schema-valid JSON, so retries here only
// cover transient failures or placeholder text.
constexpr int kMaxAttempts = 2;
}  // namespace

UserResult OpenAIGenerator::GenerateUser(const EnrichedCity& city,
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
       "## NAME:\n\n{} {}\n\n"
       "## GENDER:\n\n{}\n\n"
       "## CITY:\n\n{}\n\n"
       "## COUNTRY:\n\n{}\n\n"
       "## PERSONA:\n\n{}\n\n"
       "## PERSONA DESCRIPTION:\n\n{}\n\n"
       "## STYLE AFFINITIES:\n\n{}",
       name.first_name, name.last_name, name.gender, city.location.city,
       city.location.country, persona.name, persona.description,
       style_affinities);

   const std::string retry_context = std::format(
       "Name: {} {}\nCity: {}, {}\nPersona: {}", name.first_name,
       name.last_name, city.location.city, city.location.country, persona.name);

   std::string raw;
   std::string last_error;

   for (int attempt = 0; attempt < kMaxAttempts; ++attempt) {
      raw = CallChatCompletionsApi(system_prompt, user_prompt, kUserJsonSchema,
                                   "user_result", kUserMaxTokens);
      if (logger_) {
         logger_->Log({.level = LogLevel::Debug,
                       .phase = PipelinePhase::UserGeneration,
                       .message = std::format(
                           "OpenAIGenerator: raw output (attempt {}): {}",
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
                 .message = std::format("OpenAIGenerator: successfully "
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
         logger_->Log(
             {.level = LogLevel::Warn,
              .phase = PipelinePhase::UserGeneration,
              .message = std::format(
                  "OpenAIGenerator: malformed user JSON (attempt {}): {}",
                  attempt + 1, *validation_error)});
      }

      user_prompt = std::format(
          "Your previous response was invalid. Error: {}\nReturn real "
          "content matching the required schema -- do not return "
          "placeholder values.\n\n{}",
          *validation_error, retry_context);
   }

   if (logger_) {
      logger_->Log({.level = LogLevel::Error,
                    .phase = PipelinePhase::UserGeneration,
                    .message = std::format(
                        "OpenAIGenerator: malformed user response "
                        "after {} attempts: {}",
                        kMaxAttempts, last_error.empty() ? raw : last_error)});
   }
   throw std::runtime_error("OpenAIGenerator: malformed user response");
}
