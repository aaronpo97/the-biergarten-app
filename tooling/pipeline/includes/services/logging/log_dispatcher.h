/**
 * @file services/logging/log_dispatcher.h
 * @brief Dedicated log dispatcher for asynchronous pipeline logging.
 *
 * The dispatcher drains LogEntry values from a bounded channel and forwards
 * them to spdlog on a dedicated thread.
 */

#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_DISPATCHER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_DISPATCHER_H_

#include <spdlog/spdlog.h>

#include "concurrency/bounded_channel.h"
#include "services/logging/log_entry.h"

/**
 * @class LogDispatcher
 * @brief Consumes log entries from a channel and forwards them to spdlog.
 *
 * Non-copyable and non-movable. Intended to run on its own dedicated thread
 * and exit once the channel has been closed and drained.
 */
class LogDispatcher {
 public:
  /**
   * @brief Construct a log dispatcher.
   *
   * @param channel Reference to the bounded channel used for log retrieval.
   */
  explicit LogDispatcher(BoundedChannel<LogEntry>& channel);

  LogDispatcher(const LogDispatcher&) = delete;
  LogDispatcher& operator=(const LogDispatcher&) = delete;
  LogDispatcher(LogDispatcher&&) = delete;
  LogDispatcher& operator=(LogDispatcher&&) = delete;
  ~LogDispatcher() = default;

  /**
   * @brief Drain the channel and forward entries to spdlog.
   *
   * Intended to be called once on a dedicated thread. The loop returns after
   * the channel has been closed and all queued entries have been processed.
   */
  void Run();

 private:
  BoundedChannel<LogEntry>& channel_;

  static spdlog::level::level_enum ToSpdlogLevel(LogLevel level);
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_LOGGING_LOG_DISPATCHER_H_
