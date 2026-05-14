/**
 * @file services/logging/log_entry.h
 * @brief POD log entry structure for asynchronous pipeline logging.
 *
 * Intent: Lightweight, move-safe data transfer between logging producer
 * (ChannelLogger) and consumer (LogConsumer) via BoundedChannel<LogEntry>.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_ENTRY_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_ENTRY_H_

#include <chrono>
#include <string>

/**
 * @enum LogLevel
 * @brief Severity levels for log entries.
 */
enum class LogLevel {
   Debug,  ///< Development/debugging information.
   Info,   ///< General informational messages.
   Warn,   ///< Warning conditions.
   Error,  ///< Error conditions.
};

/**
 * @enum PipelinePhase
 * @brief Execution phases for contextual logging.
 *
 * Used to tag log entries by their processing stage, enabling phase-specific
 * analysis and filtering of the execution timeline.
 */
enum class PipelinePhase {
   Startup,                      ///< Initialization and validation.
   UserGeneration,               ///< User profile generation.
   BreweryAndBeerGeneration,     ///< Brewery and beer data generation.
   CheckinGeneration,            ///< Checkin (visit) record generation.
   RatingGeneration,             ///< Rating and review generation.
   FollowGeneration,             ///< Follow relationship generation.
   Teardown,                     ///< Finalization and cleanup.
};

/**
 * @struct LogEntry
 * @brief Single log event for asynchronous processing.
 *
 * All fields are value types, allowing safe move semantics across
 * BoundedChannel without shared ownership or synchronization overhead.
 */
struct LogEntry {
   /// @brief Timestamp when entry was created.
   std::chrono::system_clock::time_point timestamp =
       std::chrono::system_clock::now();

   /// @brief Severity level of this entry.
   LogLevel level;

   /// @brief Pipeline phase when entry was logged.
   PipelinePhase phase;

   /// @brief Log message text.
   std::string message;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_ENTRY_H_