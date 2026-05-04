#include "services/database/sqlite_statement_helpers.h"

#include <boost/json.hpp>
#include <cstring>
#include <limits>
#include <memory>
#include <stdexcept>

#include "services/database/sqlite_connection_helpers.h"

namespace sqlite_export_service_internal {

SqliteStatementHandle PrepareStatement(const SqliteDatabaseHandle& db_handle,
                                       std::string_view sql,
                                       const char* action) {
  sqlite3_stmt* raw_statement = nullptr;
  const std::string sql_text(sql);
  const int result = sqlite3_prepare_v2(db_handle.get(), sql_text.c_str(), -1,
                                        &raw_statement, nullptr);
  SqliteStatementHandle statement(raw_statement);
  if (result != SQLITE_OK) {
    ThrowSqliteError(db_handle.get(), action);
  }

  return statement;
}

void ResetStatement(SqliteStatementHandle& statement) {
  if (statement != nullptr) {
    sqlite3_reset(statement.get());
    sqlite3_clear_bindings(statement.get());
  }
}

void Bind(const SqliteStatementHandle& statement,
          const BindParam<std::string_view>& param) {
  const auto byte_count = param.value.size();
  if (byte_count > static_cast<std::size_t>(std::numeric_limits<int>::max())) {
    ThrowSqliteError(sqlite3_db_handle(statement.get()), param.action);
  }

  auto delete_char_array = [](void* data) noexcept {
    // NOLINT(cppcoreguidelines-owning-memory)
    delete[] static_cast<char*>(data);
  };

  // NOLINT(cppcoreguidelines-avoid-c-arrays, modernize-avoid-c-arrays)
  auto buffer = std::make_unique<char[]>(byte_count + 1);
  std::memcpy(buffer.get(), param.value.data(), byte_count);
  buffer[byte_count] = '\0';

  char* raw_buffer = buffer.release();

  if (sqlite3_bind_text(statement.get(), param.index, raw_buffer,
                        static_cast<int>(byte_count),
                        delete_char_array) != SQLITE_OK) {
    delete_char_array(raw_buffer);
    ThrowSqliteError(sqlite3_db_handle(statement.get()), param.action);
  }
}

void Bind(const SqliteStatementHandle& statement,
          const BindParam<double>& param) {
  if (sqlite3_bind_double(statement.get(), param.index, param.value) !=
      SQLITE_OK) {
    ThrowSqliteError(sqlite3_db_handle(statement.get()), param.action);
  }
}

void Bind(const SqliteStatementHandle& statement,
          const BindParam<sqlite3_int64>& param) {
  if (sqlite3_bind_int64(statement.get(), param.index, param.value) !=
      SQLITE_OK) {
    ThrowSqliteError(sqlite3_db_handle(statement.get()), param.action);
  }
}

void StepStatement(const SqliteDatabaseHandle& db_handle,
                   const SqliteStatementHandle& statement,
                   std::string_view action) {
  if (sqlite3_step(statement.get()) != SQLITE_DONE) {
    ThrowSqliteError(db_handle.get(), action);
  }
}

sqlite3_int64 LastInsertRowId(const SqliteDatabaseHandle& db_handle) {
  return sqlite3_last_insert_rowid(db_handle.get());
}

std::string SerializeVector(const std::vector<std::string>& str_vec) {
  boost::json::array array(str_vec.size());
  for (const auto& s : str_vec) {
    array.emplace_back(s);
  }
  return boost::json::serialize(array);
}

}  // namespace sqlite_export_service_internal
