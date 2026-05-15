/**
 * @brief LogDispatcher implementation for asynchronous pipeline logging.
 *
 * LogDispatcher drains LogEntry items from a BoundedChannel and forwards them
 * to spdlog for final output.
 */
#include "services/logging/log_dispatcher.h"

#include <spdlog/spdlog.h>

#include <string>

#include "concurrency/bounded_channel.h"
#include "services/logging/log_entry.h"

LogDispatcher::LogDispatcher(BoundedChannel<LogEntry>& channel)
    : channel_(channel) {}

void LogDispatcher::Run() {
  auto logger = spdlog::default_logger();

  while (true) {
    auto entry = channel_.Receive();
    if (!entry.has_value()) {
      // Channel is closed and drained.
      break;
    }

    const auto& log = entry.value();

    logger->log(ToSpdlogLevel(log.level), log.message);
  }
}

spdlog::level::level_enum LogDispatcher::ToSpdlogLevel(LogLevel level) {
  switch (level) {
    case LogLevel::Debug:
      return spdlog::level::debug;
    case LogLevel::Info:
      return spdlog::level::info;
    case LogLevel::Warn:
      return spdlog::level::warn;
    case LogLevel::Error:
      return spdlog::level::err;
  }
  return spdlog::level::info;
}
