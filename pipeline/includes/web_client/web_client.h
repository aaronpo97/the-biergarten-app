#ifndef BIERGARTEN_PIPELINE_WEB_CLIENT_WEB_CLIENT_H_
#define BIERGARTEN_PIPELINE_WEB_CLIENT_WEB_CLIENT_H_

#include <string>

class WebClient {
public:
  virtual ~WebClient() = default;

  // Downloads content from a URL to a file. Throws on error.
  virtual void DownloadToFile(const std::string &url,
                              const std::string &file_path) = 0;

  // Performs a GET request and returns the response body as a string. Throws on
  // error.
  virtual std::string Get(const std::string &url) = 0;

  // URL-encodes a string.
  virtual std::string UrlEncode(const std::string &value) = 0;
};

#endif  // BIERGARTEN_PIPELINE_WEB_CLIENT_WEB_CLIENT_H_
