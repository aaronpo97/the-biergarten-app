/**
 * @file services/logging/logger.h
 * @brief Abstract logging interface used by pipeline components.
 *
 * The interface keeps application code independent from the concrete logging
 * transport, buffering, and formatting implementation.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_

#include <optional>
#include <string>
#include <string_view>

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
     * @param level Severity of the message.
     * @param phase Pipeline execution phase associated with the message.
     * @param message Log message text.
    */
   virtual void Log(LogLevel level, PipelinePhase phase,
                    std::string_view message) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOGGER_H_
