#include "services/sqlite_connection_helpers.h"

#include <stdexcept>

namespace sqlite_export_service_internal {

void SqliteDatabaseDeleter::operator()(sqlite3* handle) const noexcept {
  if (handle != nullptr) {
    sqlite3_close(handle);
  }
}

void SqliteStatementDeleter::operator()(
    sqlite3_stmt* statement) const noexcept {
  if (statement != nullptr) {
    sqlite3_finalize(statement);
  }
}

void ThrowSqliteError(sqlite3* db_handle, std::string_view action) {
  const std::string message =
      db_handle != nullptr ? sqlite3_errmsg(db_handle) : "unknown SQLite error";
  throw std::runtime_error(std::string(action) + ": " + message);
}

SqliteDatabaseHandle OpenDatabase(const std::filesystem::path& path) {
  sqlite3* raw_handle = nullptr;
  const int result = sqlite3_open(path.string().c_str(), &raw_handle);

  SqliteDatabaseHandle handle(raw_handle);
  if (result != SQLITE_OK) {
    const std::string message = raw_handle != nullptr
                                    ? sqlite3_errmsg(raw_handle)
                                    : "unknown SQLite error";
    throw std::runtime_error("Failed to open SQLite export database: " +
                             message);
  }

  return handle;
}

void ExecSql(const SqliteDatabaseHandle& db_handle, std::string_view sql,
             const char* action) {
  char* error_message = nullptr;
  const std::string sql_text(sql);
  const int result = sqlite3_exec(db_handle.get(), sql_text.c_str(), nullptr,
                                  nullptr, &error_message);
  if (result != SQLITE_OK) {
    const std::string message = error_message != nullptr
                                    ? error_message
                                    : sqlite3_errmsg(db_handle.get());
    sqlite3_free(error_message);
    throw std::runtime_error(std::string(action) + ": " + message);
  }
}

void RollbackTransactionNoThrow(
    const SqliteDatabaseHandle& db_handle) noexcept {
  if (!db_handle) {
    return;
  }

  sqlite3_exec(db_handle.get(), "ROLLBACK;", nullptr, nullptr, nullptr);
}

}  // namespace sqlite_export_service_internal
