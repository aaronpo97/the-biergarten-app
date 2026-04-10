/**
 * @file web_client/curl_web_client_utils.cpp
 * @brief Shared CURLWebClient helper implementations.
 */

#include "curl_web_client_utils.h"

#include <stdexcept>

auto create_handle() -> CurlHandle {
   CURL* handle = curl_easy_init();
   if (handle == nullptr) {
      throw std::runtime_error(
          "[CURLWebClient] Failed to initialize libcurl handle");
   }
   return CurlHandle(handle, &curl_easy_cleanup);
}

auto set_common_get_options(CURL* curl, const std::string& url,
                            CurlTimeouts timeouts) -> void {
   curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
   curl_easy_setopt(curl, CURLOPT_USERAGENT, "biergarten-pipeline/0.1.0");
   curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
   curl_easy_setopt(curl, CURLOPT_MAXREDIRS, 5L);
   curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, timeouts.connect_timeout);
   curl_easy_setopt(curl, CURLOPT_TIMEOUT, timeouts.total_timeout);
   curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "gzip");
}
