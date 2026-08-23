#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_OPENAI_JSON_SCHEMAS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_OPENAI_JSON_SCHEMAS_H_

/**
 * @file data_generation/openai_json_schemas.h
 * @brief JSON Schemas constraining structured output from OpenAIGenerator
 * Chat Completions requests, via response_format.json_schema (Structured
 * Outputs, strict mode). This is OpenAI's equivalent of the GBNF grammars
 * in json_grammars.h -- the API guarantees the response message content is
 * a single JSON string that validates against the schema, so there's no
 * grammar-level "thought-block" prefix to account for.
 *
 * OpenAI's strict mode requires "additionalProperties": false on every
 * object in the schema, which these already have.
 */

#include <string_view>

inline constexpr std::string_view kBreweryJsonSchema = R"json_brewery(
{
  "type": "object",
  "properties": {
    "name_en": {"type": "string"},
    "description_en": {"type": "string"},
    "name_local": {"type": "string"},
    "description_local": {"type": "string"}
  },
  "required": ["name_en", "description_en", "name_local", "description_local"],
  "additionalProperties": false
}
)json_brewery";

inline constexpr std::string_view kUserJsonSchema = R"json_user(
{
  "type": "object",
  "properties": {
    "username": {"type": "string"},
    "bio": {"type": "string"},
    "activity_weight": {"type": "number"}
  },
  "required": ["username", "bio", "activity_weight"],
  "additionalProperties": false
}
)json_user";

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_OPENAI_JSON_SCHEMAS_H_
