#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_MOCK_CURATED_DATA_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_MOCK_CURATED_DATA_SERVICE_H_

/**
 * @file services/curated_data/mock_curated_data_service.h
 * @brief In-memory ICuratedDataService backed by a small fixed dataset, used
 * when file-backed curated data is disabled (mock mode).
 */

#include <filesystem>
#include <unordered_map>
#include <vector>

#include "data_model/models.h"
#include "services/curated_data/curated_data_service.h"

/**
 * @brief Curated data service returning a small fixed in-memory dataset in
 * place of the JSON fixture files used by JsonLoader.
 */
class MockCuratedDataService final : public ICuratedDataService {
 public:
  MockCuratedDataService();

  const std::vector<Location>& LoadLocations() override;

  const std::vector<UserPersona>& LoadPersonas() override;

  const std::unordered_map<std::string, forename_list>&
  LoadForenamesByCountry() override;

  const std::unordered_map<std::string, surname_list>&
  LoadSurnamesByCountry() override;

 private:
  std::vector<Location> locations_;
  std::vector<UserPersona> personas_;
  std::unordered_map<std::string, forename_list> forenames_by_country_;
  std::unordered_map<std::string, surname_list> surnames_by_country_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_MOCK_CURATED_DATA_SERVICE_H_
