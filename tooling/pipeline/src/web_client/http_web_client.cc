/**
 * @file web_client/http_web_client.cc
 * @brief cpp-httplib implementation of WebClient.
 */

#include "web_client/http_web_client.h"

#include <httplib.h>

#include <chrono>
#include <format>
#include <regex>
#include <stdexcept>
#include <string>
#include <utility>

#include "services/logging/logger.h"

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
}  // namespace

std::string HttpWebClient::Get(const std::string& url) {
  const auto [origin, path] = SplitUrl(url);

  httplib::Client client(origin);
  client.set_follow_location(true);
  client.set_connection_timeout(kConnectionTimeoutSeconds);
  client.set_read_timeout(kReadTimeoutSeconds);
  client.set_default_headers({{"Accept", "application/json"},
                              {"User-Agent", "biergarten-pipeline/1.0"}});

  const httplib::Result result = client.Get(path);

  if (!result) {
    throw std::runtime_error(std::format(
        "[HttpWebClient] Request failed for URL: {} — {}", url,
        httplib::to_string(result.error())));
  }

  if (result->status < kSuccessMin || result->status >= kSuccessMax) {
    if (logger_) {
      logger_->Log(
          {.level = LogLevel::Error,
           .phase = PipelinePhase::UserGeneration,
         .message =
           std::format("[HttpWebClient] Request failed for URL: {}", url)});
    }
    throw std::runtime_error(std::format("[HttpWebClient] HTTP {} for URL: {}",
                       result->status, url));
  }

  return result->body;
}

std::string HttpWebClient::EncodeURL(const std::string& value) {
  return httplib::encode_uri_component(value);
}
