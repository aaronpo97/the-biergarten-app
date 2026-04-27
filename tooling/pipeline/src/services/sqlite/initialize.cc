/**
 * @file services/sqlite/initialize.cc
 * @brief SqliteExportService::Initialize() implementation.
 */

#include <filesystem>
#include <memory>
#include <stdexcept>
#include <string>

#include "services/sqlite_export_service.h"
#include "services/sqlite_export_service_helpers.h"

void SqliteExportService::Initialize() {
  if (db_handle_ != nullptr) {
    throw std::runtime_error("SQLite export service is already initialized");
  }

  run_timestamp_utc_ = date_time_provider_->GetUtcTimestamp();
  database_path_ = BuildDatabasePath();
  std::filesystem::create_directories(database_path_.parent_path());

  db_handle_ = sqlite_export_service_internal::OpenDatabase(database_path_);

  try {
    sqlite_export_service_internal::ExecSql(
        db_handle_, "PRAGMA foreign_keys = ON;",
        "Failed to enable SQLite foreign keys");
    InitializeSchema();
    PrepareStatements();
    sqlite_export_service_internal::ExecSql(
        db_handle_, "BEGIN IMMEDIATE TRANSACTION;",
        "Failed to begin SQLite transaction");
    transaction_open_ = true;
  } catch (...) {
    RollbackAndCloseNoThrow();
    throw;
  }
}
