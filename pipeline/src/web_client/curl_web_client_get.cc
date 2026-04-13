/**
 * @file web_client/curl_web_client_get.cc
 * @brief CURLWebClient::Get() implementation.
 */

#include <curl/curl.h>

#include <cstdint>
#include <memory>
#include <stdexcept>
#include <string>

#include "web_client/curl_web_client.h"

using CurlHandle = std::unique_ptr<CURL, decltype(&curl_easy_cleanup)>;

static CurlHandle create_handle() {
  CURL* handle = curl_easy_init();
  if (handle == nullptr) {
    throw std::runtime_error(
        "[CURLWebClient] Failed to initialize libcurl handle");
  }
  return CurlHandle(handle, &curl_easy_cleanup);
}

static void set_common_get_options(CURL* curl, const std::string& url) {
  constexpr uint64_t connection_timeout = 10;
  constexpr uint64_t request_timeout = 30;
  curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
  curl_easy_setopt(curl, CURLOPT_USERAGENT, "biergarten-pipeline/0.1.0");
  curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
  curl_easy_setopt(curl, CURLOPT_MAXREDIRS, 5L);
  curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, connection_timeout);
  curl_easy_setopt(curl, CURLOPT_TIMEOUT, request_timeout);
  curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "gzip");
}

// curl write callback that appends response data into a std::string
static size_t WriteCallbackString(void* contents, const size_t size,
                                  const size_t nmemb, void* userp) {
  const size_t real_size = size * nmemb;
  auto* str = static_cast<std::string*>(userp);
  str->append(static_cast<char*>(contents), real_size);
  return real_size;
}

std::string CURLWebClient::Get(const std::string& url) {
  const CurlHandle curl = create_handle();

  std::string response_string;

  set_common_get_options(curl.get(), url);

  curl_easy_setopt(curl.get(), CURLOPT_WRITEFUNCTION, WriteCallbackString);
  curl_easy_setopt(curl.get(), CURLOPT_WRITEDATA, &response_string);

  CURLcode res = curl_easy_perform(curl.get());

  if (res != CURLE_OK) {
    const auto error =
        std::string("[CURLWebClient] GET failed: ") + curl_easy_strerror(res);
    throw std::runtime_error(error);
  }

  int64_t httpCode = 0;
  curl_easy_getinfo(curl.get(), CURLINFO_RESPONSE_CODE, &httpCode);

  if (httpCode != 200) {
    const std::string error = "[CURLWebClient] HTTP error " +
                              std::to_string(httpCode) + " for URL " + url;
    throw std::runtime_error(error);
  }

  return response_string;
}
