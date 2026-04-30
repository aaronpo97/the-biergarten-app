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


void SqliteExportService::InitializeSchema() const {
  sqlite_export_service_internal::ExecSql(
      db_handle_, sqlite_export_service_internal::kCreateLocationsTableSql,
      "Failed to create SQLite locations table");
  sqlite_export_service_internal::ExecSql(
      db_handle_, sqlite_export_service_internal::kCreateBreweriesTableSql,
      "Failed to create SQLite breweries table");
}

void SqliteExportService::PrepareStatements() {
  insert_location_stmt_ = sqlite_export_service_internal::PrepareStatement(
      db_handle_, sqlite_export_service_internal::kInsertLocationSql,
      "Failed to prepare SQLite location insert statement");
  insert_brewery_stmt_ = sqlite_export_service_internal::PrepareStatement(
      db_handle_, sqlite_export_service_internal::kInsertBrewerySql,
      "Failed to prepare SQLite brewery insert statement");
}

void SqliteExportService::RollbackAndCloseNoThrow() noexcept {
  if (db_handle_ == nullptr) {
    return;
  }

  if (transaction_open_) {
    sqlite_export_service_internal::RollbackTransactionNoThrow(db_handle_);
    transaction_open_ = false;
  }

  insert_brewery_stmt_.reset();
  insert_location_stmt_.reset();
  db_handle_.reset();
  location_cache_.clear();
}


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
