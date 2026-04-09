/**
 * @file web_client/curl_web_client.cpp
 * @brief Implements libcurl-backed HTTP utilities, including GET requests,
 * file downloads, URL encoding, and RAII global curl lifecycle handling.
 */

#include "web_client/curl_web_client.h"

#include <curl/curl.h>

#include <cstdio>
#include <fstream>
#include <memory>
#include <sstream>
#include <stdexcept>

CurlGlobalState::CurlGlobalState() {
   if (curl_global_init(CURL_GLOBAL_DEFAULT) != CURLE_OK) {
      throw std::runtime_error(
          "[CURLWebClient] Failed to initialize libcurl globally");
   }
}

CurlGlobalState::~CurlGlobalState() { curl_global_cleanup(); }

namespace {
// curl write callback that appends response data into a std::string
size_t WriteCallbackString(void* contents, size_t size, size_t nmemb,
                           void* userp) {
   size_t realsize = size * nmemb;
   auto* s = static_cast<std::string*>(userp);
   s->append(static_cast<char*>(contents), realsize);
   return realsize;
}

// curl write callback that writes to a file stream
size_t WriteCallbackFile(void* contents, size_t size, size_t nmemb,
                         void* userp) {
   size_t realsize = size * nmemb;
   auto* outFile = static_cast<std::ofstream*>(userp);
   outFile->write(static_cast<char*>(contents), realsize);
   return realsize;
}

// RAII wrapper for CURL handle using unique_ptr
using CurlHandle = std::unique_ptr<CURL, decltype(&curl_easy_cleanup)>;

CurlHandle create_handle() {
   CURL* handle = curl_easy_init();
   if (!handle) {
      throw std::runtime_error(
          "[CURLWebClient] Failed to initialize libcurl handle");
   }
   return CurlHandle(handle, &curl_easy_cleanup);
}

void set_common_get_options(CURL* curl, const std::string& url,
                            long connect_timeout, long total_timeout) {
   curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
   curl_easy_setopt(curl, CURLOPT_USERAGENT, "biergarten-pipeline/0.1.0");
   curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
   curl_easy_setopt(curl, CURLOPT_MAXREDIRS, 5L);
   curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, connect_timeout);
   curl_easy_setopt(curl, CURLOPT_TIMEOUT, total_timeout);
   curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "gzip");
}
}  // namespace

CURLWebClient::CURLWebClient() {}

CURLWebClient::~CURLWebClient() {}

void CURLWebClient::DownloadToFile(const std::string& url,
                                   const std::string& file_path) {
   auto curl = create_handle();

   std::ofstream outFile(file_path, std::ios::binary);
   if (!outFile.is_open()) {
      throw std::runtime_error(
          "[CURLWebClient] Cannot open file for writing: " + file_path);
   }

   set_common_get_options(curl.get(), url, 30L, 300L);
   curl_easy_setopt(curl.get(), CURLOPT_WRITEFUNCTION, WriteCallbackFile);
   curl_easy_setopt(curl.get(), CURLOPT_WRITEDATA,
                    static_cast<void*>(&outFile));

   CURLcode res = curl_easy_perform(curl.get());
   outFile.close();

   if (res != CURLE_OK) {
      std::remove(file_path.c_str());
      std::string error = std::string("[CURLWebClient] Download failed: ") +
                          curl_easy_strerror(res);
      throw std::runtime_error(error);
   }

   long httpCode = 0;
   curl_easy_getinfo(curl.get(), CURLINFO_RESPONSE_CODE, &httpCode);

   if (httpCode != 200) {
      std::remove(file_path.c_str());
      std::stringstream ss;
      ss << "[CURLWebClient] HTTP error " << httpCode << " for URL " << url;
      throw std::runtime_error(ss.str());
   }
}

std::string CURLWebClient::Get(const std::string& url) {
   auto curl = create_handle();

   std::string response_string;
   set_common_get_options(curl.get(), url, 10L, 20L);
   curl_easy_setopt(curl.get(), CURLOPT_WRITEFUNCTION, WriteCallbackString);
   curl_easy_setopt(curl.get(), CURLOPT_WRITEDATA, &response_string);

   CURLcode res = curl_easy_perform(curl.get());

   if (res != CURLE_OK) {
      std::string error =
          std::string("[CURLWebClient] GET failed: ") + curl_easy_strerror(res);
      throw std::runtime_error(error);
   }

   long httpCode = 0;
   curl_easy_getinfo(curl.get(), CURLINFO_RESPONSE_CODE, &httpCode);

   if (httpCode != 200) {
      std::stringstream ss;
      ss << "[CURLWebClient] HTTP error " << httpCode << " for URL " << url;
      throw std::runtime_error(ss.str());
   }

   return response_string;
}

std::string CURLWebClient::UrlEncode(const std::string& value) {
   // A NULL handle is fine for UTF-8 encoding according to libcurl docs.
   char* output = curl_easy_escape(nullptr, value.c_str(), 0);

   if (output) {
      std::string result(output);
      curl_free(output);
      return result;
   }
   throw std::runtime_error("[CURLWebClient] curl_easy_escape failed");
}
