#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_HANDLE_TYPES_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_HANDLE_TYPES_H_

/**
 * Shared handle and parameter type declarations used by SQLite helper units.
 */

#include <sqlite3.h>

#include <memory>
#include <string_view>

namespace sqlite_export_service_internal {

struct SqliteDatabaseDeleter {
  void operator()(sqlite3* handle) const noexcept;
};

struct SqliteStatementDeleter {
  void operator()(sqlite3_stmt* statement) const noexcept;
};

using SqliteDatabaseHandle = std::unique_ptr<sqlite3, SqliteDatabaseDeleter>;
using SqliteStatementHandle =
    std::unique_ptr<sqlite3_stmt, SqliteStatementDeleter>;

template <typename T>
struct BindParam {
  int index;
  T value;
  std::string_view action;
};

}  // namespace sqlite_export_service_internal

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_HANDLE_TYPES_H_
