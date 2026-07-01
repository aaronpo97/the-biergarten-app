/**
 * @file services/sqlite/finalize.cc
 * @brief SqliteExportService::Finalize() implementation.
 */

#include <stdexcept>

#include "services/database/sqlite_export_service.h"
#include "services/database/sqlite_export_service_helpers.h"

void SqliteExportService::Finalize() {
  if (db_handle_ == nullptr) {
    return;
  }

  try {
    insert_user_stmt_.reset();
    insert_brewery_stmt_.reset();
    insert_location_stmt_.reset();
    if (transaction_open_) {
      sqlite_export_service_internal::ExecSql(
          db_handle_, "COMMIT;", "Failed to commit SQLite transaction");
      transaction_open_ = false;
    }

    db_handle_.reset();
    location_cache_.clear();
  } catch (...) {
    RollbackAndCloseNoThrow();
    throw;
  }
}
