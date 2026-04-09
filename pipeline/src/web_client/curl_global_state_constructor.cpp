/**
 * @file web_client/curl_global_state_constructor.cpp
 * @brief CurlGlobalState constructor implementation.
 */

#include <curl/curl.h>

#include <stdexcept>

#include "web_client/curl_web_client.h"

CurlGlobalState::CurlGlobalState() {
   if (curl_global_init(CURL_GLOBAL_DEFAULT) != CURLE_OK) {
      throw std::runtime_error(
          "[CURLWebClient] Failed to initialize libcurl globally");
   }
}
