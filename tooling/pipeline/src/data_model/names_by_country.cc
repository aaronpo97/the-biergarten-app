/**
 * @file data_model/names_by_country.cc
 * @brief NamesByCountry::SampleName() implementation.
 */

#include "data_model/names_by_country.h"

#include <utility>

NamesByCountry::NamesByCountry(
    std::unordered_map<std::string, std::vector<ForenameEntry>>
        forenames_by_country,
    std::unordered_map<std::string, std::vector<std::string>>
        surnames_by_country)
    : forenames_by_country_(std::move(forenames_by_country)),
      surnames_by_country_(std::move(surnames_by_country)) {}

std::optional<Name> NamesByCountry::SampleName(const std::string& iso3166_1,
                                               std::mt19937& rng) const {
  const auto forenames_it = forenames_by_country_.find(iso3166_1);
  const auto surnames_it = surnames_by_country_.find(iso3166_1);

  if (forenames_it == forenames_by_country_.end() ||
      surnames_it == surnames_by_country_.end() ||
      forenames_it->second.empty() || surnames_it->second.empty()) {
    return std::nullopt;
  }

  const std::vector<ForenameEntry>& forenames = forenames_it->second;
  const std::vector<std::string>& surnames = surnames_it->second;

  std::uniform_int_distribution<size_t> forename_dist(0,
                                                       forenames.size() - 1);
  std::uniform_int_distribution<size_t> surname_dist(0, surnames.size() - 1);

  const ForenameEntry& forename = forenames[forename_dist(rng)];

  return Name{.first_name = forename.name,
              .last_name = surnames[surname_dist(rng)],
              .gender = forename.gender};
}
