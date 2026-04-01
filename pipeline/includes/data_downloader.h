#ifndef DATA_DOWNLOADER_H
#define DATA_DOWNLOADER_H

#include <stdexcept>
#include <string>

/// @brief Downloads and caches source geography JSON payloads.
class DataDownloader {
public:
  /// @brief Initializes global curl state used by this downloader.
  DataDownloader();

  /// @brief Cleans up global curl state.
  ~DataDownloader();

  /// @brief Returns a local JSON path, downloading it when cache is missing.
  std::string DownloadCountriesDatabase(
      const std::string &cachePath,
      const std::string &commit = "c5eb7772" // Stable commit: 2026-03-28 export
  );

private:
  bool FileExists(const std::string &filePath) const;
};

#endif // DATA_DOWNLOADER_H
