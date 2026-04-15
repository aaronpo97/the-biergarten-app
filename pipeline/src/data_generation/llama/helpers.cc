/**
 * @file data_generation/llama/helpers.cc
 * @brief Provides prompt formatting, whitespace normalization, response
 * parsing, token decoding, and JSON validation helpers for Llama modules.
 */

#include <spdlog/spdlog.h>

#include <algorithm>
#include <array>
#include <boost/json.hpp>
#include <cctype>
#include <optional>
#include <sstream>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

#include "data_generation/llama_generator_helpers.h"
#include "llama.h"

/**
 * String trimming: removes leading and trailing whitespace
 */
static std::string Trim(std::string_view value) {
  constexpr std::string_view whitespace = " \t\n\r\f\v";
  const size_t first_index = value.find_first_not_of(whitespace);
  if (first_index == std::string_view::npos) {
    return {};
  }

  const size_t last_index = value.find_last_not_of(whitespace);
  return std::string(value.substr(first_index, last_index - first_index + 1));
}

/**
 * Normalize whitespace: collapses multiple spaces/tabs/newlines into single
 * spaces
 */
static std::string CondenseWhitespace(std::string_view text) {
  std::string out;
  out.reserve(text.size());

  bool pending_space = false;
  for (const char chr : text) {
    if (std::isspace(chr) != 0) {
      if (!out.empty()) {
        pending_space = true;
      }
      continue;
    }

    if (pending_space) {
      out.push_back(' ');
      pending_space = false;
    }
    out.push_back(chr);
  }

  return out;
}

/**
 * Truncate region context to fit within max length while preserving word
 * boundaries
 */
std::string PrepareRegionContext(std::string_view region_context,
                                 const size_t max_chars) {
  std::string normalized = CondenseWhitespace(region_context);
  if (normalized.size() <= max_chars) {
    return normalized;
  }

  normalized.resize(max_chars);
  const size_t last_space = normalized.find_last_of(' ');
  if (last_space != std::string::npos && last_space > max_chars / 2) {
    normalized.resize(last_space);
  }

  normalized += "...";
  return normalized;
}

std::string ToChatPrompt(const llama_model* model,
                         const std::string& system_prompt,
                         const std::string& user_prompt) {
  std::string combined_prompt = system_prompt;
  combined_prompt.append("\n\n");
  combined_prompt.append(user_prompt);

  const char* tmpl = llama_model_chat_template(model, nullptr);
  if (tmpl == nullptr) {
    // No template found, fallback to raw text
    spdlog::warn(
        "LlamaGenerator: missing chat template; using raw prompt fallback");
    return combined_prompt;
  }

  const std::array<llama_chat_message, 2> messages = {
      {{"system", system_prompt.c_str()}, {"user", user_prompt.c_str()}}};

  std::vector<char> buffer(std::max<std::size_t>(
      1024, (system_prompt.size() + user_prompt.size()) * 4));

  auto apply_template_with_resize = [&](const llama_chat_message* chat_messages,
                                        int32_t message_count) -> int32_t {
    int32_t result = llama_chat_apply_template(
        tmpl, chat_messages, message_count, true, buffer.data(),
        static_cast<int32_t>(buffer.size()));

    if (result < 0) {
      return result;
    }

    if (result >= static_cast<int32_t>(buffer.size())) {
      buffer.resize(static_cast<std::size_t>(result) + 1);
      result = llama_chat_apply_template(tmpl, chat_messages, message_count,
                                         true, buffer.data(),
                                         static_cast<int32_t>(buffer.size()));
    }

    return result;
  };

  int32_t template_result = apply_template_with_resize(messages.data(), 2);

  if (template_result >= 0) {
    return {buffer.data(), static_cast<size_t>(template_result)};
  }

  spdlog::warn(
      "LlamaGenerator: chat template rejected system/user messages (result "
      "{}); trying single user fallback",
      template_result);

  // FALLBACK: If the template fails (e.g., Model rejecting the "system" role),
  // combine the system and user prompts into a single "user" message.
  const std::array<llama_chat_message, 1> fallback_msg = {
      {{"user", combined_prompt.c_str()}}};

  template_result = apply_template_with_resize(fallback_msg.data(), 1);

  // Ultimate fallback: if GGUF template parsing still fails, use raw text.
  if (template_result < 0) {
    spdlog::warn(
        "LlamaGenerator: chat template fallback failed (result {}); using "
        "raw prompt text",
        template_result);
    return combined_prompt;
  }

  return {buffer.data(), static_cast<size_t>(template_result)};
}

void AppendTokenPiece(const llama_vocab* vocab, llama_token token,
                      std::string& output) {
  constexpr size_t initial_buffer_size = 256;

  std::array<char, initial_buffer_size> buffer{};

  // serialize the sampled token into UTF-8 bytes

  auto buffer_too_small = [](int32_t result) -> bool { return result < 0; };

  int32_t bytes =
      llama_token_to_piece(vocab, token, buffer.data(), buffer.size(), 0, true);

  if (!buffer_too_small(bytes)) {
    // Append the decoded bytes from the stack buffer.
    output.append(buffer.data(), static_cast<size_t>(bytes));
    return;
  }

  const int32_t required_size = -bytes;
  std::vector<char> dynamic_buffer(static_cast<size_t>(required_size));

  // Retry token decoding against the larger heap buffer.
  bytes = llama_token_to_piece(vocab, token, dynamic_buffer.data(),
                               static_cast<int32_t>(dynamic_buffer.size()), 0,
                               true);

  if (!buffer_too_small(bytes)) {
    output.append(dynamic_buffer.data(), static_cast<size_t>(bytes));
  }

  throw std::runtime_error(
      "LlamaGenerator: failed to decode sampled token piece");
}

