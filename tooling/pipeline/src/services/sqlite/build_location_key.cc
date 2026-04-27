/**
 * @file services/sqlite/build_location_key.cc
 * @brief SqliteExportService::BuildLocationKey() implementation.
 */

#include <iomanip>
#include <sstream>

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
             << sqlite_export_service_internal::SerializeLocalLanguages(
                    location.local_languages);
  return key_stream.str();
}
