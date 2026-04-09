/**
 * @file data_generation/llama/helpers.cpp
 * @brief Provides prompt formatting, whitespace normalization, response
 * parsing, token decoding, and JSON validation helpers for Llama modules.
 */

#include <algorithm>
#include <array>
#include <boost/json.hpp>
#include <cctype>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "data_generation/llama_generator.h"
#include "llama.h"

namespace {

/**
 * String trimming: removes leading and trailing whitespace
 */
std::string Trim(std::string value) {
   auto not_space = [](unsigned char ch) { return !std::isspace(ch); };

   value.erase(value.begin(),
               std::find_if(value.begin(), value.end(), not_space));
   value.erase(std::find_if(value.rbegin(), value.rend(), not_space).base(),
               value.end());

   return value;
}

/**
 * Normalize whitespace: collapses multiple spaces/tabs/newlines into single
 * spaces
 */
std::string CondenseWhitespace(std::string text) {
   std::string out;
   out.reserve(text.size());

   bool in_whitespace = false;
   for (unsigned char ch : text) {
      if (std::isspace(ch)) {
         if (!in_whitespace) {
            out.push_back(' ');
            in_whitespace = true;
         }
         continue;
      }

      in_whitespace = false;
      out.push_back(static_cast<char>(ch));
   }

   return Trim(std::move(out));
}

/**
 * Truncate region context to fit within max length while preserving word
 * boundaries
 */
std::string PrepareRegionContext(std::string_view region_context,
                                 std::size_t max_chars) {
   std::string normalized = CondenseWhitespace(std::string(region_context));
   if (normalized.size() <= max_chars) {
      return normalized;
   }

   normalized.resize(max_chars);
   const std::size_t last_space = normalized.find_last_of(' ');
   if (last_space != std::string::npos && last_space > max_chars / 2) {
      normalized.resize(last_space);
   }

   normalized += "...";
   return normalized;
}

/**
 * Remove common bullet points, numbers, and field labels added by LLM in output
 */
std::string StripCommonPrefix(std::string line) {
   line = Trim(std::move(line));

   if (!line.empty() && (line[0] == '-' || line[0] == '*')) {
      line = Trim(line.substr(1));
   } else {
      std::size_t i = 0;
      while (i < line.size() &&
             std::isdigit(static_cast<unsigned char>(line[i]))) {
         ++i;
      }
      if (i > 0 && i < line.size() && (line[i] == '.' || line[i] == ')')) {
         line = Trim(line.substr(i + 1));
      }
   }

   auto strip_label = [&line](const std::string& label) {
      if (line.size() >= label.size()) {
         bool matches = true;
         for (std::size_t i = 0; i < label.size(); ++i) {
            if (std::tolower(static_cast<unsigned char>(line[i])) !=
                std::tolower(static_cast<unsigned char>(label[i]))) {
               matches = false;
               break;
            }
         }
         if (matches) {
            line = Trim(line.substr(label.size()));
         }
      }
   };

   strip_label("name:");
   strip_label("brewery name:");
   strip_label("description:");
   strip_label("username:");
   strip_label("bio:");

   return Trim(std::move(line));
}

/**
 * Parse two-line response from LLM: normalize line endings, strip formatting,
 * filter spurious output, and combine remaining lines if needed
 */
std::pair<std::string, std::string> ParseTwoLineResponse(
    const std::string& raw, const std::string& error_message) {
   std::string normalized = raw;
   std::replace(normalized.begin(), normalized.end(), '\r', '\n');

   std::vector<std::string> lines;
   std::stringstream stream(normalized);
   std::string line;
   while (std::getline(stream, line)) {
      line = StripCommonPrefix(std::move(line));
      if (!line.empty()) lines.push_back(std::move(line));
   }

   std::vector<std::string> filtered;
   for (auto& l : lines) {
      std::string low = l;
      std::transform(low.begin(), low.end(), low.begin(), [](unsigned char c) {
         return static_cast<char>(std::tolower(c));
      });
      // Filter known thinking tags like <think>...</think>, but be conservative
      // to avoid removing legitimate output. Only filter specific known
      // patterns.
      if (!l.empty() && l.front() == '<' && low.back() == '>') {
         // Only filter if it's a known thinking tag: <think>, <reasoning>, etc.
         if (low.find("think") != std::string::npos ||
             low.find("reasoning") != std::string::npos ||
             low.find("reflect") != std::string::npos) {
            continue;
         }
      }
      if (low.rfind("okay,", 0) == 0 || low.rfind("hmm", 0) == 0) continue;
      filtered.push_back(std::move(l));
   }

   if (filtered.size() < 2) throw std::runtime_error(error_message);

   std::string first = Trim(filtered.front());
   std::string second;
   for (size_t i = 1; i < filtered.size(); ++i) {
      if (!second.empty()) second += ' ';
      second += filtered[i];
   }
   second = Trim(std::move(second));

   if (first.empty() || second.empty()) throw std::runtime_error(error_message);
   return {first, second};
}

/**
 * Apply model's chat template to user-only prompt, formatting it for the model
 */
std::string ToChatPrompt(const llama_model* model,
                         const std::string& user_prompt) {
   const char* tmpl = llama_model_chat_template(model, nullptr);
   if (tmpl == nullptr) {
      return user_prompt;
   }

   const llama_chat_message message{"user", user_prompt.c_str()};

   std::vector<char> buffer(
       std::max<std::size_t>(1024, user_prompt.size() * 4));
   int32_t required =
       llama_chat_apply_template(tmpl, &message, 1, true, buffer.data(),
                                 static_cast<int32_t>(buffer.size()));

   if (required < 0) {
      throw std::runtime_error("LlamaGenerator: failed to apply chat template");
   }

   if (required >= static_cast<int32_t>(buffer.size())) {
      buffer.resize(static_cast<std::size_t>(required) + 1);
      required =
          llama_chat_apply_template(tmpl, &message, 1, true, buffer.data(),
                                    static_cast<int32_t>(buffer.size()));
      if (required < 0) {
         throw std::runtime_error(
             "LlamaGenerator: failed to apply chat template");
      }
   }

   return std::string(buffer.data(), static_cast<std::size_t>(required));
}

/**
 * Apply model's chat template to system+user prompt pair, formatting for the
 * model
 */
std::string ToChatPrompt(const llama_model* model,
                         const std::string& system_prompt,
                         const std::string& user_prompt) {
   const char* tmpl = llama_model_chat_template(model, nullptr);
   if (tmpl == nullptr) {
      return system_prompt + "\n\n" + user_prompt;
   }

   const llama_chat_message messages[2] = {{"system", system_prompt.c_str()},
                                           {"user", user_prompt.c_str()}};

   std::vector<char> buffer(std::max<std::size_t>(
       1024, (system_prompt.size() + user_prompt.size()) * 4));
   int32_t required =
       llama_chat_apply_template(tmpl, messages, 2, true, buffer.data(),
                                 static_cast<int32_t>(buffer.size()));

   if (required < 0) {
      throw std::runtime_error("LlamaGenerator: failed to apply chat template");
   }

   if (required >= static_cast<int32_t>(buffer.size())) {
      buffer.resize(static_cast<std::size_t>(required) + 1);
      required =
          llama_chat_apply_template(tmpl, messages, 2, true, buffer.data(),
                                    static_cast<int32_t>(buffer.size()));
      if (required < 0) {
         throw std::runtime_error(
             "LlamaGenerator: failed to apply chat template");
      }
   }

   return std::string(buffer.data(), static_cast<std::size_t>(required));
}

void AppendTokenPiece(const llama_vocab* vocab, llama_token token,
                      std::string& output) {
   std::array<char, 256> buffer{};
   int32_t bytes =
       llama_token_to_piece(vocab, token, buffer.data(),
                            static_cast<int32_t>(buffer.size()), 0, true);

   if (bytes < 0) {
      std::vector<char> dynamic_buffer(static_cast<std::size_t>(-bytes));
      bytes = llama_token_to_piece(vocab, token, dynamic_buffer.data(),
                                   static_cast<int32_t>(dynamic_buffer.size()),
                                   0, true);
      if (bytes < 0) {
         throw std::runtime_error(
             "LlamaGenerator: failed to decode sampled token piece");
      }

      output.append(dynamic_buffer.data(), static_cast<std::size_t>(bytes));
      return;
   }

   output.append(buffer.data(), static_cast<std::size_t>(bytes));
}

bool ExtractFirstJsonObject(const std::string& text, std::string& json_out) {
   std::size_t start = std::string::npos;
   int depth = 0;
   bool in_string = false;
   bool escaped = false;

   for (std::size_t i = 0; i < text.size(); ++i) {
      const char ch = text[i];

      if (in_string) {
         if (escaped) {
            escaped = false;
         } else if (ch == '\\') {
            escaped = true;
         } else if (ch == '"') {
            in_string = false;
         }
         continue;
      }

      if (ch == '"') {
         in_string = true;
         continue;
      }

      if (ch == '{') {
         if (depth == 0) {
            start = i;
         }
         ++depth;
         continue;
      }

      if (ch == '}') {
         if (depth == 0) {
            continue;
         }
         --depth;
         if (depth == 0 && start != std::string::npos) {
            json_out = text.substr(start, i - start + 1);
            return true;
         }
      }
   }

   return false;
}

std::string ValidateBreweryJson(const std::string& raw, std::string& name_out,
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

      name_out = Trim(std::string(obj.at("name").as_string().c_str()));
      description_out =
          Trim(std::string(obj.at("description").as_string().c_str()));

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
      if (!ExtractFirstJsonObject(raw, extracted)) {
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

      return {};
   }

   if (!validate_object(jv, validation_error)) {
      return validation_error;
   }

   return {};
}

}  // namespace

// Forward declarations for helper functions exposed to other translation units
std::string PrepareRegionContextPublic(std::string_view region_context,
                                       std::size_t max_chars) {
   return PrepareRegionContext(region_context, max_chars);
}

std::pair<std::string, std::string> ParseTwoLineResponsePublic(
    const std::string& raw, const std::string& error_message) {
   return ParseTwoLineResponse(raw, error_message);
}

std::string ToChatPromptPublic(const llama_model* model,
                               const std::string& user_prompt) {
   return ToChatPrompt(model, user_prompt);
}

std::string ToChatPromptPublic(const llama_model* model,
                               const std::string& system_prompt,
                               const std::string& user_prompt) {
   return ToChatPrompt(model, system_prompt, user_prompt);
}

void AppendTokenPiecePublic(const llama_vocab* vocab, llama_token token,
                            std::string& output) {
   AppendTokenPiece(vocab, token, output);
}

std::string ValidateBreweryJsonPublic(const std::string& raw,
                                      std::string& name_out,
                                      std::string& description_out) {
   return ValidateBreweryJson(raw, name_out, description_out);
}
