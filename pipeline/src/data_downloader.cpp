#include "data_downloader.h"
#include "web_client.h"
#include <filesystem>
#include <fstream>
#include <spdlog/spdlog.h>
#include <sstream>
#include <stdexcept>

DataDownloader::DataDownloader(std::shared_ptr<IWebClient> webClient)
    : m_webClient(std::move(webClient)) {}

DataDownloader::~DataDownloader() {}

bool DataDownloader::FileExists(const std::string &filePath)  {
  return std::filesystem::exists(filePath);
}

std::string
DataDownloader::DownloadCountriesDatabase(const std::string &cachePath,
                                          const std::string &commit) {
  if (FileExists(cachePath)) {
    spdlog::info("[DataDownloader] Cache hit: {}", cachePath);
    return cachePath;
  }

  std::string shortCommit = commit;
  if (commit.length() > 7) {
    shortCommit = commit.substr(0, 7);
  }

  std::string url = "https://raw.githubusercontent.com/dr5hn/"
                    "countries-states-cities-database/" +
                    shortCommit + "/json/countries+states+cities.json";

  spdlog::info("[DataDownloader] Downloading: {}", url);

  m_webClient->DownloadToFile(url, cachePath);

  std::ifstream fileCheck(cachePath, std::ios::binary | std::ios::ate);
  std::streamsize size = fileCheck.tellg();
  fileCheck.close();

  spdlog::info("[DataDownloader] OK: Download complete: {} ({:.2f} MB)",
               cachePath, (size / (1024.0 * 1024.0)));
  return cachePath;
}
