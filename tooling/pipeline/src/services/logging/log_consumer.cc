/**
 * @file services/logging/log_consumer.cc
 * @brief Dedicated log drain worker implementation.
 *
 * LogConsumer drains LogEntry items from a BoundedChannel and forwards them
 * to spdlog for final output.
 */

#include "services/logging/log_consumer.h"

#include <spdlog/spdlog.h>

#include <string>

#include "concurrency/bounded_channel.h"
#include "services/logging/log_entry.h"

LogConsumer::LogConsumer(BoundedChannel<LogEntry>& channel)
    : channel_(channel) {}

void LogConsumer::Run() {
  while (true) {
    auto entry = channel_.Receive();
    if (!entry.has_value()) {
      // Channel is closed and drained.
      break;
    }

    const LogEntry& log_entry = entry.value();
    auto logger = spdlog::default_logger();

    const std::string formatted_message = [&] {
      std::string msg = std::string(log_entry.message);
      msg += " [phase=" + ToString(log_entry.phase) + "]";
      return msg;
    }();

    logger->log(ToSpdlogLevel(log_entry.level), formatted_message);
  }
}

spdlog::level::level_enum LogConsumer::ToSpdlogLevel(LogLevel level) {
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

std::string LogConsumer::ToString(PipelinePhase phase) {
  switch (phase) {
    case PipelinePhase::Startup:
      return "Startup";
    case PipelinePhase::UserGeneration:
      return "UserGeneration";
    case PipelinePhase::BreweryAndBeerGeneration:
      return "BreweryAndBeerGeneration";
    case PipelinePhase::CheckinGeneration:
      return "CheckinGeneration";
    case PipelinePhase::RatingGeneration:
      return "RatingGeneration";
    case PipelinePhase::FollowGeneration:
      return "FollowGeneration";
    case PipelinePhase::Teardown:
      return "Teardown";
  }
  return "Unknown";
}
