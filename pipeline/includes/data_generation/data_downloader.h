#ifndef BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_DOWNLOADER_H_
#define BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_DOWNLOADER_H_

#include <memory>
#include <stdexcept>
#include <string>

#include "web_client/web_client.h"

/// @brief Downloads and caches source geography JSON payloads.
class DataDownloader {
  public:
   /// @brief Initializes global curl state used by this downloader.
   explicit DataDownloader(std::shared_ptr<WebClient> web_client);

   /// @brief Cleans up global curl state.
   ~DataDownloader();

   /// @brief Returns a local JSON path, downloading it when cache is missing.
   std::string DownloadCountriesDatabase(
       const std::string& cache_path,
       const std::string& commit =
           "c5eb7772"  // Stable commit: 2026-03-28 export
   );

  private:
   static bool FileExists(const std::string& file_path);
   std::shared_ptr<WebClient> web_client_;
};

#endif  // BIERGARTEN_PIPELINE_DATA_GENERATION_DATA_DOWNLOADER_H_
