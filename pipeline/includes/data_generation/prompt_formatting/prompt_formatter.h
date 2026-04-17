#pragma once

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
      std::string_view system_prompt,
      std::string_view user_prompt) const = 0;
};
