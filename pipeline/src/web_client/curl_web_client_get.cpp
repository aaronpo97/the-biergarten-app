/**
 * @file web_client/curl_web_client_get.cpp
 * @brief CURLWebClient::Get() implementation.
 */

#include <curl/curl.h>

#include <sstream>
#include <stdexcept>
#include <string>

#include "curl_web_client_utils.h"
#include "web_client/curl_web_client.h"

// curl write callback that appends response data into a std::string
static size_t WriteCallbackString(void* contents, size_t size, size_t nmemb,
                                  void* userp) {
   size_t realsize = size * nmemb;
   auto* s = static_cast<std::string*>(userp);
   s->append(static_cast<char*>(contents), realsize);
   return realsize;
}

std::string CURLWebClient::Get(const std::string& url) {
   auto curl = create_handle();

   std::string response_string;
   set_common_get_options(curl.get(), url, {10L, 20L});
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
