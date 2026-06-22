#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_EXPORT_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_EXPORT_SERVICE_H_

/**
 * @file services/export_service.h
 * @brief Abstraction for persisting generated brewery data.
 */

#include <cstdint>

#include "data_model/generated_models.h"

/**
 * @brief Interface for services that persist generated brewery records.
 */
class IExportService {
 public:
  IExportService() = default;

  /// @brief Virtual destructor for polymorphic cleanup.
  virtual ~IExportService() = default;

  IExportService(const IExportService&) = delete;
  IExportService& operator=(const IExportService&) = delete;
  IExportService(IExportService&&) = delete;
  IExportService& operator=(IExportService&&) = delete;

  /// @brief Prepares the export destination for a new run.
  virtual void Initialize() = 0;

  /**
   * @brief Persists one generated brewery record.
   *
   * @param brewery Generated brewery payload to store.
   */
  virtual uint64_t ProcessRecord(const BreweryRecord& brewery) = 0;

  /**
   * @brief Persists one generated user record.
   *
   * @param user Generated user payload to store.
   */
  virtual uint64_t ProcessRecord(const UserRecord& user) = 0;

  /// @brief Finalizes the export destination.
  virtual void Finalize() = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATABASE_EXPORT_SERVICE_H_
