/**
 * @file web_client/curl_global_state.cc
 * @brief CurlGlobalState constructor and destructor implementation.
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

CurlGlobalState::~CurlGlobalState() { curl_global_cleanup(); }
