#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_SQLITE_EXPORT_SERVICE_HELPERS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_SQLITE_EXPORT_SERVICE_HELPERS_H_

/**
 * @file services/sqlite_export_service_helpers.h
 * @brief Internal SQLite export helpers shared across per-method translation
 * units.
 */

#include <sqlite3.h>

#include <boost/json.hpp>
#include <cstddef>
#include <cstring>
#include <filesystem>
#include <limits>
#include <memory>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

namespace sqlite_export_service_internal {

struct SqliteDatabaseDeleter {
  void operator()(sqlite3* handle) const noexcept {
    if (handle != nullptr) {
      sqlite3_close(handle);
    }
  }
};

struct SqliteStatementDeleter {
  void operator()(sqlite3_stmt* statement) const noexcept {
    if (statement != nullptr) {
      sqlite3_finalize(statement);
    }
  }
};

using SqliteDatabaseHandle = std::unique_ptr<sqlite3, SqliteDatabaseDeleter>;
using SqliteStatementHandle =
    std::unique_ptr<sqlite3_stmt, SqliteStatementDeleter>;

inline constexpr std::string_view kCreateLocationsTableSql = R"sql(

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  iso3166_2 TEXT NOT NULL,
  country TEXT NOT NULL,
  iso3166_1 TEXT NOT NULL,
  local_languages_json TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  UNIQUE(city, state_province, iso3166_2, country, latitude, longitude)
);

)sql";

inline constexpr std::string_view kCreateBreweriesTableSql = R"sql(

CREATE TABLE IF NOT EXISTS breweries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id INTEGER NOT NULL,
  name_en TEXT NOT NULL,
  description_en TEXT NOT NULL,
  name_local TEXT NOT NULL,
  description_local TEXT NOT NULL,
  FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_breweries_location_id ON breweries(location_id);

)sql";

inline constexpr std::string_view kInsertLocationSql = R"sql(
INSERT INTO locations (
  city,
  state_province,
  iso3166_2,
  country,
  iso3166_1,
  local_languages_json,
  latitude,
  longitude
) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
)sql";

inline constexpr std::string_view kInsertBrewerySql = R"sql(
INSERT INTO breweries (
  location_id,
  name_en,
  description_en,
  name_local,
  description_local
) VALUES (?, ?, ?, ?, ?);
)sql";

inline constexpr int kLocationCityBindIndex = 1;
inline constexpr int kLocationStateProvinceBindIndex = 2;
inline constexpr int kLocationIso31662BindIndex = 3;
inline constexpr int kLocationCountryBindIndex = 4;
inline constexpr int kLocationIso31661BindIndex = 5;
inline constexpr int kLocationLanguagesBindIndex = 6;
inline constexpr int kLocationLatitudeBindIndex = 7;
inline constexpr int kLocationLongitudeBindIndex = 8;

inline constexpr int kBreweryLocationIdBindIndex = 1;
inline constexpr int kBreweryEnglishNameBindIndex = 2;
inline constexpr int kBreweryEnglishDescriptionBindIndex = 3;
inline constexpr int kBreweryLocalNameBindIndex = 4;
inline constexpr int kBreweryLocalDescriptionBindIndex = 5;

inline void ThrowSqliteError(sqlite3* db_handle, std::string_view action) {
  const std::string message =
      db_handle != nullptr ? sqlite3_errmsg(db_handle) : "unknown SQLite error";
  throw std::runtime_error(std::string(action) + ": " + message);
}

inline SqliteDatabaseHandle OpenDatabase(const std::filesystem::path& path) {
  sqlite3* raw_handle = nullptr;
  const std::string path_string = path.string();
  const int result = sqlite3_open(path_string.c_str(), &raw_handle);
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

inline void ExecSql(const SqliteDatabaseHandle& db_handle, std::string_view sql,
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

inline SqliteStatementHandle PrepareStatement(
    const SqliteDatabaseHandle& db_handle, std::string_view sql,
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

inline void ResetStatement(SqliteStatementHandle& statement) {
  if (statement != nullptr) {
    sqlite3_reset(statement.get());
    sqlite3_clear_bindings(statement.get());
  }
}

inline void DeleteCharArray(void* data) noexcept {
  delete[] static_cast<char*>(data);
}

inline void BindText(const SqliteStatementHandle& statement, int index,
                     std::string_view value, const char* action) {
  const auto byte_count = value.size();
  if (byte_count > static_cast<std::size_t>(std::numeric_limits<int>::max())) {
    ThrowSqliteError(sqlite3_db_handle(statement.get()), action);
  }

  auto buffer = std::make_unique<char[]>(byte_count + 1);
  std::memcpy(buffer.get(), value.data(), byte_count);
  buffer[byte_count] = '\0';

  char* raw_buffer = buffer.release();
  const int result =
      sqlite3_bind_text(statement.get(), index, raw_buffer,
                        static_cast<int>(byte_count), DeleteCharArray);
  if (result != SQLITE_OK) {
    DeleteCharArray(raw_buffer);
    ThrowSqliteError(sqlite3_db_handle(statement.get()), action);
  }
}

inline void BindDouble(const SqliteStatementHandle& statement, int index,
                       double value, std::string_view action) {
  const int result = sqlite3_bind_double(statement.get(), index, value);
  if (result != SQLITE_OK) {
    ThrowSqliteError(sqlite3_db_handle(statement.get()), action);
  }
}

inline void BindInt64(const SqliteStatementHandle& statement, int index,
                      sqlite3_int64 value, std::string_view action) {
  const int result = sqlite3_bind_int64(statement.get(), index, value);
  if (result != SQLITE_OK) {
    ThrowSqliteError(sqlite3_db_handle(statement.get()), action);
  }
}

inline void StepStatement(const SqliteDatabaseHandle& db_handle,
                          const SqliteStatementHandle& statement,
                          std::string_view action) {
  const int result = sqlite3_step(statement.get());
  if (result != SQLITE_DONE) {
    ThrowSqliteError(db_handle.get(), action);
  }
}

inline sqlite3_int64 LastInsertRowId(const SqliteDatabaseHandle& db_handle) {
  return sqlite3_last_insert_rowid(db_handle.get());
}

inline void RollbackTransactionNoThrow(
    const SqliteDatabaseHandle& db_handle) noexcept {
  if (!db_handle) {
    return;
  }

  sqlite3_exec(db_handle.get(), "ROLLBACK;", nullptr, nullptr, nullptr);
}

inline std::string SerializeLocalLanguages(
    const std::vector<std::string>& local_languages) {
  boost::json::array array;
  array.reserve(local_languages.size());
  for (const auto& language : local_languages) {
    array.emplace_back(language);
  }
  return boost::json::serialize(array);
}

}  // namespace sqlite_export_service_internal

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_SQLITE_EXPORT_SERVICE_HELPERS_H_
