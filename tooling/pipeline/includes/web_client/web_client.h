#ifndef BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_WEB_CLIENT_H_
#define BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_WEB_CLIENT_H_

/**
 * @file web_client/web_client.h
 * @brief Abstract interface for HTTP and URL utilities.
 */

#include <string>

/**
 * @brief Abstract web client interface.
 */
class WebClient {
 public:
  /// @brief Virtual destructor for polymorphic cleanup.
  virtual ~WebClient() = default;

  /**
   * @brief Executes an HTTP GET request.
   *
   * @param url Request URL.
   * @return Response body.
   */
  virtual std::string Get(const std::string& url) = 0;

  /**
   * @brief URL-encodes a string value.
   *
   * @param value Raw string value.
   * @return Encoded value safe for URL usage.
   */
  virtual std::string UrlEncode(const std::string& value) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_WEB_CLIENT_WEB_CLIENT_H_
