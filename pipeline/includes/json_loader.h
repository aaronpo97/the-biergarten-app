#pragma once

#include "database.h"
#include "stream_parser.h"
#include <string>

/// @brief Loads world-city JSON data into SQLite through streaming parsing.
class JsonLoader {
public:
  /// @brief Parses a JSON file and writes country/state/city rows into db.
  static void LoadWorldCities(const std::string &jsonPath, SqliteDatabase &db);
};
