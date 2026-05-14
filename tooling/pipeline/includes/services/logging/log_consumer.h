/**
 * @file services/logging/log_consumer.h
 * @brief Dedicated log consumer/drain for asynchronous pipeline logging.
 *
 * Intent: Dequeue LogEntry values from a BoundedChannel on a dedicated thread
 * and forward them to spdlog for I/O and formatting. Decouples application
 * logic from logging latency.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_CONSUMER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_CONSUMER_H_

#include <spdlog/spdlog.h>

#include <string>

#include "concurrency/bounded_channel.h"
#include "services/logging/log_entry.h"

/**
 * @class LogConsumer
 * @brief Consumes log entries from channel and forwards to spdlog.
 *
 * Non-copyable, non-movable. Designed to run on its own dedicated std::thread.
 * Drains the channel until closure, then exits cleanly.
 */
class LogConsumer {
 public:
   /**
    * @brief Construct a log consumer.
    *
    * @param channel Reference to bounded channel for log entry retrieval.
    *                Channel must outlive this consumer instance.
    */
   explicit LogConsumer(BoundedChannel<LogEntry>& channel);

   LogConsumer(const LogConsumer&) = delete;
   LogConsumer& operator=(const LogConsumer&) = delete;
   LogConsumer(LogConsumer&&) = delete;
   LogConsumer& operator=(LogConsumer&&) = delete;

   /**
    * @brief Main loop: drain channel and forward entries to spdlog.
    *
    * Intended to be called once on a dedicated thread. Returns when:
    * - Channel is closed AND all queued entries are drained.
    *
    * Thread-safe for use from multiple ChannelLogger instances on other threads.
    */
   void Run();

 private:
   BoundedChannel<LogEntry>& channel_;

   static spdlog::level::level_enum ToSpdlogLevel(LogLevel level);
   static std::string ToString(PipelinePhase phase);
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_CONSUMER_H_
