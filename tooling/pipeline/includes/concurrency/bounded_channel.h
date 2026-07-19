#ifndef BIERGARTEN_PIPELINE_INCLUDES_CONCURRENCY_BOUNDED_CHANNEL_H_
#define BIERGARTEN_PIPELINE_INCLUDES_CONCURRENCY_BOUNDED_CHANNEL_H_

#include <condition_variable>
#include <cstddef>
#include <mutex>
#include <optional>
#include <queue>

/**
 * @file bounded_channel.h
 * @brief Thread-safe, bounded multi-producer/multi-consumer synchronous
 * channel.
 *
 * Intent: Enables asynchronous inter-thread communication with backpressure.
 * Models a synchronous channel where producers/consumers block on capacity
 * limits.
 */

/**
 * @class BoundedChannel
 * @brief MPMC channel with fixed capacity and blocking semantics.
 *
 * Producers block when buffer is full; consumers block when empty.
 * Close() unblocks all waiters and signals channel exhaustion.
 */
template <typename T>
class BoundedChannel {
  // Internal state — all access must be guarded by mutex_.

  std::queue<T> queue_;

  std::mutex mutex_;

  std::condition_variable not_full_;

  std::condition_variable not_empty_;

  std::size_t capacity_;

  bool closed_ = false;

 public:
  /**
   * @brief Construct a bounded channel with the given capacity.
   * @param capacity Maximum number of items the channel may hold.
   */
  explicit BoundedChannel(std::size_t capacity) : capacity_(capacity) {}

  /**
   * @brief Send an item into the channel. Blocks when the channel is full.
   * @param item Move-only item to enqueue.
   */
  void Send(T item);

  /**
   * @brief Receive an item from the channel. Blocks when the channel is
   * empty.
   * @return std::optional<T> containing the item, or std::nullopt when the
   * channel is closed and drained.
   */
  std::optional<T> Receive();

  /**
   * @brief Close the channel and unblock all waiting threads. Idempotent.
   */
  void Close();
};

// Include the template implementation
#include "bounded_channel.tcc"

#endif  // BIERGARTEN_PIPELINE_INCLUDES_CONCURRENCY_BOUNDED_CHANNEL_H_
