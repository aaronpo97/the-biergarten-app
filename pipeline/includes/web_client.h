#pragma once

#include <string>

class IWebClient {
public:
  virtual ~IWebClient() = default;

  // Downloads content from a URL to a file. Throws on error.
  virtual void DownloadToFile(const std::string &url,
                              const std::string &filePath) = 0;

  // Performs a GET request and returns the response body as a string. Throws on
  // error.
  virtual std::string Get(const std::string &url) = 0;

  // URL-encodes a string.
  virtual std::string UrlEncode(const std::string &value) = 0;
};
