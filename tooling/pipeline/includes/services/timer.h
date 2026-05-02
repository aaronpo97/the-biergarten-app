#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_TIMER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_TIMER_H_

#include <chrono>

/**
 * @file services/timer.h
 * @brief Simple timer utility for measuring elapsed time.
 */
class Timer {
  std::chrono::steady_clock::time_point start_time =
      std::chrono::steady_clock::now();

 public:
  Timer(const Timer&) = delete;
  Timer& operator=(const Timer&) = delete;
  Timer(Timer&&) = delete;
  Timer& operator=(Timer&&) = delete;
  Timer() = default;
  ~Timer() = default;

  [[nodiscard]] int64_t Elapsed() const {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
               std::chrono::steady_clock::now() - start_time)
        .count();
  }

  [[nodiscard]] int64_t Reset() {
    auto previous_elapsed = Elapsed();
    start_time = std::chrono::steady_clock::now();
    return previous_elapsed;
  }
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_TIMER_H_
