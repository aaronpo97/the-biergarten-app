/**
 * @file services/sqlite/sqlite_export_service.cc
 * @brief SqliteExportService constructor and destructor implementation.
 */

#include "services/sqlite_export_service.h"

#include <memory>

SqliteExportService::SqliteExportService()
    : date_time_provider_(std::make_unique<SystemDateTimeProvider>()) {}

SqliteExportService::~SqliteExportService() {
  if (db_handle_ != nullptr) {
    RollbackAndCloseNoThrow();
  }
}