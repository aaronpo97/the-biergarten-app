/**
 * @file web_client/curl_global_state_destructor.cpp
 * @brief CurlGlobalState destructor implementation.
 */

#include <curl/curl.h>

#include "web_client/curl_web_client.h"

CurlGlobalState::~CurlGlobalState() { curl_global_cleanup(); }
