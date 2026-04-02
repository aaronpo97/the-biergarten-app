#include "database/database.h"
#include <spdlog/spdlog.h>
#include <stdexcept>

void SqliteDatabase::InitializeSchema() {
  std::lock_guard<std::mutex> lock(db_mutex_);

  const char *schema = R"(
    CREATE TABLE IF NOT EXISTS countries (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      iso2 TEXT,
      iso3 TEXT
    );

    CREATE TABLE IF NOT EXISTS states (
      id INTEGER PRIMARY KEY,
      country_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      iso2 TEXT,
      FOREIGN KEY(country_id) REFERENCES countries(id)
    );

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY,
      state_id INTEGER NOT NULL,
      country_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      FOREIGN KEY(state_id) REFERENCES states(id),
      FOREIGN KEY(country_id) REFERENCES countries(id)
    );
  )";

  char *errMsg = nullptr;
  int rc = sqlite3_exec(db_, schema, nullptr, nullptr, &errMsg);
  if (rc != SQLITE_OK) {
    std::string error = errMsg ? std::string(errMsg) : "Unknown error";
    sqlite3_free(errMsg);
    throw std::runtime_error("Failed to create schema: " + error);
  }
}

SqliteDatabase::~SqliteDatabase() {
  if (db_) {
    sqlite3_close(db_);
  }
}

void SqliteDatabase::Initialize(const std::string &db_path) {
  int rc = sqlite3_open(db_path.c_str(), &db_);
  if (rc) {
    throw std::runtime_error("Failed to open SQLite database: " + db_path);
  }
  spdlog::info("OK: SQLite database opened: {}", db_path);
  InitializeSchema();
}

void SqliteDatabase::BeginTransaction() {
  std::lock_guard<std::mutex> lock(db_mutex_);
  char *err = nullptr;
  if (sqlite3_exec(db_, "BEGIN TRANSACTION", nullptr, nullptr, &err) !=
      SQLITE_OK) {
    std::string msg = err ? err : "unknown";
    sqlite3_free(err);
    throw std::runtime_error("BeginTransaction failed: " + msg);
  }
}

void SqliteDatabase::CommitTransaction() {
  std::lock_guard<std::mutex> lock(db_mutex_);
  char *err = nullptr;
  if (sqlite3_exec(db_, "COMMIT", nullptr, nullptr, &err) != SQLITE_OK) {
    std::string msg = err ? err : "unknown";
    sqlite3_free(err);
    throw std::runtime_error("CommitTransaction failed: " + msg);
  }
}

void SqliteDatabase::InsertCountry(int id, const std::string &name,
                                   const std::string &iso2,
                                   const std::string &iso3) {
  std::lock_guard<std::mutex> lock(db_mutex_);

  const char *query = R"(
    INSERT OR IGNORE INTO countries (id, name, iso2, iso3)
    VALUES (?, ?, ?, ?)
  )";

  sqlite3_stmt *stmt;
  int rc = sqlite3_prepare_v2(db_, query, -1, &stmt, nullptr);
  if (rc != SQLITE_OK)
    throw std::runtime_error("Failed to prepare country insert");

  sqlite3_bind_int(stmt, 1, id);
  sqlite3_bind_text(stmt, 2, name.c_str(), -1, SQLITE_STATIC);
  sqlite3_bind_text(stmt, 3, iso2.c_str(), -1, SQLITE_STATIC);
  sqlite3_bind_text(stmt, 4, iso3.c_str(), -1, SQLITE_STATIC);

  if (sqlite3_step(stmt) != SQLITE_DONE) {
    throw std::runtime_error("Failed to insert country");
  }
  sqlite3_finalize(stmt);
}

void SqliteDatabase::InsertState(int id, int country_id, const std::string &name,
                                 const std::string &iso2) {
  std::lock_guard<std::mutex> lock(db_mutex_);

  const char *query = R"(
    INSERT OR IGNORE INTO states (id, country_id, name, iso2)
    VALUES (?, ?, ?, ?)
  )";

  sqlite3_stmt *stmt;
  int rc = sqlite3_prepare_v2(db_, query, -1, &stmt, nullptr);
  if (rc != SQLITE_OK)
    throw std::runtime_error("Failed to prepare state insert");

  sqlite3_bind_int(stmt, 1, id);
  sqlite3_bind_int(stmt, 2, country_id);
  sqlite3_bind_text(stmt, 3, name.c_str(), -1, SQLITE_STATIC);
  sqlite3_bind_text(stmt, 4, iso2.c_str(), -1, SQLITE_STATIC);

  if (sqlite3_step(stmt) != SQLITE_DONE) {
    throw std::runtime_error("Failed to insert state");
  }
  sqlite3_finalize(stmt);
}

