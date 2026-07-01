#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_JSON_GRAMMARS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_JSON_GRAMMARS_H_

/**
 * @file data_generation/json_grammars.h
 * @brief GBNF grammars constraining structured JSON output from
 * LlamaGenerator inference calls.
 */

#include <string_view>

// GBNF grammar for structured user JSON output.
// thought-block permits the model to emit free-form reasoning before the
// JSON object (the prompts explicitly invite this); only the "{...}" tail is
// constrained to the expected shape.
inline constexpr std::string_view kUserJsonGrammar = R"json_user(
root ::= thought-block (
    "{" ws
    "\"username\"" ws ":" ws string ws "," ws
    "\"bio\"" ws ":" ws string ws "," ws
    "\"activity_weight\"" ws ":" ws number ws
  "}" ws
)
thought-block ::= [^{]*
ws            ::= [ \t\n\r]*
string        ::= "\"" char+ "\""
char          ::= [^"\\\x7F\x00-\x1F] | [\\] escape
escape        ::= ["\\/bfnrt] | "u" hex hex hex hex
hex           ::= [0-9a-fA-F]
number        ::= "-"? ("0" | [1-9] [0-9]*) ("." [0-9]+)?
)json_user";

// GBNF grammar for structured brewery JSON output (see thought-block note
// above).
inline constexpr std::string_view kBreweryJsonGrammar = R"json_brewery(
root ::= thought-block (
    "{" ws
    "\"name_en\"" ws ":" ws string ws "," ws
    "\"description_en\"" ws ":" ws string ws "," ws
    "\"name_local\"" ws ":" ws string ws "," ws
    "\"description_local\"" ws ":" ws string ws
  "}" ws
)
thought-block ::= [^{]*
ws            ::= [ \t\n\r]*
string        ::= "\"" char+ "\""
char          ::= [^"\\\x7F\x00-\x1F] | [\\] escape
escape        ::= ["\\/bfnrt] | "u" hex hex hex hex
hex           ::= [0-9a-fA-F]
)json_brewery";

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_JSON_GRAMMARS_H_