// Shared parser used by the public extractor and JSON validation.
static bool ExtractLastJsonObject(const std::string& text,
                                  std::string& json_out) {
  // Remember where the most recent balanced object started.
  size_t start = std::string::npos;

  // Track nested braces outside of quoted strings.
  int depth = 0;

  // Track whether the scan is currently inside a quoted string.
  bool in_string = false;

  // Track escape sequences so quotes inside strings are handled correctly.
  bool escaped = false;

  // Record whether at least one complete object was found.
  bool found = false;

  // Keep the latest complete object candidate.
  std::string candidate;

  // Scan the input text one character at a time.
  for (size_t i = 0; i < text.size(); ++i) {
    // Inspect the current character.
    const char chr = text[i];

    // Inside a string literal, only escapes and quotes affect state.
    if (in_string) {
      if (escaped) {
        // The current character was escaped, so clear the escape flag.
        escaped = false;
      } else if (chr == '\\') {
        // Mark the next character as escaped.
        escaped = true;
      } else if (chr == '"') {
        // Closing quote ends the string literal.
        in_string = false;
      }
      continue;
    }

    // Opening quotes enter string mode.
    if (chr == '"') {
      in_string = true;
      continue;
    }

    // Opening braces begin or nest a JSON object.
    if (chr == '{') {
      if (depth == 0) {
        // Record the start of the outermost object.
        start = i;
      }

      // Increase nesting depth for the active object.
      ++depth;
      continue;
    }

    // Closing braces may complete an object.
    if (chr == '}') {
      if (depth == 0) {
        // Ignore stray closing braces.
        continue;
      }

      // Drop one level of nesting.
      --depth;
      if (depth == 0 && start != std::string::npos) {
        // Capture the latest complete object seen so far.
        candidate = text.substr(start, i - start + 1);
        found = true;
      }
    }
  }

  if (!found) {
    return false;
  }

  // Return the captured object text to the caller.
  json_out = std::move(candidate);
  return true;
}

std::optional<std::string> ValidateBreweryJson(const std::string& raw,
                                               std::string& name_out,
                                               std::string& description_out) {
  auto validate_object = [&](const boost::json::value& jv,
                             std::string& error_out) -> bool {
    if (!jv.is_object()) {
      error_out = "JSON root must be an object";
      return false;
    }

    const auto& obj = jv.get_object();
    if (!obj.contains("name") || !obj.at("name").is_string()) {
      error_out = "JSON field 'name' is missing or not a string";
      return false;
    }

    if (!obj.contains("description") || !obj.at("description").is_string()) {
      error_out = "JSON field 'description' is missing or not a string";
      return false;
    }

    const auto& name_value = obj.at("name").as_string();
    const auto& description_value = obj.at("description").as_string();
    name_out = Trim(std::string_view(name_value.data(), name_value.size()));
    description_out = Trim(
        std::string_view(description_value.data(), description_value.size()));

    if (name_out.empty()) {
      error_out = "JSON field 'name' must not be empty";
      return false;
    }

    if (description_out.empty()) {
      error_out = "JSON field 'description' must not be empty";
      return false;
    }

    std::string name_lower = name_out;
    std::string description_lower = description_out;

    std::transform(
        name_lower.begin(), name_lower.end(), name_lower.begin(),
        [](unsigned char c) { return static_cast<char>(std::tolower(c)); });

    std::transform(description_lower.begin(), description_lower.end(),
                   description_lower.begin(), [](unsigned char c) {
                     return static_cast<char>(std::tolower(c));
                   });

    if (name_lower == "string" || description_lower == "string") {
      error_out = "JSON appears to be a schema placeholder, not content";
      return false;
    }

    error_out.clear();
    return true;
  };

  boost::system::error_code ec;
  boost::json::value jv = boost::json::parse(raw, ec);
  std::string validation_error;
  if (ec) {
    std::string extracted;
    if (!ExtractLastJsonObject(raw, extracted)) {
      return "JSON parse error: " + ec.message();
    }

    ec.clear();
    jv = boost::json::parse(extracted, ec);
    if (ec) {
      return "JSON parse error: " + ec.message();
    }

    if (!validate_object(jv, validation_error)) {
      return validation_error;
    }

    return std::nullopt;
  }

  if (!validate_object(jv, validation_error)) {
    return validation_error;
  }

  return std::nullopt;
}

std::string ExtractLastJsonObject(const std::string& text) {
  // Reuse the internal parser and return an empty string if none was found.
  std::string extracted;
  if (ExtractLastJsonObject(text, extracted)) {
    return extracted;
  }

  return {};
}
