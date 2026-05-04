#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_EXPORT_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_EXPORT_SERVICE_H_

/**
 * @file services/sqlite_export_service.h
 * @brief SQLite-backed export service for generated brewery data.
 */

#include <filesystem>
#include <memory>
#include <string>
#include <unordered_map>

#include "data_model/models.h"
#include "../datetime/date_time_provider.h"
#include "export_service.h"
#include "sqlite_export_service_helpers.h"

/**
 * @brief Persists generated brewery records into a fresh SQLite database.
 */
class SqliteExportService final : public IExportService {
 public:
  explicit SqliteExportService(const ApplicationOptions& options);
  ~SqliteExportService() override;

  SqliteExportService(const SqliteExportService&) = delete;
  SqliteExportService& operator=(const SqliteExportService&) = delete;
  SqliteExportService(SqliteExportService&&) = delete;
  SqliteExportService& operator=(SqliteExportService&&) = delete;

  void Initialize() override;
  uint64_t ProcessRecord(const GeneratedBrewery& brewery) override;
  void Finalize() override;

 private:
  using SqliteDatabaseHandle =
      sqlite_export_service_internal::SqliteDatabaseHandle;
  using SqliteStatementHandle =
      sqlite_export_service_internal::SqliteStatementHandle;

  void InitializeSchema() const;
  void PrepareStatements();
  void RollbackAndCloseNoThrow() noexcept;

  [[nodiscard]] std::filesystem::path BuildDatabasePath() const;
  [[nodiscard]] static std::string BuildLocationKey(const Location& location);

  std::unique_ptr<IDateTimeProvider> date_time_provider_;
  std::filesystem::path output_path_;
  std::string run_timestamp_utc_;
  std::filesystem::path database_path_;
  SqliteDatabaseHandle db_handle_;
  SqliteStatementHandle insert_location_stmt_;
  SqliteStatementHandle insert_brewery_stmt_;
  bool transaction_open_ = false;
  std::unordered_map<std::string, sqlite3_int64> location_cache_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_SQLITE_EXPORT_SERVICE_H_
