#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_STATEMENT_HELPERS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_STATEMENT_HELPERS_H_

/**
 * @file services/sqlite_statement_helpers.h
 * @brief Declarations for statement-level SQLite helper functions and
 * constants.
 */

#include <sqlite3.h>

#include <string>
#include <string_view>
#include <vector>

#include "services/database/sqlite_handle_types.h"

namespace sqlite_export_service_internal {

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

inline constexpr std::string_view kCreateUsersTableSql = R"sql(

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  username TEXT NOT NULL,
  bio TEXT NOT NULL,
  activity_weight REAL NOT NULL,
  email TEXT NOT NULL UNIQUE,
  date_of_birth TEXT NOT NULL,
  FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_location_id ON users(location_id);

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

inline constexpr std::string_view kInsertUserSql = R"sql(
INSERT INTO users (
  location_id,
  first_name,
  last_name,
  gender,
  username,
  bio,
  activity_weight,
  email,
  date_of_birth
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
)sql";

// sqlite3_bind_*() parameter indices are 1-based, matching the "?"
// placeholder order in the SQL above.
enum eLocationBindIndex {
  kLocationCityBindIndex = 1,
  kLocationStateProvinceBindIndex,
  kLocationIso31662BindIndex,
  kLocationCountryBindIndex,
  kLocationIso31661BindIndex,
  kLocationLanguagesBindIndex,
  kLocationLatitudeBindIndex,
  kLocationLongitudeBindIndex,
};

enum BreweryBindIndex {
  kBreweryLocationIdBindIndex = 1,
  kBreweryEnglishNameBindIndex,
  kBreweryEnglishDescriptionBindIndex,
  kBreweryLocalNameBindIndex,
  kBreweryLocalDescriptionBindIndex,
};

enum UserBindIndex {
  kUserLocationIdBindIndex = 1,
  kUserFirstNameBindIndex,
  kUserLastNameBindIndex,
  kUserGenderBindIndex,
  kUserUsernameBindIndex,
  kUserBioBindIndex,
  kUserActivityWeightBindIndex,
  kUserEmailBindIndex,
  kUserDateOfBirthBindIndex,
};

SqliteStatementHandle PrepareStatement(const SqliteDatabaseHandle& db_handle,
                                       std::string_view sql,
                                       const char* action);

void ResetStatement(SqliteStatementHandle& statement);

void Bind(const SqliteStatementHandle& statement,
          const BoundParam<std::string_view>& param);

void Bind(const SqliteStatementHandle& statement,
          const BoundParam<double>& param);

void Bind(const SqliteStatementHandle& statement,
          const BoundParam<sqlite3_int64>& param);

void StepStatement(const SqliteDatabaseHandle& db_handle,
                   const SqliteStatementHandle& statement,
                   std::string_view action);

sqlite3_int64 LastInsertRowId(const SqliteDatabaseHandle& db_handle);

std::string SerializeVector(const std::vector<std::string>& str_vec);

}  // namespace sqlite_export_service_internal

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_STATEMENT_HELPERS_H_
