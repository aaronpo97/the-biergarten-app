/**
 * @file web_client/curl_web_client_get.cc
 * @brief CURLWebClient::Get() implementation.
 */

#include <curl/curl.h>

#include <cstdint>
#include <limits>
#include <memory>
#include <stdexcept>
#include <string>

#include "web_client/curl_web_client.h"

using CurlHandle = std::unique_ptr<CURL, decltype(&curl_easy_cleanup)>;

static constexpr long kConnectionTimeout = 10;
static constexpr long kRequestTimeout = 30;
static constexpr int32_t kOkHttpStatus = 200;

static CurlHandle CreateHandle() {
  CURL* handle = curl_easy_init();
  if (handle == nullptr) {
    throw std::runtime_error(
        "[CURLWebClient] Failed to initialize libcurl handle");
  }
  return {handle, &curl_easy_cleanup};
}

static void SetCommonGetOptions(CURL* curl, const std::string& url) {
  curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
  curl_easy_setopt(curl, CURLOPT_USERAGENT, "biergarten-pipeline/0.1.0");
  curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
  curl_easy_setopt(curl, CURLOPT_MAXREDIRS, 5L);
  curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, kConnectionTimeout);
  curl_easy_setopt(curl, CURLOPT_TIMEOUT, kRequestTimeout);
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
  const CurlHandle curl = CreateHandle();

  std::string response_string;

  SetCommonGetOptions(curl.get(), url);

  curl_easy_setopt(curl.get(), CURLOPT_WRITEFUNCTION, WriteCallbackString);
  curl_easy_setopt(curl.get(), CURLOPT_WRITEDATA, &response_string);

  CURLcode curl_result = curl_easy_perform(curl.get());

  if (curl_result != CURLE_OK) {
    const auto error = std::string("[CURLWebClient] GET failed: ") +
                       curl_easy_strerror(curl_result);
    throw std::runtime_error(error);
  }

  long curl_http_code = 0;
  curl_easy_getinfo(curl.get(), CURLINFO_RESPONSE_CODE, &curl_http_code);

  if (curl_http_code < std::numeric_limits<int32_t>::min() ||
      curl_http_code > std::numeric_limits<int32_t>::max()) {
    throw std::runtime_error("[CURLWebClient] Invalid HTTP status code: " +
                             std::to_string(curl_http_code));
  }

  const int32_t http_code = static_cast<int32_t>(curl_http_code);

  if (http_code != kOkHttpStatus) {
    const std::string error = "[CURLWebClient] HTTP error " +
                              std::to_string(http_code) + " for URL " + url;
    throw std::runtime_error(error);
  }

  return response_string;
}
