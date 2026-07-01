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
   * @param payload User-provided log data (level, phase, message).
   * @param origin Auto-captured source location of the call site.
   */
  void Log(LogDTO payload,
           std::source_location origin = std::source_location::current(),
           std::chrono::system_clock::time_point timestamp =
               std::chrono::system_clock::now(),
           std::thread::id thread_id = std::this_thread::get_id()) {
    LogEntry entry;
    entry.timestamp = timestamp;
    entry.thread_id = thread_id;
    entry.level = payload.level;
    entry.phase = payload.phase;
    entry.message = std::move(payload.message);
    entry.origin = origin;
    DoLog(std::move(entry));
  }

 protected:
  /**
   * @brief Underlying implementation to transport the log entry.
   *
   * Implementations must be thread-safe as DoLog can be called concurrently
   * from multiple worker threads.
   */
  virtual void DoLog(LogEntry log_entry) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_
