#pragma once

#include "database.h"
#include <functional>
#include <string>

// Forward declaration to avoid circular dependency
class SqliteDatabase;

/// @brief In-memory representation of one parsed city entry.
struct CityRecord {
  int id;
  int state_id;
  int country_id;
  std::string name;
  double latitude;
  double longitude;
};

/// @brief Streaming SAX parser that emits city records during traversal.
class StreamingJsonParser {
public:
  /// @brief Parses filePath and invokes callbacks for city rows and progress.
  static void Parse(const std::string &filePath, SqliteDatabase &db,
                    std::function<void(const CityRecord &)> onCity,
                    std::function<void(size_t, size_t)> onProgress = nullptr);

private:
  /// @brief Mutable SAX handler state while traversing nested JSON arrays.
  struct ParseState {
    int current_country_id = 0;
    int current_state_id = 0;

    CityRecord current_city = {};
    bool building_city = false;
    std::string current_key;

    int array_depth = 0;
    int object_depth = 0;
    bool in_countries_array = false;
    bool in_states_array = false;
    bool in_cities_array = false;

    std::function<void(const CityRecord &)> on_city;
    std::function<void(size_t, size_t)> on_progress;
    size_t bytes_processed = 0;
  };
};
