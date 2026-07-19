/**
 * @file services/sqlite/initialize.cc
 * @brief SqliteExportService::Initialize() implementation.
 */

#include <filesystem>
#include <format>
#include <memory>
#include <stdexcept>
#include <string>

#include "services/database/sqlite_export_service.h"

std::filesystem::path SqliteExportService::BuildDatabasePath() const {
  std::filesystem::path base_filename("biergarten_seed_" + run_timestamp_utc_ +
                                      ".sqlite");
  std::filesystem::path candidate = output_path_ / base_filename;

  for (int suffix = 1; std::filesystem::exists(candidate); ++suffix) {
    candidate = output_path_ / std::filesystem::path(
                                   std::format("biergarten_seed_{}-{}.sqlite",
                                               run_timestamp_utc_, suffix));
  }

  return candidate;
}

void SqliteExportService::InitializeSchema() const {
  sqlite_export_service_internal::ExecSql(
      db_handle_, sqlite_export_service_internal::kCreateCitiesTableSql,
      "Failed to create SQLite cities table");
  sqlite_export_service_internal::ExecSql(
      db_handle_, sqlite_export_service_internal::kCreateBreweriesTableSql,
      "Failed to create SQLite breweries table");
  sqlite_export_service_internal::ExecSql(
      db_handle_,
      sqlite_export_service_internal::kCreateBreweryAddressesTableSql,
      "Failed to create SQLite brewery_addresses table");
  sqlite_export_service_internal::ExecSql(
      db_handle_, sqlite_export_service_internal::kCreateUsersTableSql,
      "Failed to create SQLite users table");
  sqlite_export_service_internal::ExecSql(
      db_handle_, sqlite_export_service_internal::kCreateUserAddressesTableSql,
      "Failed to create SQLite user_addresses table");
}

void SqliteExportService::PrepareStatements() {
  insert_city_stmt_ = sqlite_export_service_internal::PrepareStatement(
      db_handle_, sqlite_export_service_internal::kInsertCitySql,
      "Failed to prepare SQLite city insert statement");
  insert_brewery_stmt_ = sqlite_export_service_internal::PrepareStatement(
      db_handle_, sqlite_export_service_internal::kInsertBrewerySql,
      "Failed to prepare SQLite brewery insert statement");
  insert_brewery_address_stmt_ =
      sqlite_export_service_internal::PrepareStatement(
          db_handle_, sqlite_export_service_internal::kInsertBreweryAddressSql,
          "Failed to prepare SQLite brewery address insert statement");
  insert_user_stmt_ = sqlite_export_service_internal::PrepareStatement(
      db_handle_, sqlite_export_service_internal::kInsertUserSql,
      "Failed to prepare SQLite user insert statement");
  insert_user_address_stmt_ = sqlite_export_service_internal::PrepareStatement(
      db_handle_, sqlite_export_service_internal::kInsertUserAddressSql,
      "Failed to prepare SQLite user address insert statement");
}

void SqliteExportService::RollbackAndCloseNoThrow() noexcept {
  if (db_handle_ == nullptr) {
    return;
  }

  if (transaction_open_) {
    sqlite_export_service_internal::RollbackTransactionNoThrow(db_handle_);
    transaction_open_ = false;
  }

  insert_user_address_stmt_.reset();
  insert_user_stmt_.reset();
  insert_brewery_address_stmt_.reset();
  insert_brewery_stmt_.reset();
  insert_city_stmt_.reset();
  db_handle_.reset();
  city_cache_.clear();
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
