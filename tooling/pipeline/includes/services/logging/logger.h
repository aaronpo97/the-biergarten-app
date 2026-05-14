/**
 * @file services/logging/logger.h
 * @brief Abstract logging interface for pipeline components.
 *
 * Intent: Decouple logging from channel/worker implementation details.
 * All pipeline components depend on ILogger, enabling swappable backends.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_

#include <optional>
#include <string>
#include <string_view>

#include "services/logging/log_entry.h"

/**
 * @class ILogger
 * @brief Minimal interface for submitting log entries.
 *
 * Non-copyable and non-movable. Implementations are typically short-lived,
 * created and owned by the composition root.
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
    * @brief Submit a log entry to the logging subsystem.
    *
    * @param level Log level (Debug, Info, Warn, Error).
    * @param phase Pipeline execution phase (Startup, Generation, Teardown, etc.).
    * @param message Log message text.
    */
   virtual void Log(LogLevel level, PipelinePhase phase,
                    std::string_view message) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_
