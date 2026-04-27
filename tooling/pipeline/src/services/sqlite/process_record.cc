/**
 * @file services/sqlite/process_record.cc
 * @brief SqliteExportService::ProcessRecord() implementation.
 */

#include <stdexcept>
#include <string>

#include "services/sqlite_export_service.h"
#include "services/sqlite_export_service_helpers.h"

void SqliteExportService::ProcessRecord(const GeneratedBrewery& brewery) {
  if (db_handle_ == nullptr || !transaction_open_) {
    throw std::runtime_error("SQLite export service is not initialized");
  }

  const std::string location_key = BuildLocationKey(brewery.location);
  const auto cached_location = location_cache_.find(location_key);
  sqlite3_int64 location_id = 0;

  if (cached_location != location_cache_.end()) {
    location_id = cached_location->second;
  } else {
    const std::string local_languages_json =
        sqlite_export_service_internal::SerializeLocalLanguages(
            brewery.location.local_languages);

    sqlite_export_service_internal::BindText(
        insert_location_stmt_,
        sqlite_export_service_internal::kLocationCityBindIndex,
        brewery.location.city, "Failed to bind SQLite location city");
    sqlite_export_service_internal::BindText(
        insert_location_stmt_,
        sqlite_export_service_internal::kLocationStateProvinceBindIndex,
        brewery.location.state_province,
        "Failed to bind SQLite location state/province");
    sqlite_export_service_internal::BindText(
        insert_location_stmt_,
        sqlite_export_service_internal::kLocationIso31662BindIndex,
        brewery.location.iso3166_2,
        "Failed to bind SQLite location ISO 3166-2 code");
    sqlite_export_service_internal::BindText(
        insert_location_stmt_,
        sqlite_export_service_internal::kLocationCountryBindIndex,
        brewery.location.country, "Failed to bind SQLite location country");
    sqlite_export_service_internal::BindText(
        insert_location_stmt_,
        sqlite_export_service_internal::kLocationIso31661BindIndex,
        brewery.location.iso3166_1,
        "Failed to bind SQLite location ISO 3166-1 code");
    sqlite_export_service_internal::BindText(
        insert_location_stmt_,
        sqlite_export_service_internal::kLocationLanguagesBindIndex,
        local_languages_json, "Failed to bind SQLite location languages");
    sqlite_export_service_internal::BindDouble(
        insert_location_stmt_,
        sqlite_export_service_internal::kLocationLatitudeBindIndex,
        brewery.location.latitude, "Failed to bind SQLite location latitude");
    sqlite_export_service_internal::BindDouble(
        insert_location_stmt_,
        sqlite_export_service_internal::kLocationLongitudeBindIndex,
        brewery.location.longitude, "Failed to bind SQLite location longitude");

    sqlite_export_service_internal::StepStatement(
        db_handle_, insert_location_stmt_,
        "Failed to insert SQLite location row");

    location_id = sqlite_export_service_internal::LastInsertRowId(db_handle_);
    location_cache_.emplace(location_key, location_id);
    sqlite_export_service_internal::ResetStatement(insert_location_stmt_);
  }

  sqlite_export_service_internal::BindInt64(
      insert_brewery_stmt_,
      sqlite_export_service_internal::kBreweryLocationIdBindIndex, location_id,
      "Failed to bind SQLite brewery location id");
  sqlite_export_service_internal::BindText(
      insert_brewery_stmt_,
      sqlite_export_service_internal::kBreweryEnglishNameBindIndex,
      brewery.brewery.name_en, "Failed to bind SQLite brewery English name");
  sqlite_export_service_internal::BindText(
      insert_brewery_stmt_,
      sqlite_export_service_internal::kBreweryEnglishDescriptionBindIndex,
      brewery.brewery.description_en,
      "Failed to bind SQLite brewery English description");
  sqlite_export_service_internal::BindText(
      insert_brewery_stmt_,
      sqlite_export_service_internal::kBreweryLocalNameBindIndex,
      brewery.brewery.name_local, "Failed to bind SQLite brewery local name");
  sqlite_export_service_internal::BindText(
      insert_brewery_stmt_,
      sqlite_export_service_internal::kBreweryLocalDescriptionBindIndex,
      brewery.brewery.description_local,
      "Failed to bind SQLite brewery local description");

  sqlite_export_service_internal::StepStatement(
      db_handle_, insert_brewery_stmt_, "Failed to insert SQLite brewery row");

  sqlite_export_service_internal::ResetStatement(insert_brewery_stmt_);
}
