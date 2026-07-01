/**
 * @file services/curated_data/mock_curated_data_service.cc
 * @brief Fixed in-memory location, persona, and name dataset for mock mode.
 */

#include "services/curated_data/mock_curated_data_service.h"

MockCuratedDataService::MockCuratedDataService()
    : locations_{
          Location{.city = "Portland",
                   .state_province = "Oregon",
                   .iso3166_2 = "US-OR",
                   .country = "United States",
                   .iso3166_1 = "US",
                   .local_languages = {"en"},
                   .latitude = 45.5152,
                   .longitude = -122.6784},
          Location{.city = "Munich",
                   .state_province = "Bavaria",
                   .iso3166_2 = "DE-BY",
                   .country = "Germany",
                   .iso3166_1 = "DE",
                   .local_languages = {"de"},
                   .latitude = 48.1351,
                   .longitude = 11.5820},
          Location{.city = "Lyon",
                   .state_province = "Auvergne-Rhone-Alpes",
                   .iso3166_2 = "FR-ARA",
                   .country = "France",
                   .iso3166_1 = "FR",
                   .local_languages = {"fr"},
                   .latitude = 45.7640,
                   .longitude = 4.8357},
          Location{.city = "Brussels",
                   .state_province = "Brussels-Capital",
                   .iso3166_2 = "BE-BRU",
                   .country = "Belgium",
                   .iso3166_1 = "BE",
                   .local_languages = {"nl", "fr"},
                   .latitude = 50.8503,
                   .longitude = 4.3517},
      },
      personas_{
          UserPersona{.name = "Hophead Explorer",
                      .description = "Chases hop-forward IPAs and seeks out "
                                     "taprooms with rotating drafts.",
                      .style_affinities = {"IPA", "Pale Ale"}},
          UserPersona{.name = "Lager Traditionalist",
                      .description = "Prefers clean, balanced lagers and "
                                     "classic pub styles.",
                      .style_affinities = {"Lager", "Pilsner"}},
          UserPersona{.name = "Sour Curious",
                      .description = "Seeks out wild ales, sours, and "
                                     "barrel-aged experiments.",
                      .style_affinities = {"Sour", "Wild Ale"}},
      },
      forenames_by_country_{
          {"US",
           forename_list{
               ForenameEntry{.name = "James", .gender = "M"},
               ForenameEntry{.name = "Mary", .gender = "F"},
           }},
          {"DE",
           forename_list{
               ForenameEntry{.name = "Lukas", .gender = "M"},
               ForenameEntry{.name = "Anna", .gender = "F"},
           }},
          {"FR",
           forename_list{
               ForenameEntry{.name = "Lucas", .gender = "M"},
               ForenameEntry{.name = "Camille", .gender = "F"},
           }},
          {"BE",
           forename_list{
               ForenameEntry{.name = "Noah", .gender = "M"},
               ForenameEntry{.name = "Emma", .gender = "F"},
           }},
      },
      surnames_by_country_{
          {"US", surname_list{"Smith", "Johnson"}},
          {"DE", surname_list{"Muller", "Schmidt"}},
          {"FR", surname_list{"Martin", "Bernard"}},
          {"BE", surname_list{"Peeters", "Janssens"}},
      } {}

const std::vector<Location>& MockCuratedDataService::LoadLocations(
    const std::filesystem::path& /*filepath*/) {
  return locations_;
}

const std::vector<UserPersona>& MockCuratedDataService::LoadPersonas(
    const std::filesystem::path& /*filepath*/) {
  return personas_;
}

const std::unordered_map<std::string, forename_list>&
MockCuratedDataService::LoadForenamesByCountry(
    const std::filesystem::path& /*forenames_filepath*/) {
  return forenames_by_country_;
}

const std::unordered_map<std::string, surname_list>&
MockCuratedDataService::LoadSurnamesByCountry(
    const std::filesystem::path& /*surnames_filepath*/) {
  return surnames_by_country_;
}
