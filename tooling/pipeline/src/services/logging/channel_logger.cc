/**
 * @file services/logging/channel_logger.cc
 */

#include <chrono>
#include <optional>
#include <string>
#include <string_view>

#include "concurrency/bounded_channel.h"
#include "services/logging/channel_logger.h"
#include "services/logging/log_entry.h"

ChannelLogger::ChannelLogger(BoundedChannel<LogEntry>& channel)
    : channel_(channel) {}

void ChannelLogger::Log(LogLevel level, PipelinePhase phase,
                         const std::string_view message) {
  channel_.Send(LogEntry{.timestamp = std::chrono::system_clock::now(),
                         .level = level,
                         .phase = phase,
                         .message = std::string(message)});
}
