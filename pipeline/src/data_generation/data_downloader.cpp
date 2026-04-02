#include "data_generation/data_downloader.h"
#include "web_client/web_client.h"
#include <filesystem>
#include <fstream>
#include <spdlog/spdlog.h>
#include <sstream>
#include <stdexcept>

DataDownloader::DataDownloader(std::shared_ptr<WebClient> web_client)
    : web_client_(std::move(web_client)) {}

DataDownloader::~DataDownloader() {}

bool DataDownloader::FileExists(const std::string &file_path) {
  return std::filesystem::exists(file_path);
}

std::string
DataDownloader::DownloadCountriesDatabase(const std::string &cache_path,
                                          const std::string &commit) {
  if (FileExists(cache_path)) {
    spdlog::info("[DataDownloader] Cache hit: {}", cache_path);
    return cache_path;
  }

  std::string short_commit = commit;
  if (commit.length() > 7) {
    short_commit = commit.substr(0, 7);
  }

  std::string url = "https://raw.githubusercontent.com/dr5hn/"
                    "countries-states-cities-database/" +
                    short_commit + "/json/countries+states+cities.json";

  spdlog::info("[DataDownloader] Downloading: {}", url);

  web_client_->DownloadToFile(url, cache_path);

  std::ifstream file_check(cache_path, std::ios::binary | std::ios::ate);
  std::streamsize size = file_check.tellg();
  file_check.close();

  spdlog::info("[DataDownloader] OK: Download complete: {} ({:.2f} MB)",
               cache_path, (size / (1024.0 * 1024.0)));
  return cache_path;
}
