#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_

/**
 * @file services/curated_data/curated_data_service.h
 * @brief Abstraction for loading curated location, persona, and name data.
 */

#include <filesystem>
#include <unordered_set>
#include <vector>

#include "data_model/models.h"

using forename_list = std::unordered_set<ForenameEntry>;
using surname_list = std::unordered_set<std::string>;
/**
 * @brief Interface for services that load curated data used to seed
 * brewery/user generation.
 */
class ICuratedDataService {
 public:
  ICuratedDataService() = default;
  virtual ~ICuratedDataService() = default;

  ICuratedDataService(const ICuratedDataService&) = delete;
  ICuratedDataService& operator=(const ICuratedDataService&) = delete;
  ICuratedDataService(ICuratedDataService&&) = delete;
  ICuratedDataService& operator=(ICuratedDataService&&) = delete;

  /**
   * @brief Loads all curated location records.
   */
  virtual const std::vector<Location>& LoadLocations(
      const std::filesystem::path& filepath) = 0;

  /**
   * @brief Loads all curated persona records.
   */
  virtual const std::vector<UserPersona>& LoadPersonas(
      const std::filesystem::path& filepath) = 0;

  virtual const std::unordered_map<std::string, forename_list>&
  LoadForenamesByCountry(const std::filesystem::path& forenames_filepath) = 0;
  virtual const std::unordered_map<std::string, surname_list>&
  LoadSurnamesByCountry(const std::filesystem::path& surnames_filepath) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_