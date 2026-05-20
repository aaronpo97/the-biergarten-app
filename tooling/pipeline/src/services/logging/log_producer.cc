/**
 * @file src/services/logging/log_producer.cc
 * @brief LogProducer implementation for asynchronous pipeline logging.
 */

#include "services/logging/log_producer.h"

#include <chrono>
#include <optional>
#include <string>
#include <string_view>

#include "concurrency/bounded_channel.h"
#include "services/logging/log_entry.h"

LogProducer::LogProducer(BoundedChannel<LogEntry>& channel)
    : channel_(channel) {}

void LogProducer::Log(LogEntry entry) { channel_.Send(std::move(entry)); }
