#include "concurrency/bounded_channel.h"

template <typename T>
void BoundedChannel<T>::Send(T item) {
  // Acquire exclusive ownership of the mutex; released automatically on scope exit.
  std::unique_lock lock(mutex_);

  // Block until there is space in the queue or the channel has been closed.
  // The predicate guards against spurious wakeups.
  not_full_.wait(lock, [&] { return queue_.size() < capacity_ || closed_; });

  // If the channel was closed while waiting, discard the item and return.
  if (closed_) return;

  // Move the item into the queue to avoid an unnecessary copy.
  queue_.push(std::move(item));

  // Wake one blocked Receive() call to signal that data is now available.
  not_empty_.notify_one();
}

template <typename T>
std::optional<T> BoundedChannel<T>::Receive() {
  // Acquire exclusive ownership of the mutex.
  std::unique_lock lock(mutex_);

  // Block until the queue is non-empty or the channel has been closed.
  // The predicate guards against spurious wakeups.
  not_empty_.wait(lock, [&] { return !queue_.empty() || closed_; });

  // If woken due to closure and no items remain, signal exhaustion via nullopt.
  if (queue_.empty()) return std::nullopt;

  // Move the front item out of the queue to avoid an unnecessary copy.
  T item = std::move(queue_.front());
  queue_.pop();

  // Wake one blocked Send() call to signal that a slot has opened.
  not_full_.notify_one();

  return item;
}

template <typename T>
void BoundedChannel<T>::Close() {
  // Acquire exclusive ownership of the mutex to ensure visibility of the flag.
  std::unique_lock lock(mutex_);

  // Mark the channel as closed; subsequent Send() calls will be dropped.
  closed_ = true;

  // Wake all blocked Send() callers so they can observe the closed flag and exit.
  not_full_.notify_all();

  // Wake all blocked Receive() callers so they can drain remaining items or return nullopt.
  not_empty_.notify_all();
}