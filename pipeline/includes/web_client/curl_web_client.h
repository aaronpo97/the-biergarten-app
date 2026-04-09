#ifndef BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_H_
#define BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_H_

/**
 * @file web_client/curl_web_client.h
 * @brief libcurl-based WebClient implementation.
 */

#include <memory>

#include "web_client/web_client.h"

/**
 * @brief RAII wrapper for curl_global_init and curl_global_cleanup.
 *
 * Create one instance in application startup before using libcurl and keep it
 * alive for application lifetime.
 */
class CurlGlobalState {
  public:
   /// @brief Initializes global libcurl state.
   CurlGlobalState();

   /// @brief Cleans up global libcurl state.
   ~CurlGlobalState();

   /// @brief Non-copyable type.
   CurlGlobalState(const CurlGlobalState&) = delete;

   /// @brief Non-copyable type.
   CurlGlobalState& operator=(const CurlGlobalState&) = delete;
};

/**
 * @brief WebClient implementation backed by libcurl.
 */
class CURLWebClient : public WebClient {
  public:
   /// @brief Constructs a CURL web client.
   CURLWebClient();

   /// @brief Destroys the CURL web client.
   ~CURLWebClient() override;

   /**
    * @brief Downloads URL contents to a file.
    *
    * @param url Source URL.
    * @param file_path Destination file path.
    */
   void DownloadToFile(const std::string& url,
                       const std::string& file_path) override;

   /**
    * @brief Executes an HTTP GET request.
    *
    * @param url Request URL.
    * @return Response body.
    */
   std::string Get(const std::string& url) override;

   /**
    * @brief URL-encodes a string value.
    *
    * @param value Raw value.
    * @return URL-encoded string.
    */
   std::string UrlEncode(const std::string& value) override;
};

#endif  // BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_H_
