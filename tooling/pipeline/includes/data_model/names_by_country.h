#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_NAMES_BY_COUNTRY_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_NAMES_BY_COUNTRY_H_

/**
 * @file data_model/names_by_country.h
 * @brief Sampling over the names-by-country fixture data.
 */

#include <optional>
#include <random>
#include <string>
#include <unordered_map>
#include <vector>

#include "data_model/models.h"

/**
 * @brief Samples locale-appropriate names from curated forename/surname
 * fixture data, keyed by ISO 3166-1 country code.
 *
 * Forenames and surnames are kept in separate maps (mirroring the source
 * dataset's own shape) so per-forename gender is preserved; pairing happens
 * at sample time rather than being precomputed, so no information from the
 * source dataset is discarded up front.
 */
class NamesByCountry {
 public:
  NamesByCountry(
      std::unordered_map<std::string, std::vector<ForenameEntry>>
          forenames_by_country,
      std::unordered_map<std::string, std::vector<std::string>>
          surnames_by_country);

  /**
   * @brief Samples a first/last name pair for the given country.
   *
   * @param iso3166_1 ISO 3166-1 country code to sample for.
   * @param rng Random source used for sampling.
   * @return A sampled Name, or std::nullopt if the country has no forename
   * or no surname entries.
   */
  [[nodiscard]] std::optional<Name> SampleName(const std::string& iso3166_1,
                                               std::mt19937& rng) const;

 private:
  std::unordered_map<std::string, std::vector<ForenameEntry>>
      forenames_by_country_;
  std::unordered_map<std::string, std::vector<std::string>>
      surnames_by_country_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_NAMES_BY_COUNTRY_H_
