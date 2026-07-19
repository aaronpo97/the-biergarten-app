#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATETIME_DATE_TIME_PROVIDER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATETIME_DATE_TIME_PROVIDER_H_

/**
 * @file services/date_time_provider.h
 * @brief Abstraction for UTC timestamp generation.
 */

#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <string>

/**
 * @brief Interface for UTC timestamp providers.
 *
 * @todo Yagni, consider removing this and just use SystemDateTimeProvider
 * directly
 */
class IDateTimeProvider {
  public:
   virtual ~IDateTimeProvider() = default;

   IDateTimeProvider() = default;
   IDateTimeProvider(const IDateTimeProvider&) = delete;
   IDateTimeProvider& operator=(const IDateTimeProvider&) = delete;
   IDateTimeProvider(IDateTimeProvider&&) = delete;
   IDateTimeProvider& operator=(IDateTimeProvider&&) = delete;

   /**
    * @brief Returns the current UTC timestamp in a file-safe format.
    *
    * @return UTC timestamp string.
    */
   virtual std::string GetUtcTimestamp() = 0;
};

/**
 * @brief Timestamp provider backed by the system clock.
 */
class SystemDateTimeProvider final : public IDateTimeProvider {
  public:
   std::string GetUtcTimestamp() override {
      constexpr int kFractionalSecondWidth = 6;

      const auto now = std::chrono::system_clock::now();
      const auto now_time = std::chrono::system_clock::to_time_t(now);
      const std::tm* utc_time_ptr = std::gmtime(&now_time);
      if (utc_time_ptr == nullptr) {
         throw std::runtime_error("Failed to format UTC timestamp");
      }

      const auto fractional_seconds =
          std::chrono::duration_cast<std::chrono::microseconds>(
              now.time_since_epoch()) %
          std::chrono::seconds(1);

      std::ostringstream output;
      output << std::put_time(utc_time_ptr, "%Y-%m-%dT%H-%M-%S");
      output << '.' << std::setw(kFractionalSecondWidth) << std::setfill('0')
             << fractional_seconds.count() << 'Z';
      return output.str();
   }
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_DATETIME_DATE_TIME_PROVIDER_H_
