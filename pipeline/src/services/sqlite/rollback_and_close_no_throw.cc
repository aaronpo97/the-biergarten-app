/**
 * @file services/sqlite/rollback_and_close_no_throw.cc
 * @brief SqliteExportService::RollbackAndCloseNoThrow() implementation.
 */

#include "services/sqlite_export_service.h"

void SqliteExportService::RollbackAndCloseNoThrow() noexcept {
  if (db_handle_ == nullptr) {
    return;
  }

  if (transaction_open_) {
    sqlite_export_service_internal::RollbackTransactionNoThrow(db_handle_);
    transaction_open_ = false;
  }

  FinalizeStatements();
  db_handle_.reset();
  location_cache_.clear();
}
