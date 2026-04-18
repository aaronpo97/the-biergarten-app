/**
 * @file web_client/curl_web_client_url_encode.cc
 * @brief CURLWebClient::UrlEncode() implementation.
 */

#include <curl/curl.h>

#include <stdexcept>
#include <string>

#include "web_client/curl_web_client.h"

std::string CURLWebClient::UrlEncode(const std::string& value) {
  // A NULL handle is fine for UTF-8 encoding according to libcurl docs.
  char* output = curl_easy_escape(nullptr, value.c_str(), 0);

  if (!output) {
    throw std::runtime_error("[CURLWebClient] curl_easy_escape failed");
  }

  std::string result(output);
  curl_free(output);
  return result;
}
