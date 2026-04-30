/**
 * @file services/sqlite/process_record.cc
 * @brief SqliteExportService::ProcessRecord() implementation.
 */

#include <stdexcept>
#include <string>

#include "services/sqlite_export_service.h"
#include "services/sqlite_export_service_helpers.h"


constexpr int kLocationPrecision = 17;

std::string SqliteExportService::BuildLocationKey(const Location& location) {
  std::ostringstream key_stream;
  key_stream << location.city << '\n'
             << location.state_province << '\n'
             << location.iso3166_2 << '\n'
             << location.country << '\n'
             << location.iso3166_1 << '\n'
             << std::setprecision(kLocationPrecision) << location.latitude
             << '\n'
             << std::setprecision(kLocationPrecision) << location.longitude
             << '\n'
             << sqlite_export_service_internal::SerializeVector(
                    location.local_languages);
  return key_stream.str();
}


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
        sqlite_export_service_internal::SerializeVector(
            brewery.location.local_languages);

    sqlite_export_service_internal::Bind(
        insert_location_stmt_,
        sqlite_export_service_internal::BindParam<std::string_view>{
            .index = sqlite_export_service_internal::kLocationCityBindIndex,
            .value = brewery.location.city,
            .action = "Failed to bind SQLite location city"
        });
    sqlite_export_service_internal::Bind(
        insert_location_stmt_,
        sqlite_export_service_internal::BindParam<std::string_view>{
            .index = sqlite_export_service_internal::kLocationStateProvinceBindIndex,
            .value = brewery.location.state_province,
            .action = "Failed to bind SQLite location state/province"
        });
    sqlite_export_service_internal::Bind(
        insert_location_stmt_,
        sqlite_export_service_internal::BindParam<std::string_view>{
            .index = sqlite_export_service_internal::kLocationIso31662BindIndex,
            .value = brewery.location.iso3166_2,
            .action = "Failed to bind SQLite location ISO 3166-2 code"
        });
    sqlite_export_service_internal::Bind(
        insert_location_stmt_,
        sqlite_export_service_internal::BindParam<std::string_view>{
            .index = sqlite_export_service_internal::kLocationCountryBindIndex,
            .value = brewery.location.country,
            .action = "Failed to bind SQLite location country"
        });
    sqlite_export_service_internal::Bind(
        insert_location_stmt_,
        sqlite_export_service_internal::BindParam<std::string_view>{
            .index = sqlite_export_service_internal::kLocationIso31661BindIndex,
            .value = brewery.location.iso3166_1,
            .action = "Failed to bind SQLite location ISO 3166-1 code"
        });
    sqlite_export_service_internal::Bind(
        insert_location_stmt_,
        sqlite_export_service_internal::BindParam<std::string_view>{
            .index = sqlite_export_service_internal::kLocationLanguagesBindIndex,
            .value = local_languages_json,
            .action = "Failed to bind SQLite location languages"
        });
    sqlite_export_service_internal::Bind(
        insert_location_stmt_,
        sqlite_export_service_internal::BindParam{
            .index = sqlite_export_service_internal::kLocationLatitudeBindIndex,
            .value = brewery.location.latitude,
            .action = "Failed to bind SQLite location latitude"
        });
    sqlite_export_service_internal::Bind(
        insert_location_stmt_,
        sqlite_export_service_internal::BindParam{
            .index = sqlite_export_service_internal::kLocationLongitudeBindIndex,
            .value = brewery.location.longitude,
            .action = "Failed to bind SQLite location longitude"
        });

    sqlite_export_service_internal::StepStatement(
        db_handle_, insert_location_stmt_,
        "Failed to insert SQLite location row");

    location_id = sqlite_export_service_internal::LastInsertRowId(db_handle_);
    location_cache_.emplace(location_key, location_id);
    sqlite_export_service_internal::ResetStatement(insert_location_stmt_);
  }

  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BindParam<sqlite3_int64>{
          .index = sqlite_export_service_internal::kBreweryLocationIdBindIndex,
          .value = location_id,
          .action = "Failed to bind SQLite brewery location id"
      });
  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BindParam<std::string_view>{
          .index = sqlite_export_service_internal::kBreweryEnglishNameBindIndex,
          .value = brewery.brewery.name_en,
          .action = "Failed to bind SQLite brewery English name"
      });
  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BindParam<std::string_view>{
          .index = sqlite_export_service_internal::kBreweryEnglishDescriptionBindIndex,
          .value = brewery.brewery.description_en,
          .action = "Failed to bind SQLite brewery English description"
      });
  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BindParam<std::string_view>{
          .index = sqlite_export_service_internal::kBreweryLocalNameBindIndex,
          .value = brewery.brewery.name_local,
          .action = "Failed to bind SQLite brewery local name"
      });
  sqlite_export_service_internal::Bind(
      insert_brewery_stmt_,
      sqlite_export_service_internal::BindParam<std::string_view>{
          .index = sqlite_export_service_internal::kBreweryLocalDescriptionBindIndex,
          .value = brewery.brewery.description_local,
          .action = "Failed to bind SQLite brewery local description"
      });

  sqlite_export_service_internal::StepStatement(
      db_handle_, insert_brewery_stmt_, "Failed to insert SQLite brewery row");

  sqlite_export_service_internal::ResetStatement(insert_brewery_stmt_);
}
