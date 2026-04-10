/**
 * @file web_client/curl_web_client_download_to_file.cpp
 * @brief CURLWebClient::DownloadToFile() implementation.
 */

#include <curl/curl.h>

#include <cstdio>
#include <fstream>
#include <sstream>
#include <stdexcept>

#include "curl_web_client_utils.h"
#include "web_client/curl_web_client.h"

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

   set_common_get_options(curl.get(), url, {30L, 300L});
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
