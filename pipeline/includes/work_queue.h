#pragma once

#include <condition_variable>
#include <mutex>
#include <optional>
#include <queue>

/// @brief Bounded thread-safe queue with blocking push/pop and shutdown.
template <typename T> class WorkQueue {
private:
  std::queue<T> queue;
  std::mutex mutex;
  std::condition_variable cv_not_empty;
  std::condition_variable cv_not_full;
  size_t max_size;
  bool shutdown = false;

public:
  /// @brief Creates a queue with fixed capacity.
  explicit WorkQueue(size_t capacity) : max_size(capacity) {}

  /// @brief Pushes an item, blocking while full unless shutdown is signaled.
  bool push(T item) {
    std::unique_lock<std::mutex> lock(mutex);
    cv_not_full.wait(lock,
                     [this] { return queue.size() < max_size || shutdown; });

    if (shutdown)
      return false;

    queue.push(std::move(item));
    cv_not_empty.notify_one();
    return true;
  }

  /// @brief Pops an item, blocking while empty unless shutdown is signaled.
  std::optional<T> pop() {
    std::unique_lock<std::mutex> lock(mutex);
    cv_not_empty.wait(lock, [this] { return !queue.empty() || shutdown; });

    if (queue.empty())
      return std::nullopt;

    T item = std::move(queue.front());
    queue.pop();
    cv_not_full.notify_one();
    return item;
  }

  /// @brief Signals queue shutdown and wakes all waiting producers/consumers.
  void shutdown_queue() {
    std::unique_lock<std::mutex> lock(mutex);
    shutdown = true;
    cv_not_empty.notify_all();
    cv_not_full.notify_all();
  }

  /// @brief Returns current queue size.
  size_t size() const {
    std::lock_guard<std::mutex> lock(mutex);
    return queue.size();
  }
};
