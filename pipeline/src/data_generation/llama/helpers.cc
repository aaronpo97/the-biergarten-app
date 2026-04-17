/**
 * @file data_generation/llama/helpers.cc
 * @brief Provides prompt formatting, whitespace normalization, response
 * parsing, token decoding, and JSON validation helpers for Llama modules.
 */

#include <algorithm>
#include <array>
#include <boost/json.hpp>
#include <cctype>
#include <optional>
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
    return;
  }

  throw std::runtime_error(
      "LlamaGenerator: failed to decode sampled token piece");
}

std::optional<std::string> ValidateBreweryJson(const std::string& raw,
                                               std::string& name_out,
                                               std::string& description_out,
                                               std::string& reasoning_out) {
  auto validate_object = [&](const boost::json::value& json_value,
                             std::string& error_out) -> bool {
    if (!json_value.is_object()) {
      error_out = "JSON root must be an object";
      return false;
    }


    const auto& obj = json_value.get_object();

    if (!obj.contains("reasoning") || !obj.at("reasoning").is_string()) {
      error_out = "JSON field 'reasoning' is missing or not a string";
      return false;
    }

    if (!obj.contains("name") || !obj.at("name").is_string()) {
      error_out = "JSON field 'name' is missing or not a string";
      return false;
    }

    if (!obj.contains("description") || !obj.at("description").is_string()) {
      error_out = "JSON field 'description' is missing or not a string";
      return false;
    }
    const auto& reasoning_value = obj.at("reasoning").as_string();
    reasoning_out = Trim(std::string_view(reasoning_value.data(), reasoning_value.size()));
    if (reasoning_out.empty()) {
      error_out = "JSON field 'reasoning' must not be empty";
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


    auto string_to_lower = [](std::string& str_out) {
       std::ranges::transform(str_out, str_out.begin(),
                             [](unsigned char character) {
                               return static_cast<char>(std::tolower(character));
                             });
    };

    string_to_lower(name_lower);
    string_to_lower(description_lower);

    if (name_lower == "string" || description_lower == "string") {
      error_out = "JSON appears to be a schema placeholder, not content";
      return false;
    }

    error_out.clear();
    return true;
  };

  boost::system::error_code error_code;
  boost::json::value json_value = boost::json::parse(raw, error_code);
  std::string validation_error;
  if (error_code) {
    return "JSON parse error: " + error_code.message();
  }

  if (!validate_object(json_value, validation_error)) {
    return validation_error;
  }

  return std::nullopt;
}
