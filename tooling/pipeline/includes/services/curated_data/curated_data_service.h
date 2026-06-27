#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_

/**
 * @file services/curated_data/curated_data_service.h
 * @brief Abstraction for loading curated location, persona, and name data.
 */

#include <filesystem>
#include <vector>

#include "data_model/models.h"
#include "data_model/names_by_country.h"

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
  virtual std::vector<Location> LoadLocations(
      const std::filesystem::path& filepath) = 0;

  /**
   * @brief Loads all curated persona records.
   */
  virtual std::vector<UserPersona> LoadPersonas(
      const std::filesystem::path& filepath) = 0;

  /**
   * @brief Loads the names-by-country fixture pair into a sampling-capable
   * NamesByCountry.
   *
   * @param forenames_filepath Path to forenames-by-country.json.
   * @param surnames_filepath Path to surnames-by-country.json.
   */
  virtual NamesByCountry LoadNamesByCountry(
      const std::filesystem::path& forenames_filepath,
      const std::filesystem::path& surnames_filepath) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_
