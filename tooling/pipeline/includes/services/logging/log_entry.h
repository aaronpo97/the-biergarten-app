/**
 * @file services/logging/log_entry.h
 * @brief Structured log record shared by the pipeline logging infra.
 *
 * LogEntry is a lightweight value type that can be passed safely between the
 * logging producer and dispatcher through BoundedChannel<LogEntry>.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_ENTRY_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_ENTRY_H_

#include <chrono>
#include <thread>
#include <string>

/**
 * @enum LogLevel
 * @brief Severity levels supported by the logging infra.
 */
enum class LogLevel {
  Debug,  ///< Development/debugging information.
  Info,   ///< General informational messages.
  Warn,   ///< Warning conditions.
  Error,  ///< Error conditions.
};

/**
 * @enum PipelinePhase
 * @brief Pipeline execution phases used to tag log records.
 *
 * The phase tag makes it easier to correlate log output with the part of the
 * pipeline that emitted it.
 */
enum class PipelinePhase {
  Startup,                   ///< Initialization and validation.
  UserGeneration,            ///< User profile generation.
  BreweryAndBeerGeneration,  ///< Brewery and beer data generation.
  CheckinGeneration,         ///< Checkin (visit) record generation.
  RatingGeneration,          ///< Rating and review generation.
  FollowGeneration,          ///< Follow relationship generation.
  Teardown,                  ///< Finalization and cleanup.
};

/**
 * @struct LogEntry
 * @brief Single structured log event.
 *
 * All fields are value types, which keeps transfer across the bounded channel
 * simple and avoids shared ownership.
 */
struct LogEntry {
  /// @brief Timestamp when the entry was created.
  std::chrono::system_clock::time_point timestamp =
      std::chrono::system_clock::now();


  /// @brief Severity level of this entry.
  LogLevel level;

  /// @brief Pipeline phase associated with the entry.
  PipelinePhase phase;

  /// @brief Log message text.
  std::string message;

};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_ENTRY_H_