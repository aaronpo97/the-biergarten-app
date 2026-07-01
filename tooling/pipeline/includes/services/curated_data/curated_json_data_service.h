#ifndef BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_

/**
 * @file json_handling/json_loader.h
 * @brief JSON-backed implementation of ICuratedDataService.
 */

#include <filesystem>

#include "data_model/models.h"
#include "services/curated_data/curated_data_service.h"

/**
 * @brief File locations for the curated JSON fixtures consumed by
 * CuratedJsonDataService.
 */
struct CuratedDataFilePaths {
  std::filesystem::path locations_path;
  std::filesystem::path personas_path;
  std::filesystem::path forenames_path;
  std::filesystem::path surnames_path;
};

/**
 * @brief Loads curated location, persona, and name data from JSON files.
 */
class CuratedJsonDataService final : public ICuratedDataService {
  struct cache {
    LocationsList locations;
    PersonasList personas;
    ForenamesByCountryMap forenames_by_country;
    SurnamesByCountryMap surnames_by_country;

    cache() = default;
    ~cache() = default;
  };

  CuratedDataFilePaths filepaths_;
  cache cache_;

 public:
  explicit CuratedJsonDataService(CuratedDataFilePaths filepaths);

  /**
   * @brief Parses a JSON array file and returns all location records.
   */
  const LocationsList& LoadLocations() override;

  /**
   * @brief Parses a JSON array file and returns all persona records.
   */
  const PersonasList& LoadPersonas() override;

  const ForenamesByCountryMap& LoadForenamesByCountry() override;

  /**
   * @brief Parses a JSON file and returns all the forenames per country.
   */
  const SurnamesByCountryMap& LoadSurnamesByCountry() override;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_JSON_LOADER_H_
