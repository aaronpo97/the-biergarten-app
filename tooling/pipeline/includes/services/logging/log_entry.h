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
#include <source_location>
#include <string>
#include <thread>
#include <vector>

/**
 * @enum LogLevel
 * @brief Severity levels supported by the logging infra.
 */
enum class LogLevel {
   /**
    * @brief Development/debugging information.
    */
   Debug,
   /**
    * @brief General informational messages.
    */
   Info,
   /**
    * @brief Warning conditions.
    */
   Warn,
   /**
    * @brief Error conditions.
    */
   Error,
};

/**
 * @enum PipelinePhase
 * @brief Pipeline execution phases used to tag log records.
 *
 * The phase tag makes it easier to correlate log output with the part of the
 * pipeline that emitted it.
 */
enum class PipelinePhase {
   /**
    * @brief Initialization and validation.
    */
   Startup,
   /**
    * @brief City/context enrichment (e.g. Wikipedia lookups).
    */
   Enrichment,
   /**
    * @brief User profile generation.
    */
   UserGeneration,
   /**
    * @brief Brewery and beer data generation.
    */
   BreweryAndBeerGeneration,
   /**
    * @brief Checkin (visit) record generation.
    */
   CheckinGeneration,
   /**
    * @brief Rating and review generation.
    */
   RatingGeneration,
   /**
    * @brief Follow relationship generation.
    */
   FollowGeneration,
   /**
    * @brief Finalization and cleanup.
    */
   Teardown,
};

/**
 * @struct LogDTO
 * @brief User-provided subset of log fields. Used to capture call-site info
 * transparently.
 */
struct LogDTO {
   LogLevel level;
   PipelinePhase phase;
   std::string message;
};

/**
 * @struct LogEntry
 * @brief Single structured log event.
 *
 * All fields are value types, which keeps transfer across the bounded channel
 * simple and avoids shared ownership.
 *
 * NOTE: timestamp, thread_id, and origin must be populated by ILogger::Log()
 * before the entry is dispatched.
 */
struct LogEntry {
   /**
    * @brief Timestamp when the entry was created.
    */
   std::chrono::system_clock::time_point timestamp{};

   /**
    * @brief Source location where the log call was made.
    */
   std::source_location origin{};

   /**
    * @brief Thread responsible for emitting the log.
    */
   std::thread::id thread_id{};

   /**
    * @brief Severity level of this entry.
    */
   LogLevel level;

   /**
    * @brief Pipeline phase associated with the entry.
    */
   PipelinePhase phase;

   /**
    * @brief Log message text.
    */
   std::string message;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_ENTRY_H_
