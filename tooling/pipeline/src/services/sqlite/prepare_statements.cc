/**
 * @file services/sqlite/prepare_statements.cc
 * @brief SqliteExportService::PrepareStatements() implementation.
 */

#include "services/sqlite_export_service.h"
#include "services/sqlite_export_service_helpers.h"

void SqliteExportService::PrepareStatements() {
  insert_location_stmt_ = sqlite_export_service_internal::PrepareStatement(
      db_handle_, sqlite_export_service_internal::kInsertLocationSql,
      "Failed to prepare SQLite location insert statement");
  insert_brewery_stmt_ = sqlite_export_service_internal::PrepareStatement(
      db_handle_, sqlite_export_service_internal::kInsertBrewerySql,
      "Failed to prepare SQLite brewery insert statement");
}
