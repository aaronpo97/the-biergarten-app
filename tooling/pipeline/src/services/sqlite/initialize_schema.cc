/**
 * @file services/sqlite/initialize_schema.cc
 * @brief SqliteExportService::InitializeSchema() implementation.
 */

#include "services/sqlite_export_service.h"
#include "services/sqlite_export_service_helpers.h"

void SqliteExportService::InitializeSchema() {
  sqlite_export_service_internal::ExecSql(
      db_handle_, sqlite_export_service_internal::kCreateLocationsTableSql,
      "Failed to create SQLite locations table");
  sqlite_export_service_internal::ExecSql(
      db_handle_, sqlite_export_service_internal::kCreateBreweriesTableSql,
      "Failed to create SQLite breweries table");
}
