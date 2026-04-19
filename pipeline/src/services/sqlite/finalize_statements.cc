/**
 * @file services/sqlite/finalize_statements.cc
 * @brief SqliteExportService::FinalizeStatements() implementation.
 */

#include "services/sqlite_export_service.h"

void SqliteExportService::FinalizeStatements() noexcept {
  insert_brewery_stmt_.reset();
  insert_location_stmt_.reset();
}
