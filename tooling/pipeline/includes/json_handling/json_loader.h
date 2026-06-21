#ifndef BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_

/**
 * @file json_handling/json_loader.h
 * @brief Loader API for curated location data.
 */

#include <filesystem>
#include <memory>
#include <vector>

#include "data_model/models.h"
#include "data_model/names_by_country.h"
#include "services/logging/logger.h"

/// @brief Loads curated world locations from a JSON file into memory.
class JsonLoader {
 public:
  /// @brief Parses a JSON array file and returns all location records.
  static std::vector<Location> LoadLocations(
      const std::filesystem::path& filepath,
      std::shared_ptr<ILogger> logger = nullptr);

  /// @brief Parses a JSON array file and returns all persona records.
  static std::vector<UserPersona> LoadPersonas(
      const std::filesystem::path& filepath,
      std::shared_ptr<ILogger> logger = nullptr);

  /**
   * @brief Parses the names-by-country fixture pair into a sampling-capable
   * NamesByCountry.
   *
   * @param forenames_filepath Path to forenames-by-country.json.
   * @param surnames_filepath Path to surnames-by-country.json.
   */
  static NamesByCountry LoadNamesByCountry(
      const std::filesystem::path& forenames_filepath,
      const std::filesystem::path& surnames_filepath,
      std::shared_ptr<ILogger> logger = nullptr);
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
