#ifndef DATA_DOWNLOADER_H
#define DATA_DOWNLOADER_H

#include <memory>
#include <stdexcept>
#include <string>

#include "web_client/web_client.h"

/// @brief Downloads and caches source geography JSON payloads.
class DataDownloader {
public:
  /// @brief Initializes global curl state used by this downloader.
  explicit DataDownloader(std::shared_ptr<IWebClient> webClient);

  /// @brief Cleans up global curl state.
  ~DataDownloader();

  /// @brief Returns a local JSON path, downloading it when cache is missing.
  std::string DownloadCountriesDatabase(
      const std::string &cachePath,
      const std::string &commit = "c5eb7772" // Stable commit: 2026-03-28 export
  );

private:
  static bool FileExists(const std::string &filePath) ;
  std::shared_ptr<IWebClient> m_webClient;
};

#endif // DATA_DOWNLOADER_H
