#ifndef BIERGARTEN_PIPELINE_JSON_HANDLING_JSON_LOADER_H_
#define BIERGARTEN_PIPELINE_JSON_HANDLING_JSON_LOADER_H_

#include <string>

#include "database/database.h"
#include "json_handling/stream_parser.h"

/// @brief Loads world-city JSON data into SQLite through streaming parsing.
class JsonLoader {
  public:
   /// @brief Parses a JSON file and writes country/state/city rows into db.
   static void LoadWorldCities(const std::string& json_path,
                               SqliteDatabase& db);
};

#endif  // BIERGARTEN_PIPELINE_JSON_HANDLING_JSON_LOADER_H_
