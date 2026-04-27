#pragma once

#include <string>
#include <string_view>

#include "data_generation/prompt_formatting/prompt_formatter.h"

class Gemma4JinjaPromptFormatter final : public IPromptFormatter {
 public:
  Gemma4JinjaPromptFormatter() = default;
  ~Gemma4JinjaPromptFormatter() override = default;

  [[nodiscard]] std::string Format(std::string_view system_prompt,
                                   std::string_view user_prompt) const override;
};
