/**
 * @file data_generation/generation_json_validation.cc
 * @brief Generator-agnostic prompt-context preparation and structured JSON
 * validation, shared across all DataGenerator implementations.
 */

#include "data_generation/generation_json_validation.h"

#include <algorithm>
#include <array>
#include <boost/json.hpp>
#include <cctype>
#include <format>
#include <span>
#include <string>
#include <string_view>

namespace {
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

// Keeps truncation past the string's midpoint, preserving the critical opening
// content.
constexpr size_t kTruncationGuardDivisor = 2;

bool ReadRequiredTrimmedStringField(const boost::json::object& obj,
                                    std::string_view key, std::string& out,
                                    std::string* error_out) {
   const boost::json::value* field = obj.if_contains(key);
   if (field == nullptr || !field->is_string()) {
      if (error_out != nullptr) {
         *error_out = std::format("Missing or invalid string field: {}", key);
      }
      return false;
   }

   const auto& string_value = field->as_string();
   out = Trim(std::string_view(string_value.data(), string_value.size()));
   if (out.empty() && error_out != nullptr) {
      *error_out = std::format("Field must not be empty: {}", key);
   }
   return !out.empty();
}

bool HasSchemaPlaceholder(std::span<std::string* const> values) {
   for (const std::string* value : values) {
      std::string lowered = *value;
      std::ranges::transform(
          lowered, lowered.begin(), [](const unsigned char character) {
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

   if (!ReadRequiredTrimmedStringField(
           obj, "name_local", brewery_out.name_local, &validation_error)) {
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

std::optional<std::string> ValidateUserJson(const std::string& raw,
                                            UserResult& user_out) {
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
   if (obj.size() != 3) {
      return "JSON object must contain exactly three keys";
   }

   std::string validation_error;
   if (!ReadRequiredTrimmedStringField(obj, "username", user_out.username,
                                       &validation_error)) {
      return validation_error;
   }

   if (!ReadRequiredTrimmedStringField(obj, "bio", user_out.bio,
                                       &validation_error)) {
      return validation_error;
   }

   const boost::json::value* activity_weight_field =
       obj.if_contains("activity_weight");
   if (activity_weight_field == nullptr ||
       !activity_weight_field->is_number()) {
      return "Missing or invalid numeric field: activity_weight";
   }

   const double activity_weight = activity_weight_field->to_number<double>();
   if (activity_weight < 0.0 || activity_weight > 1.0) {
      return "activity_weight must be between 0 and 1";
   }
   user_out.activity_weight = static_cast<float>(activity_weight);

   const std::array schema_placeholders = {&user_out.username, &user_out.bio};
   if (HasSchemaPlaceholder(schema_placeholders)) {
      return "JSON appears to be a schema placeholder, not content";
   }

   return std::nullopt;
}
