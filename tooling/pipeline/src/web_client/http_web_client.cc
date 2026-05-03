/**
* @file web_client/http_web_client.cc
 * @brief cpp-httplib implementation of WebClient.
 */

#include "web_client/http_web_client.h"

#include <httplib.h>

#include <regex>
#include <stdexcept>
#include <string>
#include <utility>

namespace {
constexpr time_t kConnectionTimeoutSeconds = 5;
constexpr time_t kReadTimeoutSeconds = 10;

constexpr int kSuccessMin = 200;
constexpr int kSuccessMax = 300;
const std::regex kUrlRegex(
    R"(^(https?://[^/?#]+)(/[^?#]*(?:\?[^#]*)?(?:#.*)?)?)");

std::pair<std::string, std::string> SplitUrl(const std::string& url) {
  std::smatch match;
  if (!std::regex_match(url, match, kUrlRegex)) {
    throw std::invalid_argument("[HttpWebClient] Malformed URL: " + url);
  }

  return {match[1].str(), match[2].matched ? match[2].str() : "/"};
}
} // namespace

std::string HttpWebClient::Get(const std::string& url) {
  const auto [origin, path] = SplitUrl(url);

  httplib::Client client(origin);
  client.set_follow_location(true);
  client.set_connection_timeout(kConnectionTimeoutSeconds);
  client.set_read_timeout(kReadTimeoutSeconds);

  const auto result = client.Get(path);

  if (!result) {
    throw std::runtime_error(
        "[HttpWebClient] Request failed for URL: " + url +
        " — " + httplib::to_string(result.error()));
  }

  if (result->status < kSuccessMin || result->status >= kSuccessMax) {
    throw std::runtime_error(
        "[HttpWebClient] HTTP " + std::to_string(result->status) +
        " for URL: " + url);
  }

  return result->body;
}

std::string HttpWebClient::UrlEncode(const std::string& value) {
  return httplib::encode_uri_component(value);
}