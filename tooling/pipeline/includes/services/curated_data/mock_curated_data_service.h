#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_MOCK_CURATED_DATA_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_MOCK_CURATED_DATA_SERVICE_H_

/**
 * @file services/curated_data/mock_curated_data_service.h
 * @brief In-memory ICuratedDataService backed by a small fixed dataset, used
 * when file-backed curated data is disabled (mock mode).
 */

#include <filesystem>

#include "data_model/models.h"
#include "services/curated_data/curated_data_service.h"

/**
 * @brief Curated data service returning a small fixed in-memory dataset in
 * place of the JSON fixture files used by JsonLoader.
 */
class MockCuratedDataService final : public ICuratedDataService {
 public:
  MockCuratedDataService();

  const LocationsList& LoadLocations() override;

  const PersonasList& LoadPersonas() override;

  const ForenamesByCountryMap& LoadForenamesByCountry() override;

  const SurnamesByCountryMap& LoadSurnamesByCountry() override;

 private:
  LocationsList locations_;
  PersonasList personas_;
  ForenamesByCountryMap forenames_by_country_;
  SurnamesByCountryMap surnames_by_country_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_CURATED_DATA_MOCK_CURATED_DATA_SERVICE_H_
