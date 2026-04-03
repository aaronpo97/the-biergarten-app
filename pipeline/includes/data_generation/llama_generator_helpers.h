#ifndef BIERGARTEN_PIPELINE_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_
#define BIERGARTEN_PIPELINE_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_

#include <string>
#include <utility>

struct llama_model;
struct llama_vocab;
typedef int llama_token;

// Helper functions for LlamaGenerator methods
std::string PrepareRegionContextPublic(std::string_view region_context,
                                       std::size_t max_chars = 700);

std::pair<std::string, std::string> ParseTwoLineResponsePublic(
    const std::string& raw, const std::string& error_message);

std::string ToChatPromptPublic(const llama_model* model,
                               const std::string& user_prompt);

std::string ToChatPromptPublic(const llama_model* model,
                               const std::string& system_prompt,
                               const std::string& user_prompt);

void AppendTokenPiecePublic(const llama_vocab* vocab, llama_token token,
                            std::string& output);

std::string ValidateBreweryJsonPublic(const std::string& raw,
                                      std::string& name_out,
                                      std::string& description_out);

#endif  // BIERGARTEN_PIPELINE_DATA_GENERATION_LLAMA_GENERATOR_HELPERS_H_
