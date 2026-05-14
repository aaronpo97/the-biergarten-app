/**
 * @file services/logging/channel_logger.h
 * @brief Channel-backed producer for asynchronous pipeline logging.
 *
 * Intent: Decouple logging from synchronous I/O by forwarding entries to a
 * bounded channel. LogConsumer drains the channel on a dedicated thread.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_CHANNEL_LOGGER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_CHANNEL_LOGGER_H_

#include <string_view>

#include "concurrency/bounded_channel.h"
#include "services/logging/log_entry.h"
#include "services/logging/logger.h"

/**
 * @class ChannelLogger
 * @brief ILogger implementation that sends entries to a BoundedChannel.
 *
 * Non-copyable, non-movable. Holds a non-owning reference to the channel.
 */
class ChannelLogger final : public ILogger {
 public:
   /**
    * @brief Construct a channel-backed logger.
    *
    * @param channel Reference to bounded channel for log entry transfer.
    *                Channel must outlive this logger instance.
    */
   explicit ChannelLogger(BoundedChannel<LogEntry>& channel);

   ChannelLogger(const ChannelLogger&) = delete;
   ChannelLogger& operator=(const ChannelLogger&) = delete;
   ChannelLogger(ChannelLogger&&) = delete;
   ChannelLogger& operator=(ChannelLogger&&) = delete;

   ~ChannelLogger() override = default;

   /**
    * @brief Queue a log entry for asynchronous processing.
    *
    * Blocks if the channel is full (backpressure). Returns immediately
    * if the channel is closed.
    */
   void Log(LogLevel level, PipelinePhase phase,
            std::string_view message) override;

 private:
   BoundedChannel<LogEntry>& channel_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_CHANNEL_LOGGER_H_
