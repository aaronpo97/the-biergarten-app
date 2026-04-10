#ifndef BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_UTILS_H_
#define BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_UTILS_H_

/**
 * @file web_client/curl_web_client_utils.h
 * @brief Shared helpers for CURLWebClient request setup.
 */

#include <curl/curl.h>

#include <memory>
#include <string>

using CurlHandle = std::unique_ptr<CURL, decltype(&curl_easy_cleanup)>;

struct CurlTimeouts {
   long connect_timeout;
   long total_timeout;
};

CurlHandle create_handle();

void set_common_get_options(CURL* curl, const std::string& url,
                            CurlTimeouts timeouts);

#endif  // BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_UTILS_H_
