#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_PROMPT_FORMATTING_PROMPT_FORMATTER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_PROMPT_FORMATTING_PROMPT_FORMATTER_H_

#include <string>
#include <string_view>

class IPromptFormatter {
 public:
  IPromptFormatter() = default;
  IPromptFormatter(const IPromptFormatter&) = delete;
  IPromptFormatter& operator=(const IPromptFormatter&) = delete;
  IPromptFormatter(IPromptFormatter&&) = delete;
  IPromptFormatter& operator=(IPromptFormatter&&) = delete;
  virtual ~IPromptFormatter() = default;

  [[nodiscard]] virtual std::string Format(
      std::string_view system_prompt, std::string_view user_prompt) const = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_PROMPT_FORMATTING_PROMPT_FORMATTER_H_
