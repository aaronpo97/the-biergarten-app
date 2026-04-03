#ifndef BIERGARTEN_PIPELINE_DATABASE_DATABASE_H_
#define BIERGARTEN_PIPELINE_DATABASE_DATABASE_H_

#include <sqlite3.h>

#include <mutex>
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
   int country_id;
};

struct City {
   /// @brief City identifier from the source dataset.
   int id;
   /// @brief City display name.
   std::string name;
   /// @brief Parent country identifier.
   int country_id;
};

/// @brief Thread-safe SQLite wrapper for pipeline writes and readbacks.
class SqliteDatabase {
  private:
   sqlite3* db_ = nullptr;
   std::mutex db_mutex_;

   void InitializeSchema();

  public:
   /// @brief Closes the SQLite connection if initialized.
   ~SqliteDatabase();

   /// @brief Opens the SQLite database at db_path and creates schema objects.
   void Initialize(const std::string& db_path = ":memory:");

   /// @brief Starts a database transaction for batched writes.
   void BeginTransaction();

   /// @brief Commits the active database transaction.
   void CommitTransaction();

   /// @brief Inserts a country row.
   void InsertCountry(int id, const std::string& name, const std::string& iso2,
                      const std::string& iso3);

   /// @brief Inserts a state row linked to a country.
   void InsertState(int id, int country_id, const std::string& name,
                    const std::string& iso2);

   /// @brief Inserts a city row linked to state and country.
   void InsertCity(int id, int state_id, int country_id,
                   const std::string& name, double latitude, double longitude);

   /// @brief Returns city records including parent country id.
   std::vector<City> QueryCities();

   /// @brief Returns countries with optional row limit.
   std::vector<Country> QueryCountries(int limit = 0);

   /// @brief Returns states with optional row limit.
   std::vector<State> QueryStates(int limit = 0);
};

#endif  // BIERGARTEN_PIPELINE_DATABASE_DATABASE_H_
