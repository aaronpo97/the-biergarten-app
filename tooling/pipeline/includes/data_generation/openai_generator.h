#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_OPENAI_GENERATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_OPENAI_GENERATOR_H_

/**
 * @file data_generation/openai_generator.h
 * @brief OpenAI Chat Completions API-backed implementation of DataGenerator.
 */

#include <memory>
#include <string>
#include <string_view>

#include "data_generation/data_generator.h"
#include "data_model/models.h"
#include "services/logging/logger.h"
#include "services/prompting/prompt_directory.h"
#include "web_client/web_client.h"

/**
 * @brief Data generator implementation backed by the OpenAI Chat
 * Completions API, sending system/user messages directly and using
 * Structured Outputs (response_format: json_schema, strict: true) to
 * guarantee schema-valid JSON.
 */
class OpenAIGenerator final : public DataGenerator {
  public:
   /**
    * @brief Constructs a generator that calls the OpenAI Chat Completions
    * API.
    *
    * @param api_key OpenAI API key (from the OPENAI_API_KEY environment
    * variable -- never accepted as a CLI argument).
    * @param model OpenAI model ID, e.g. "gpt-4o-mini".
    * @param logger Sink for pipeline diagnostics.
    * @param prompt_directory Directory service for loading named prompt
    * files (the same BREWERY_GENERATION/USER_GENERATION prompts Llama
    * uses -- they're backend-agnostic).
    * @param web_client HTTP client used to reach the Chat Completions API.
    */
   OpenAIGenerator(std::string api_key, std::string model,
                   std::shared_ptr<ILogger> logger,
                   std::unique_ptr<IPromptDirectory> prompt_directory,
                   std::unique_ptr<WebClient> web_client);

   ~OpenAIGenerator() override = default;

   OpenAIGenerator(const OpenAIGenerator&) = delete;
   OpenAIGenerator& operator=(const OpenAIGenerator&) = delete;
   OpenAIGenerator(OpenAIGenerator&&) = delete;
   OpenAIGenerator& operator=(OpenAIGenerator&&) = delete;

   /**
    * @brief Generates brewery data for a specific location.
    *
    * @param enriched_city Enriched city the brewery is associated with.
    * @return Generated brewery result.
    */
   BreweryResult GenerateBrewery(const EnrichedCity& enriched_city) override;

   /**
    * @brief Generates a user profile grounded in a sampled name and persona.
    *
    * @param city Enriched city the user is associated with.
    * @param persona Persona archetype grounding the generated bio.
    * @param name Sampled first/last name -- not LLM-invented.
    * @return Generated user profile.
    */
   UserResult GenerateUser(const EnrichedCity& city, const UserPersona& persona,
                           const Name& name) override;

  private:
   /**
    * @brief Sends a single Chat Completions request with a Structured
    * Outputs schema and returns the raw JSON text of the response.
    *
    * @param system_prompt System role message content.
    * @param user_prompt User role message content.
    * @param json_schema Raw JSON Schema text constraining the response
    * shape (see data_generation/openai_json_schemas.h).
    * @param schema_name Identifier for the schema, required by the
    * response_format.json_schema wrapper.
    * @param max_tokens Maximum completion tokens to generate.
    * @return Raw JSON text produced by the model.
    * @throws std::runtime_error on a request/HTTP failure, a safety-policy
    * refusal, or a response with no message content.
    */
   std::string CallChatCompletionsApi(const std::string& system_prompt,
                                      const std::string& user_prompt,
                                      std::string_view json_schema,
                                      std::string_view schema_name,
                                      int max_tokens);

   std::string api_key_;
   std::string model_;
   std::shared_ptr<ILogger> logger_;
   std::unique_ptr<IPromptDirectory> prompt_directory_;
   std::unique_ptr<WebClient> web_client_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_OPENAI_GENERATOR_H_
