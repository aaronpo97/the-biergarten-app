#include "data_generation/prompt_formatting/gemma4_jinja_prompt_formatter.h"

#include <format>
#include <string>
#include <string_view>

static constexpr std::string_view kWhitespace = " \t\n\r\f\v";

// Strips leading and trailing whitespace to ensure clean prompt injection.
static std::string_view Trim(std::string_view value) {
   const size_t first_index = value.find_first_not_of(kWhitespace);

   const bool is_all_whitespace = (first_index == std::string_view::npos);
   if (is_all_whitespace) {
      return "";
   }

   const size_t last_index = value.find_last_not_of(kWhitespace);
   return value.substr(first_index, last_index - first_index + 1);
}

std::string Gemma4JinjaPromptFormatter::Format(
    std::string_view system_prompt, std::string_view user_prompt) const {
   std::string_view trimmed_system = Trim(system_prompt);
   std::string_view trimmed_user = Trim(user_prompt);

   return std::format(
       "<|turn|>system\n<|think|>\n{}\n<|turn|>\n"
       "<|turn|>user\n{}\n<|turn|>\n"
       "<|turn|>model\n<|channel>thought\n",
       trimmed_system, trimmed_user);
}
