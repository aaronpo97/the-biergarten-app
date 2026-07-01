#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_

/**
 * @file services/curated_data/curated_data_service.h
 * @brief Abstraction for loading curated location, persona, and name data.
 */

#include <filesystem>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "data_model/models.h"

using ForenameList = std::vector<ForenameEntry>;
using SurnameList = std::vector<std::string>;
using LocationsList = std::vector<Location>;
using PersonasList = std::vector<UserPersona>;
using ForenamesByCountryMap = std::unordered_map<std::string, ForenameList>;
using SurnamesByCountryMap = std::unordered_map<std::string, SurnameList>;

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
  virtual const LocationsList& LoadLocations() = 0;

  /**
   * @brief Loads all curated persona records.
   */
  virtual const PersonasList& LoadPersonas() = 0;
  virtual const ForenamesByCountryMap& LoadForenamesByCountry() = 0;
  virtual const SurnamesByCountryMap& LoadSurnamesByCountry() = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_CURATED_DATA_SERVICE_H_
