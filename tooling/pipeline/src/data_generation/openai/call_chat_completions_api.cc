/**
 * @file data_generation/openai/call_chat_completions_api.cc
 * @brief OpenAIGenerator::CallChatCompletionsApi() -- builds and sends a
 * single OpenAI Chat Completions request with a Structured Outputs JSON
 * schema, and extracts the resulting message content.
 */

#include <boost/json.hpp>
#include <format>
#include <stdexcept>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

#include "data_generation/openai_generator.h"

namespace {
constexpr std::string_view kChatCompletionsUrl =
    "https://api.openai.com/v1/chat/completions";
}  // namespace

std::string OpenAIGenerator::CallChatCompletionsApi(
    const std::string& system_prompt, const std::string& user_prompt,
    std::string_view json_schema, std::string_view schema_name,
    int max_tokens) {
   boost::system::error_code schema_error;
   boost::json::value schema_value =
       boost::json::parse(json_schema, schema_error);
   if (schema_error) {
      throw std::runtime_error(
          "OpenAIGenerator: invalid embedded JSON schema: " +
          schema_error.message());
   }

   boost::json::object json_schema_wrapper;
   json_schema_wrapper["name"] = std::string(schema_name);
   json_schema_wrapper["strict"] = true;
   json_schema_wrapper["schema"] = std::move(schema_value);

   boost::json::object response_format;
   response_format["type"] = "json_schema";
   response_format["json_schema"] = std::move(json_schema_wrapper);

   boost::json::object system_message;
   system_message["role"] = "system";
   system_message["content"] = system_prompt;

   boost::json::object user_message;
   user_message["role"] = "user";
   user_message["content"] = user_prompt;

   boost::json::array messages;
   messages.push_back(std::move(system_message));
   messages.push_back(std::move(user_message));

   boost::json::object request;
   request["model"] = model_;
   request["max_completion_tokens"] = max_tokens;
   request["messages"] = std::move(messages);
   request["response_format"] = std::move(response_format);

   const std::string body = boost::json::serialize(request);

   const std::vector<std::pair<std::string, std::string>> headers = {
       {"Authorization", "Bearer " + api_key_},
   };

   const std::string response_body =
       web_client_->Post(std::string(kChatCompletionsUrl), body, headers);

   boost::system::error_code response_error;
   boost::json::value response_value =
       boost::json::parse(response_body, response_error);
   if (response_error) {
      throw std::runtime_error(
          "OpenAIGenerator: failed to parse API response: " +
          response_error.message());
   }

   if (!response_value.is_object()) {
      throw std::runtime_error(
          "OpenAIGenerator: API response root is not an object");
   }
   const auto& response_obj = response_value.get_object();

   // A top-level "error" object means the request itself was rejected
   // (bad API key, invalid model, rate limit, etc.) rather than the model
   // producing an unusable completion.
   if (const boost::json::value* error_field = response_obj.if_contains("error");
       error_field != nullptr && error_field->is_object()) {
      std::string error_message = "unknown error";
      if (const boost::json::value* message_field =
              error_field->get_object().if_contains("message");
          message_field != nullptr && message_field->is_string()) {
         error_message = std::string(message_field->as_string());
      }
      throw std::runtime_error(
          std::format("OpenAIGenerator: API request failed: {}", error_message));
   }

   const boost::json::value* choices_field = response_obj.if_contains("choices");
   if (choices_field == nullptr || !choices_field->is_array() ||
       choices_field->get_array().empty()) {
      throw std::runtime_error(
          "OpenAIGenerator: API response missing choices array");
   }

   const boost::json::value& first_choice = choices_field->get_array().front();
   if (!first_choice.is_object()) {
      throw std::runtime_error(
          "OpenAIGenerator: API response choice is not an object");
   }
   const auto& choice_obj = first_choice.get_object();

   const boost::json::value* message_field = choice_obj.if_contains("message");
   if (message_field == nullptr || !message_field->is_object()) {
      throw std::runtime_error(
          "OpenAIGenerator: API response choice missing message");
   }
   const auto& message_obj = message_field->get_object();

   if (const boost::json::value* refusal_field =
           message_obj.if_contains("refusal");
       refusal_field != nullptr && refusal_field->is_string() &&
       !refusal_field->as_string().empty()) {
      throw std::runtime_error(std::format(
          "OpenAIGenerator: request refused by safety policies: {}",
          std::string(refusal_field->as_string())));
   }

   const boost::json::value* content_field = message_obj.if_contains("content");
   if (content_field == nullptr || !content_field->is_string()) {
      throw std::runtime_error(
          "OpenAIGenerator: API response message had no text content");
   }

   return std::string(content_field->as_string());
}
