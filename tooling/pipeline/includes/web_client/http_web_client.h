/**
 * @file web_client/http_web_client.h
 * @brief cpp-httplib implementation of the WebClient interface.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_HTTP_WEB_CLIENT_H_
#define BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_HTTP_WEB_CLIENT_H_

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "services/logging/logger.h"
#include "web_client/web_client.h"

/**
 * @brief WebClient implementation backed by cpp-httplib.
 *
 * Supports HTTP and HTTPS (requires OpenSSL; see HTTPLIB_REQUIRE_OPENSSL
 * in CMakeLists.txt).
 *
 * URL parsing splits a full URL into origin (scheme://host[:port]) and
 * path + query so that httplib::Client can be constructed correctly.
 * A new client instance is created per request because the client is
 * bound to a single origin at construction time.
 */
class HttpWebClient final : public WebClient {
  public:
   explicit HttpWebClient(std::shared_ptr<ILogger> logger)
       : logger_(std::move(logger)) {}
   ~HttpWebClient() override = default;

   /**
    * @brief Executes a blocking HTTP/HTTPS GET request against a full URL.
    *
    * @param url Fully-qualified URL, e.g.
    * "https://en.wikipedia.org/api/rest_v1/page/summary/Berlin"
    * @return Response body on HTTP 2xx; throws std::runtime_error otherwise.
    */
   std::string Get(const std::string& url) override;

   /**
    * @brief Executes a blocking HTTP/HTTPS POST request against a full URL.
    *
    * Sends @p body with a "Content-Type: application/json" header, plus any
    * additional headers supplied by the caller (e.g. authentication).
    *
    * @param url Fully-qualified URL.
    * @param body Request body, sent as-is.
    * @param headers Additional request headers.
    * @return Response body on HTTP 2xx; throws std::runtime_error otherwise.
    */
   std::string Post(
       const std::string& url, const std::string& body,
       const std::vector<std::pair<std::string, std::string>>& headers)
       override;

   /**
    * @brief Percent-encodes a single URI component (query parameter value or
    *        path segment). Delegates to httplib::encode_uri_component().
    *
    * @param value Raw string to encode.
    * @return Percent-encoded string safe for use in a URL.
    */
   std::string EncodeURL(const std::string& value) override;

  private:
   std::shared_ptr<ILogger> logger_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_HTTP_WEB_CLIENT_H_
