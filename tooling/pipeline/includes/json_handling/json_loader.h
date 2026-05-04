#ifndef BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_

/**
 * @file json_handling/json_loader.h
 * @brief Loader API for curated location data.
 */

#include <filesystem>
#include <vector>

#include "data_model/models.h"

/// @brief Loads curated world locations from a JSON file into memory.
class JsonLoader {
 public:
  /// @brief Parses a JSON array file and returns all location records.
  static std::vector<Location> LoadLocations(
      const std::filesystem::path& filepath);
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
