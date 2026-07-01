/**
 * @file services/sqlite/process_user_record.cc
 * @brief SqliteExportService::ProcessRecord(UserRecord) implementation.
 */

#include <stdexcept>

#include "services/database/sqlite_export_service.h"
#include "services/database/sqlite_export_service_helpers.h"

uint64_t SqliteExportService::ProcessRecord(const UserRecord& user) {
  if (db_handle_ == nullptr || !transaction_open_) {
    throw std::runtime_error("SQLite export service is not initialized");
  }

  const sqlite3_int64 location_id = ResolveLocationId(user.location);

  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<sqlite3_int64>{
          .index = sqlite_export_service_internal::kUserLocationIdBindIndex,
          .value = location_id,
          .action = "Failed to bind SQLite user location id"});
  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kUserFirstNameBindIndex,
          .value = user.user.first_name,
          .action = "Failed to bind SQLite user first name"});
  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kUserLastNameBindIndex,
          .value = user.user.last_name,
          .action = "Failed to bind SQLite user last name"});
  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kUserGenderBindIndex,
          .value = user.user.gender,
          .action = "Failed to bind SQLite user gender"});
  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kUserUsernameBindIndex,
          .value = user.user.username,
          .action = "Failed to bind SQLite user username"});
  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kUserBioBindIndex,
          .value = user.user.bio,
          .action = "Failed to bind SQLite user bio"});
  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<double>{
          .index = sqlite_export_service_internal::kUserActivityWeightBindIndex,
          .value = static_cast<double>(user.user.activity_weight),
          .action = "Failed to bind SQLite user activity weight"});
  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kUserEmailBindIndex,
          .value = user.email,
          .action = "Failed to bind SQLite user email"});
  sqlite_export_service_internal::Bind(
      insert_user_stmt_,
      sqlite_export_service_internal::BoundParam<std::string_view>{
          .index = sqlite_export_service_internal::kUserDateOfBirthBindIndex,
          .value = user.date_of_birth,
          .action = "Failed to bind SQLite user date of birth"});

  sqlite_export_service_internal::StepStatement(
      db_handle_, insert_user_stmt_, "Failed to insert SQLite user row");

  sqlite_export_service_internal::ResetStatement(insert_user_stmt_);

  return sqlite_export_service_internal::LastInsertRowId(db_handle_);
}
