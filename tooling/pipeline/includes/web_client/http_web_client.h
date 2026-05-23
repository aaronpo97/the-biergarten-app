/**
* @file web_client/http_web_client.h
* @brief cpp-httplib implementation of the WebClient interface.
*/

#ifndef BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_HTTP_WEB_CLIENT_H_
#define BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_HTTP_WEB_CLIENT_H_


#include "web_client/web_client.h"
#include "services/logging/logger.h"

#include <memory>
#include <string>
#include <utility>

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
   * @param url Fully-qualified URL, e.g. "https://en.wikipedia.org/api/rest_v1/page/summary/Berlin"
   * @return Response body on HTTP 2xx; throws std::runtime_error otherwise.
   */
  std::string Get(const std::string& url) override;

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


#endif
