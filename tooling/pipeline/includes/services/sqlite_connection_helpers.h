#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_SQLITE_CONNECTION_HELPERS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_SQLITE_CONNECTION_HELPERS_H_

/**
 * @file services/sqlite_connection_helpers.h
 * @brief Declarations for connection-level SQLite helper functions.
 */

#include <sqlite3.h>
#include <filesystem>
#include <string>
#include <string_view>

#include "services/sqlite_handle_types.h"

namespace sqlite_export_service_internal {

void ThrowSqliteError(sqlite3* db_handle, std::string_view action);

SqliteDatabaseHandle OpenDatabase(const std::filesystem::path& path);

void ExecSql(const SqliteDatabaseHandle& db_handle, std::string_view sql,
			 const char* action);

void RollbackTransactionNoThrow(const SqliteDatabaseHandle& db_handle) noexcept;

}  // namespace sqlite_export_service_internal

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_SQLITE_CONNECTION_HELPERS_H_


