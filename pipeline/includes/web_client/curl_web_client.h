#ifndef BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_H_
#define BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_H_

#include "web_client/web_client.h"
#include <memory>

// RAII for curl_global_init/cleanup.
// An instance of this class should be created in main() before any curl
// operations and exist for the lifetime of the application.
class CurlGlobalState {
public:
  CurlGlobalState();
  ~CurlGlobalState();
  CurlGlobalState(const CurlGlobalState &) = delete;
  CurlGlobalState &operator=(const CurlGlobalState &) = delete;
};

class CURLWebClient : public WebClient {
public:
  CURLWebClient();
  ~CURLWebClient() override;

  void DownloadToFile(const std::string &url,
                      const std::string &file_path) override;
  std::string Get(const std::string &url) override;
  std::string UrlEncode(const std::string &value) override;
};

#endif  // BIERGARTEN_PIPELINE_WEB_CLIENT_CURL_WEB_CLIENT_H_
