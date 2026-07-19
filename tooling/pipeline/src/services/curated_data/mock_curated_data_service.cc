/**
 * @file services/curated_data/mock_curated_data_service.cc
 * @brief Fixed in-memory location, persona, and name dataset for mock mode.
 */

#include "services/curated_data/mock_curated_data_service.h"

MockCuratedDataService::MockCuratedDataService()
    : locations_{
          City{.city = "Portland",
               .state_province = "Oregon",
               .iso3166_2 = "US-OR",
               .country = "United States",
               .iso3166_1 = "US",
               .local_languages = {"en"},
               .postal_code =
                   PostalCodeSpec{.country_format_regex = R"(^\d{5}$)",
                                  .city_regexes = {R"(^972\d{2}$)"},
                                  .examples = {"97201", "97202", "97209"}}},
          City{.city = "Munich",
               .state_province = "Bavaria",
               .iso3166_2 = "DE-BY",
               .country = "Germany",
               .iso3166_1 = "DE",
               .local_languages = {"de"},
               .postal_code =
                   PostalCodeSpec{.country_format_regex = R"(^\d{5}$)",
                                  .city_regexes = {R"(^8\d{4}$)"},
                                  .examples = {"80331", "80333", "81667"}}},
          City{.city = "Lyon",
               .state_province = "Auvergne-Rhone-Alpes",
               .iso3166_2 = "FR-ARA",
               .country = "France",
               .iso3166_1 = "FR",
               .local_languages = {"fr"},
               .postal_code =
                   PostalCodeSpec{.country_format_regex = R"(^\d{5}$)",
                                  .city_regexes = {R"(^690\d{2}$)"},
                                  .examples = {"69001", "69002", "69007"}}},
          City{.city = "Brussels",
               .state_province = "Brussels-Capital",
               .iso3166_2 = "BE-BRU",
               .country = "Belgium",
               .iso3166_1 = "BE",
               .local_languages = {"nl", "fr"},
               .postal_code =
                   PostalCodeSpec{.country_format_regex = R"(^\d{4}$)",
                                  .city_regexes = {R"(^1\d{3}$)"},
                                  .examples = {"1000", "1050", "1180"}}},
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
           ForenameList{
               ForenameEntry{.name = "James", .gender = "M"},
               ForenameEntry{.name = "Mary", .gender = "F"},
           }},
          {"DE",
           ForenameList{
               ForenameEntry{.name = "Lukas", .gender = "M"},
               ForenameEntry{.name = "Anna", .gender = "F"},
           }},
          {"FR",
           ForenameList{
               ForenameEntry{.name = "Lucas", .gender = "M"},
               ForenameEntry{.name = "Camille", .gender = "F"},
           }},
          {"BE",
           ForenameList{
               ForenameEntry{.name = "Noah", .gender = "M"},
               ForenameEntry{.name = "Emma", .gender = "F"},
           }},
      },
      surnames_by_country_{
          {"US", SurnameList{"Smith", "Johnson"}},
          {"DE", SurnameList{"Muller", "Schmidt"}},
          {"FR", SurnameList{"Martin", "Bernard"}},
          {"BE", SurnameList{"Peeters", "Janssens"}},
      } {}

const LocationsList& MockCuratedDataService::LoadLocations() {
  return locations_;
}

const PersonasList& MockCuratedDataService::LoadPersonas() { return personas_; }

const ForenamesByCountryMap& MockCuratedDataService::LoadForenamesByCountry() {
  return forenames_by_country_;
}

const SurnamesByCountryMap& MockCuratedDataService::LoadSurnamesByCountry() {
  return surnames_by_country_;
}
