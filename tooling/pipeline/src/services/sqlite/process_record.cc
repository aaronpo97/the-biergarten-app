/**
 * @file services/sqlite/process_record.cc
 * @brief SqliteExportService::ProcessRecord() implementation
 * and the shared city-resolution helper.
 */

#include <sstream>
#include <stdexcept>
#include <string>

#include "services/database/sqlite_export_service.h"
#include "services/database/sqlite_export_service_helpers.h"

std::string SqliteExportService::BuildCityKey(const City& city) {
  std::ostringstream key_stream;
  key_stream << city.city << '\n'
             << city.state_province << '\n'
             << city.iso3166_2 << '\n'
             << city.country << '\n'
             << city.iso3166_1 << '\n'
             << sqlite_export_service_internal::SerializeVector(
                    city.local_languages);
  return key_stream.str();
}

sqlite3_int64 SqliteExportService::ResolveCityId(const City& city) {
  const std::string city_key = BuildCityKey(city);
  const auto cached_city = city_cache_.find(city_key);
  if (cached_city != city_cache_.end()) {
    return cached_city->second;
  }

  const std::string local_languages_json =
      sqlite_export_service_internal::SerializeVector(city.local_languages);
  const std::string city_regex_json =
      sqlite_export_service_internal::SerializeVector(
          city.postal_code.city_regexes);

  sqlite_export_service_internal::Bind(
      insert_city_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kCityCityBindIndex,
          .value = city.city,
          .action = "Failed to bind SQLite city name"});
  sqlite_export_service_internal::Bind(
      insert_city_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kCityStateProvinceBindIndex,
          .value = city.state_province,
          .action = "Failed to bind SQLite city state/province"});
  sqlite_export_service_internal::Bind(
      insert_city_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kCityIso31662BindIndex,
          .value = city.iso3166_2,
          .action = "Failed to bind SQLite city ISO 3166-2 code"});
  sqlite_export_service_internal::Bind(
      insert_city_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kCityCountryBindIndex,
          .value = city.country,
          .action = "Failed to bind SQLite city country"});
  sqlite_export_service_internal::Bind(
      insert_city_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kCityIso31661BindIndex,
          .value = city.iso3166_1,
          .action = "Failed to bind SQLite city ISO 3166-1 code"});
  sqlite_export_service_internal::Bind(
      insert_city_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kCityLanguagesBindIndex,
          .value = local_languages_json,
          .action = "Failed to bind SQLite city languages"});
  sqlite_export_service_internal::Bind(
      insert_city_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::
              kCityPostalCodeCountryFormatRegexBindIndex,
          .value = city.postal_code.country_format_regex,
          .action = "Failed to bind SQLite city postal-code format regex"});
  sqlite_export_service_internal::Bind(
      insert_city_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::
              kCityPostalCodeCityRegexJsonBindIndex,
          .value = city_regex_json,
          .action = "Failed to bind SQLite city postal-code city regexes"});

  sqlite_export_service_internal::StepStatement(
      db_handle_, insert_city_stmt_, "Failed to insert SQLite city row");

  const sqlite3_int64 city_id =
      sqlite_export_service_internal::LastInsertRowId(db_handle_);
  city_cache_.emplace(city_key, city_id);
  sqlite_export_service_internal::ResetStatement(insert_city_stmt_);

  return city_id;
}

uint64_t SqliteExportService::ProcessRecord(const BreweryRecord& brewery) {
  if (db_handle_ == nullptr || !transaction_open_) {
    throw std::runtime_error("SQLite export service is not initialized");
  }

  const sqlite3_int64 city_id = ResolveCityId(brewery.address.city);

  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kBreweryEnglishNameBindIndex,
          .value = brewery.brewery.name_en,
          .action = "Failed to bind SQLite brewery English name"});

  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::
              kBreweryEnglishDescriptionBindIndex,
          .value = brewery.brewery.description_en,
          .action = "Failed to bind SQLite brewery English description"});

  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kBreweryLocalNameBindIndex,
          .value = brewery.brewery.name_local,
          .action = "Failed to bind SQLite brewery local name"});

  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index =
              sqlite_export_service_internal::kBreweryLocalDescriptionBindIndex,
          .value = brewery.brewery.description_local,
          .action = "Failed to bind SQLite brewery local description"});

  sqlite_export_service_internal::StepStatement(
      db_handle_, insert_brewery_stmt_, "Failed to insert SQLite brewery row");

  const sqlite3_int64 brewery_id =
      sqlite_export_service_internal::LastInsertRowId(db_handle_);

  sqlite_export_service_internal::ResetStatement(insert_brewery_stmt_);

  sqlite_export_service_internal::Bind(
      insert_brewery_address_stmt_,
      sqlite_export_service_internal::BoundParam<sqlite3_int64>{
          .index =
              sqlite_export_service_internal::kBreweryAddressBreweryIdBindIndex,
          .value = brewery_id,
          .action = "Failed to bind SQLite brewery address brewery id"});
  sqlite_export_service_internal::Bind(
      insert_brewery_address_stmt_,
      sqlite_export_service_internal::BoundParam<sqlite3_int64>{
          .index =
              sqlite_export_service_internal::kBreweryAddressCityIdBindIndex,
          .value = city_id,
          .action = "Failed to bind SQLite brewery address city id"});
  sqlite_export_service_internal::Bind(
      insert_brewery_address_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::
              kBreweryAddressPostalCodeBindIndex,
          .value = brewery.address.postal_code,
          .action = "Failed to bind SQLite brewery address postal code"});

  sqlite_export_service_internal::StepStatement(
      db_handle_, insert_brewery_address_stmt_,
      "Failed to insert SQLite brewery address row");

  sqlite_export_service_internal::ResetStatement(insert_brewery_address_stmt_);

  return static_cast<uint64_t>(brewery_id);
}
