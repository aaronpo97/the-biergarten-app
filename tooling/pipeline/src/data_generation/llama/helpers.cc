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
namespace {
/**
 * String trimming: removes leading and trailing whitespace
 */
std::string Trim(std::string_view value) {
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
std::string CondenseWhitespace(std::string_view text) {
  std::string out;
  out.reserve(text.size());

  bool pending_space = false;
  for (const char chr : text) {
    if (std::isspace(static_cast<unsigned char>(chr)) != 0) {
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

// Guard against truncating in the first half of the string.
// This preserves the critical opening content and avoids cutting critical
// context words early in the region description.
constexpr size_t kTruncationGuardDivisor = 2;

bool ReadRequiredTrimmedStringField(const boost::json::object& obj,
                                    std::string_view key, std::string& out,
                                    std::string* error_out) {
  const boost::json::value* field = obj.if_contains(key);
  if (field == nullptr || !field->is_string()) {
    return false;
  }

  const auto& string_value = field->as_string();
  out = Trim(std::string_view(string_value.data(), string_value.size()));
  return !out.empty();
}

bool HasSchemaPlaceholder(const std::array<std::string*, 4>& values) {
  for (const std::string* value : values) {
    std::string lowered = *value;
    std::ranges::transform(lowered, lowered.begin(),
                           [](const unsigned char character) {
                             return static_cast<char>(std::tolower(character));
                           });

    if (lowered == "string") {
      return true;
    }
  }

  return false;
}
}  // namespace

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
  if (last_space != std::string::npos &&
      last_space > max_chars / kTruncationGuardDivisor) {
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
                                               BreweryResult& brewery_out) {
  boost::system::error_code error_code;
  const std::string_view raw_view(raw);
  const size_t opening_brace = raw_view.find('{');
  if (opening_brace == std::string_view::npos) {
    return "JSON parse error: missing opening brace '{'";
  }

  const std::string_view json_payload = raw_view.substr(opening_brace);
  boost::json::value json_value = boost::json::parse(json_payload, error_code);
  if (error_code) {
    return "JSON parse error: " + error_code.message();
  }

  if (!json_value.is_object()) {
    return "JSON root must be an object";
  }

  const auto& obj = json_value.get_object();
  if (obj.size() != 4) {
    return "JSON object must contain exactly four keys";
  }

  std::string validation_error;
  if (!ReadRequiredTrimmedStringField(obj, "name_en", brewery_out.name_en,
                                      &validation_error)) {
    return validation_error;
  }

  if (!ReadRequiredTrimmedStringField(obj, "description_en",
                                      brewery_out.description_en,
                                      &validation_error)) {
    return validation_error;
  }

  if (!ReadRequiredTrimmedStringField(obj, "name_local", brewery_out.name_local,
                                      &validation_error)) {
    return validation_error;
  }

  if (!ReadRequiredTrimmedStringField(obj, "description_local",
                                      brewery_out.description_local,
                                      &validation_error)) {
    return validation_error;
  }

  const std::array schema_placeholders = {
      &brewery_out.name_en, &brewery_out.description_en,
      &brewery_out.name_local, &brewery_out.description_local};
  if (HasSchemaPlaceholder(schema_placeholders)) {
    return "JSON appears to be a schema placeholder, not content";
  }

  return std::nullopt;
}
