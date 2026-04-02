#include "data_downloader.h"
#include <cstdio>
#include <curl/curl.h>
#include <filesystem>
#include <fstream>
#include <spdlog/spdlog.h>
#include <sstream>

static size_t WriteCallback(void *contents, size_t size, size_t nmemb,
                            void *userp) {
  size_t realsize = size * nmemb;
  std::ofstream *outFile = static_cast<std::ofstream *>(userp);
  outFile->write(static_cast<char *>(contents), realsize);
  return realsize;
}

DataDownloader::DataDownloader() {}

DataDownloader::~DataDownloader() {}

bool DataDownloader::FileExists(const std::string &filePath) const {
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

  CURL *curl = curl_easy_init();
  if (!curl) {
    throw std::runtime_error("[DataDownloader] Failed to initialize libcurl");
  }

  std::ofstream outFile(cachePath, std::ios::binary);
  if (!outFile.is_open()) {
    curl_easy_cleanup(curl);
    throw std::runtime_error("[DataDownloader] Cannot open file for writing: " +
                             cachePath);
  }

  curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
  curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
  curl_easy_setopt(curl, CURLOPT_WRITEDATA, static_cast<void *>(&outFile));

  curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 30L);
  curl_easy_setopt(curl, CURLOPT_TIMEOUT, 300L);

  curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
  curl_easy_setopt(curl, CURLOPT_MAXREDIRS, 5L);

  curl_easy_setopt(curl, CURLOPT_ACCEPT_ENCODING, "gzip");

  curl_easy_setopt(curl, CURLOPT_USERAGENT, "biergarten-pipeline/0.1.0");

  CURLcode res = curl_easy_perform(curl);
  outFile.close();

  if (res != CURLE_OK) {
    curl_easy_cleanup(curl);
    std::remove(cachePath.c_str());

    std::string error = std::string("[DataDownloader] Download failed: ") +
                        curl_easy_strerror(res);
    throw std::runtime_error(error);
  }

  long httpCode = 0;
  curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpCode);
  curl_easy_cleanup(curl);

  if (httpCode != 200) {
    std::remove(cachePath.c_str());

    std::stringstream ss;
    ss << "[DataDownloader] HTTP error " << httpCode
       << " (commit: " << shortCommit << ")";
    throw std::runtime_error(ss.str());
  }

  std::ifstream fileCheck(cachePath, std::ios::binary | std::ios::ate);
  std::streamsize size = fileCheck.tellg();
  fileCheck.close();

  spdlog::info("[DataDownloader] OK: Download complete: {} ({:.2f} MB)",
               cachePath, (size / (1024.0 * 1024.0)));
  return cachePath;
}
