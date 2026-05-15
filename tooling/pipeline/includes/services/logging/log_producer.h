/**
 * @file services/logging/log_producer.h
 * @brief Channel-backed log producer for asynchronous pipeline logging.
 *
 * The producer captures log records from application code and forwards them to
 * a bounded channel for later processing by the dispatcher.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_CHANNEL_LOGGER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_CHANNEL_LOGGER_H_

#include <string_view>

#include "concurrency/bounded_channel.h"
#include "services/logging/log_entry.h"
#include "services/logging/logger.h"

/**
 * @class LogProducer
 * @brief ILogger implementation that forwards entries to a bounded channel.
 *
 * Non-copyable and non-movable. The channel reference is non-owning and must
 * remain valid for the lifetime of the producer.
 */
class LogProducer final : public ILogger {
 public:
   /**
     * @brief Construct a channel-backed producer.
    *
     * @param channel Reference to the bounded channel used for log transfer.
    */
   explicit LogProducer(BoundedChannel<LogEntry>& channel);

   LogProducer(const LogProducer&) = delete;
   LogProducer& operator=(const LogProducer&) = delete;
   LogProducer(LogProducer&&) = delete;
   LogProducer& operator=(LogProducer&&) = delete;

   ~LogProducer() override = default;

   /**
     * @brief Queue a log message for asynchronous processing.
    *
     * Blocks while the channel applies backpressure.
    */
   void Log(LogLevel level, PipelinePhase phase,
            std::string_view message) override;

 private:
   BoundedChannel<LogEntry>& channel_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_CHANNEL_LOGGER_H_
