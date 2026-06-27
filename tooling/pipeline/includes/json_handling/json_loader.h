#ifndef BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_

/**
 * @file json_handling/json_loader.h
 * @brief JSON-backed implementation of ICuratedDataService.
 */

#include <filesystem>
#include <vector>

#include "data_model/models.h"
#include "data_model/names_by_country.h"
#include "services/curated_data/curated_data_service.h"

/**
 * @brief Loads curated location, persona, and name data from JSON files.
 */
class JsonLoader final : public ICuratedDataService {
 public:
  JsonLoader() = default;

  /**
   * @brief Parses a JSON array file and returns all location records.
   */
  std::vector<Location> LoadLocations(
      const std::filesystem::path& filepath) override;

  /**
   * @brief Parses a JSON array file and returns all persona records.
   */
  std::vector<UserPersona> LoadPersonas(
      const std::filesystem::path& filepath) override;

  /**
   * @brief Parses the names-by-country fixture pair into a sampling-capable
   * NamesByCountry.
   *
   * @param forenames_filepath Path to forenames-by-country.json.
   * @param surnames_filepath Path to surnames-by-country.json.
   */
  NamesByCountry LoadNamesByCountry(
      const std::filesystem::path& forenames_filepath,
      const std::filesystem::path& surnames_filepath) override;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
