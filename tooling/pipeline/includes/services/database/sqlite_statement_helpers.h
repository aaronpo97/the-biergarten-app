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

inline constexpr std::string_view kCreateCitiesTableSql = R"sql(

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  iso3166_2 TEXT NOT NULL,
  country TEXT NOT NULL,
  iso3166_1 TEXT NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  local_languages_json TEXT NOT NULL,
  postal_code_country_format_regex TEXT NOT NULL,
  postal_code_city_regex_json TEXT NOT NULL,
  UNIQUE(city, state_province, iso3166_2, country)
);

)sql";

inline constexpr std::string_view kCreateBreweriesTableSql = R"sql(

CREATE TABLE IF NOT EXISTS breweries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  description_en TEXT NOT NULL,
  name_local TEXT NOT NULL,
  description_local TEXT NOT NULL
);

)sql";

inline constexpr std::string_view kCreateBreweryAddressesTableSql = R"sql(

CREATE TABLE IF NOT EXISTS brewery_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brewery_id INTEGER NOT NULL,
  city_id INTEGER NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  FOREIGN KEY(brewery_id) REFERENCES breweries(id) ON DELETE CASCADE,
  FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_brewery_addresses_brewery_id
  ON brewery_addresses(brewery_id);
CREATE INDEX IF NOT EXISTS idx_brewery_addresses_city_id
  ON brewery_addresses(city_id);

)sql";

inline constexpr std::string_view kCreateUsersTableSql = R"sql(

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  username TEXT NOT NULL,
  bio TEXT NOT NULL,
  activity_weight REAL NOT NULL,
  email TEXT NOT NULL UNIQUE,
  date_of_birth TEXT NOT NULL
);

)sql";

inline constexpr std::string_view kCreateUserAddressesTableSql = R"sql(

CREATE TABLE IF NOT EXISTS user_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  city_id INTEGER NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id
  ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_city_id
  ON user_addresses(city_id);

)sql";

inline constexpr std::string_view kInsertCitySql = R"sql(
INSERT INTO cities (
  city,
  state_province,
  iso3166_2,
  country,
  iso3166_1,
  longitude,
  latitude,
  local_languages_json,
  postal_code_country_format_regex,
  postal_code_city_regex_json
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
)sql";

inline constexpr std::string_view kInsertBrewerySql = R"sql(
INSERT INTO breweries (
  name_en,
  description_en,
  name_local,
  description_local
) VALUES (?, ?, ?, ?);
)sql";

inline constexpr std::string_view kInsertBreweryAddressSql = R"sql(
INSERT INTO brewery_addresses (
  brewery_id,
  city_id,
  longitude,
  latitude
) VALUES (?, ?, ?, ?);
)sql";

inline constexpr std::string_view kInsertUserSql = R"sql(
INSERT INTO users (
  first_name,
  last_name,
  gender,
  username,
  bio,
  activity_weight,
  email,
  date_of_birth
) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
)sql";

inline constexpr std::string_view kInsertUserAddressSql = R"sql(
INSERT INTO user_addresses (
  user_id,
  city_id,
  longitude,
  latitude
) VALUES (?, ?, ?, ?);
)sql";

// sqlite3_bind_*() parameter indices are 1-based, matching the "?"
// placeholder order in the SQL above.
enum CityBindIndex {
   kCityCityBindIndex = 1,
   kCityStateProvinceBindIndex,
   kCityIso31662BindIndex,
   kCityCountryBindIndex,
   kCityIso31661BindIndex,
   kCityLongitudeBindIndex,
   kCityLatitudeBindIndex,
   kCityLanguagesBindIndex,
   kCityPostalCodeCountryFormatRegexBindIndex,
   kCityPostalCodeCityRegexJsonBindIndex,
};

enum BreweryBindIndex {
   kBreweryEnglishNameBindIndex = 1,
   kBreweryEnglishDescriptionBindIndex,
   kBreweryLocalNameBindIndex,
   kBreweryLocalDescriptionBindIndex,
};

enum BreweryAddressBindIndex {
   kBreweryAddressBreweryIdBindIndex = 1,
   kBreweryAddressCityIdBindIndex,
   kBreweryAddressLongitudeBindIndex,
   kBreweryAddressLatitudeBindIndex,
};

enum UserBindIndex {
   kUserFirstNameBindIndex = 1,
   kUserLastNameBindIndex,
   kUserGenderBindIndex,
   kUserUsernameBindIndex,
   kUserBioBindIndex,
   kUserActivityWeightBindIndex,
   kUserEmailBindIndex,
   kUserDateOfBirthBindIndex,
};

enum UserAddressBindIndex {
   kUserAddressUserIdBindIndex = 1,
   kUserAddressCityIdBindIndex,
   kUserAddressLongitudeBindIndex,
   kUserAddressLatitudeBindIndex,
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
