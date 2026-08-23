#ifndef BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_WEB_CLIENT_H_
#define BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_WEB_CLIENT_H_

/**
 * @file web_client/web_client.h
 * @brief Abstract interface for HTTP and URL utilities.
 */

#include <string>
#include <utility>
#include <vector>

/**
 * @brief Abstract web client interface.
 */
class WebClient {
  public:
   virtual ~WebClient() = default;

   /**
    * @brief Executes an HTTP GET request.
    *
    * @param url Request URL.
    * @return Response body.
    */
   virtual std::string Get(const std::string& url) = 0;

   /**
    * @brief Executes an HTTP POST request with a JSON body.
    *
    * @param url Request URL.
    * @param body Request body (sent as-is; callers are responsible for
    * providing valid JSON when the target API expects it).
    * @param headers Additional request headers (e.g. authentication),
    * sent alongside a fixed "Content-Type: application/json" header.
    * @return Response body.
    */
   virtual std::string Post(
       const std::string& url, const std::string& body,
       const std::vector<std::pair<std::string, std::string>>& headers) = 0;

   /**
    * @brief URL-encodes a string value.
    *
    * @param value Raw string value.
    * @return Encoded value safe for URL usage.
    */
   virtual std::string EncodeURL(const std::string& value) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_WEB_CLIENT_H_
