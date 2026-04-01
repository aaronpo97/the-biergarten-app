#pragma once

#include <mutex>
#include <sqlite3.h>
#include <string>
#include <vector>

struct Country {
  /// @brief Country identifier from the source dataset.
  int id;
  /// @brief Country display name.
  std::string name;
  /// @brief ISO 3166-1 alpha-2 code.
  std::string iso2;
  /// @brief ISO 3166-1 alpha-3 code.
  std::string iso3;
};

struct State {
  /// @brief State or province identifier from the source dataset.
  int id;
  /// @brief State or province display name.
  std::string name;
  /// @brief State or province short code.
  std::string iso2;
  /// @brief Parent country identifier.
  int countryId;
};

/// @brief Thread-safe SQLite wrapper for pipeline writes and readbacks.
class SqliteDatabase {
private:
  sqlite3 *db = nullptr;
  std::mutex dbMutex;

  void InitializeSchema();

public:
  /// @brief Closes the SQLite connection if initialized.
  ~SqliteDatabase();

  /// @brief Opens the in-memory database and creates schema objects.
  void Initialize();

  /// @brief Inserts a country row.
  void InsertCountry(int id, const std::string &name, const std::string &iso2,
                     const std::string &iso3);

  /// @brief Inserts a state row linked to a country.
  void InsertState(int id, int countryId, const std::string &name,
                   const std::string &iso2);

  /// @brief Inserts a city row linked to state and country.
  void InsertCity(int id, int stateId, int countryId, const std::string &name,
                  double latitude, double longitude);

  /// @brief Returns city id and city name pairs.
  std::vector<std::pair<int, std::string>> QueryCities();

  /// @brief Returns countries with optional row limit.
  std::vector<Country> QueryCountries(int limit = 0);

  /// @brief Returns states with optional row limit.
  std::vector<State> QueryStates(int limit = 0);
};