void SqliteDatabase::InsertCity(int id, int state_id, int country_id,
                                const std::string &name, double latitude,
                                double longitude) {
  std::lock_guard<std::mutex> lock(db_mutex_);

  const char *query = R"(
    INSERT OR IGNORE INTO cities (id, state_id, country_id, name, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?)
  )";

  sqlite3_stmt *stmt;
  int rc = sqlite3_prepare_v2(db_, query, -1, &stmt, nullptr);
  if (rc != SQLITE_OK)
    throw std::runtime_error("Failed to prepare city insert");

  sqlite3_bind_int(stmt, 1, id);
  sqlite3_bind_int(stmt, 2, state_id);
  sqlite3_bind_int(stmt, 3, country_id);
  sqlite3_bind_text(stmt, 4, name.c_str(), -1, SQLITE_STATIC);
  sqlite3_bind_double(stmt, 5, latitude);
  sqlite3_bind_double(stmt, 6, longitude);

  if (sqlite3_step(stmt) != SQLITE_DONE) {
    throw std::runtime_error("Failed to insert city");
  }
  sqlite3_finalize(stmt);
}

std::vector<City> SqliteDatabase::QueryCities() {
  std::lock_guard<std::mutex> lock(db_mutex_);
  std::vector<City> cities;
  sqlite3_stmt *stmt = nullptr;

  const char *query = "SELECT id, name, country_id FROM cities ORDER BY name";
  int rc = sqlite3_prepare_v2(db_, query, -1, &stmt, nullptr);

  if (rc != SQLITE_OK) {
    throw std::runtime_error("Failed to prepare query");
  }

  while (sqlite3_step(stmt) == SQLITE_ROW) {
    int id = sqlite3_column_int(stmt, 0);
    const char *name =
        reinterpret_cast<const char *>(sqlite3_column_text(stmt, 1));
    int country_id = sqlite3_column_int(stmt, 2);
    cities.push_back({id, name ? std::string(name) : "", country_id});
  }

  sqlite3_finalize(stmt);
  return cities;
}

std::vector<Country> SqliteDatabase::QueryCountries(int limit) {
  std::lock_guard<std::mutex> lock(db_mutex_);

  std::vector<Country> countries;
  sqlite3_stmt *stmt = nullptr;

  std::string query =
      "SELECT id, name, iso2, iso3 FROM countries ORDER BY name";
  if (limit > 0) {
    query += " LIMIT " + std::to_string(limit);
  }

  int rc = sqlite3_prepare_v2(db_, query.c_str(), -1, &stmt, nullptr);

  if (rc != SQLITE_OK) {
    throw std::runtime_error("Failed to prepare countries query");
  }

  while (sqlite3_step(stmt) == SQLITE_ROW) {
    int id = sqlite3_column_int(stmt, 0);
    const char *name =
        reinterpret_cast<const char *>(sqlite3_column_text(stmt, 1));
    const char *iso2 =
        reinterpret_cast<const char *>(sqlite3_column_text(stmt, 2));
    const char *iso3 =
        reinterpret_cast<const char *>(sqlite3_column_text(stmt, 3));
    countries.push_back({id, name ? std::string(name) : "",
                         iso2 ? std::string(iso2) : "",
                         iso3 ? std::string(iso3) : ""});
  }

  sqlite3_finalize(stmt);
  return countries;
}

std::vector<State> SqliteDatabase::QueryStates(int limit) {
  std::lock_guard<std::mutex> lock(db_mutex_);

  std::vector<State> states;
  sqlite3_stmt *stmt = nullptr;

  std::string query =
      "SELECT id, name, iso2, country_id FROM states ORDER BY name";
  if (limit > 0) {
    query += " LIMIT " + std::to_string(limit);
  }

  int rc = sqlite3_prepare_v2(db_, query.c_str(), -1, &stmt, nullptr);

  if (rc != SQLITE_OK) {
    throw std::runtime_error("Failed to prepare states query");
  }

  while (sqlite3_step(stmt) == SQLITE_ROW) {
    int id = sqlite3_column_int(stmt, 0);
    const char *name =
        reinterpret_cast<const char *>(sqlite3_column_text(stmt, 1));
    const char *iso2 =
        reinterpret_cast<const char *>(sqlite3_column_text(stmt, 2));
    int country_id = sqlite3_column_int(stmt, 3);
    states.push_back({id, name ? std::string(name) : "",
                      iso2 ? std::string(iso2) : "", country_id});
  }

  sqlite3_finalize(stmt);
  return states;
}
