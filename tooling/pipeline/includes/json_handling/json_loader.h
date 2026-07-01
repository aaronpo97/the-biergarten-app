#ifndef BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_

/**
 * @file json_handling/json_loader.h
 * @brief JSON-backed implementation of ICuratedDataService.
 */

#include <filesystem>
#include <unordered_set>
#include <vector>

#include "data_model/models.h"
#include "services/curated_data/curated_data_service.h"

/**
 * @brief Loads curated location, persona, and name data from JSON files.
 */
class JsonLoader final : public ICuratedDataService {
  struct cache {
    std::vector<Location> locations;
    std::vector<UserPersona> personas;
    std::unordered_map<std::string, forename_list> forenames_by_country;
    std::unordered_map<std::string, surname_list> surnames_by_country;

    cache() = default;
    ~cache() = default;
  };

  cache cache_;

 public:
  JsonLoader() = default;

  /**
   * @brief Parses a JSON array file and returns all location records.
   */
  const std::vector<Location>& LoadLocations(
      const std::filesystem::path&) override;

  /**
   * @brief Parses a JSON array file and returns all persona records.
   */
  const std::vector<UserPersona>& LoadPersonas(
      const std::filesystem::path&) override;

  const std::unordered_map<std::string, forename_list>&
  LoadForenamesByCountry(const std::filesystem::path&) override;

  /**
   * @brief Parses a JSON file and returns all the forenames per country.
   */
  const std::unordered_map<std::string, surname_list>&
  LoadSurnamesByCountry(const std::filesystem::path&) override;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
