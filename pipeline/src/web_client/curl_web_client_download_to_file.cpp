/**
 * @file web_client/curl_web_client_download_to_file.cpp
 * @brief CURLWebClient::DownloadToFile() implementation.
 */

#include <curl/curl.h>

#include <cstdio>
#include <fstream>
#include <memory>
#include <sstream>
#include <stdexcept>

#include "web_client/curl_web_client.h"

// RAII wrapper for CURL handle using unique_ptr
using CurlHandle = std::unique_ptr<CURL, decltype(&curl_easy_cleanup)>;

static CurlHandle create_handle() {
   CURL* handle = curl_easy_init();
   if (!handle) {
      throw std::runtime_error(
          "[CURLWebClient] Failed to initialize libcurl handle");
   }
   return CurlHandle(handle, &curl_easy_cleanup);
}

static void set_common_get_options(CURL* curl, const std::string& url,
                                   long connect_timeout, long total_timeout) {
   curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
   curl_easy_setopt(curl, CURLOPT_USERAGENT, "biergarten-pipeline/0.1.0");
   curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
   curl_easy_setopt(curl, CURLOPT_MAXREDIRS, 5L);
   curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, connect_timeout);
   curl_easy_setopt(curl, CURLOPT_TIMEOUT, total_timeout);
   curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "gzip");
}

// curl write callback that writes to a file stream
static size_t WriteCallbackFile(void* contents, size_t size, size_t nmemb,
                                void* userp) {
   size_t realsize = size * nmemb;
   auto* outFile = static_cast<std::ofstream*>(userp);
   outFile->write(static_cast<char*>(contents), realsize);
   return realsize;
}

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
