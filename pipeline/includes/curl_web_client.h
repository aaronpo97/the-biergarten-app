#pragma once

#include "web_client.h"
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

class CURLWebClient : public IWebClient {
public:
  CURLWebClient();
  ~CURLWebClient() override;

  void DownloadToFile(const std::string &url,
                      const std::string &filePath) override;
  std::string Get(const std::string &url) override;
  std::string UrlEncode(const std::string &value) override;
};
