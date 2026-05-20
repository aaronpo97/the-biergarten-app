/**
 * @file services/logging/logger.h
 * @brief Abstract logging interface used by pipeline components.
 *
 * The interface keeps application code independent from the concrete logging
 * transport, buffering, and formatting implementation.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_

#include <source_location>
#include <string>
#include <utility>

#include "services/logging/log_entry.h"

/**
 * @class ILogger
 * @brief Minimal interface for submitting structured log messages.
 *
 * Implementations are non-copyable and non-movable. They are typically owned
 * by the composition root and injected into services that emit diagnostics.
 */
class ILogger {
 public:
  ILogger() = default;
  ILogger(const ILogger&) = delete;
  ILogger& operator=(const ILogger&) = delete;
  ILogger(ILogger&&) = delete;
  ILogger& operator=(ILogger&&) = delete;
  virtual ~ILogger() = default;

  /**
   * @brief Submit a log message to the logging subsystem.
   *
   * @param log_entry Structured log entry data.
   */
  virtual void Log(LogEntry log_entry) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_
