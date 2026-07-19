/**
 * @file services/sqlite/sqlite_export_service.cc
 * @brief SqliteExportService constructor and destructor implementation.
 */

#include "services/database/sqlite_export_service.h"

#include <memory>

SqliteExportService::SqliteExportService(const ApplicationOptions& options)
    : date_time_provider_(std::make_unique<SystemDateTimeProvider>()),
      output_path_(options.pipeline.output_path) {}

SqliteExportService::~SqliteExportService() {
   if (db_handle_ != nullptr) {
      RollbackAndCloseNoThrow();
   }
}
