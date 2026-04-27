/**
 * @file services/sqlite/build_database_path.cc
 * @brief SqliteExportService::BuildDatabasePath() implementation.
 */

#include <filesystem>
#include <string>

#include "services/sqlite_export_service.h"

std::filesystem::path SqliteExportService::BuildDatabasePath() const {
  std::filesystem::path base_filename("biergarten_seed_" + run_timestamp_utc_ +
                                      ".sqlite");
  std::filesystem::path candidate =
      std::filesystem::current_path() / base_filename;

  for (int suffix = 1; std::filesystem::exists(candidate); ++suffix) {
    candidate = std::filesystem::current_path() /
                std::filesystem::path("biergarten_seed_" + run_timestamp_utc_ +
                                      "-" + std::to_string(suffix) + ".sqlite");
  }

  return candidate;
}
