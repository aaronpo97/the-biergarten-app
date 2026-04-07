#ifndef BIERGARTEN_PIPELINE_JSON_HANDLING_JSON_LOADER_H_
#define BIERGARTEN_PIPELINE_JSON_HANDLING_JSON_LOADER_H_

#include <string>
#include <vector>

#include "models/location.h"

/// @brief Loads curated world locations from a JSON file into memory.
class JsonLoader {
  public:
   /// @brief Parses a JSON array file and returns all location records.
   static std::vector<Location> LoadLocations(const std::string& filepath);
};

#endif  // BIERGARTEN_PIPELINE_JSON_HANDLING_JSON_LOADER_H_
