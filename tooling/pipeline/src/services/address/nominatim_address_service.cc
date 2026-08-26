/**
 * @file services/address/nominatim_address_service.cc
 * @brief NominatimAddressService implementation.
 */

#include "services/address/nominatim_address_service.h"

#include <boost/json.hpp>
#include <chrono>
#include <format>
#include <stdexcept>
#include <string>
#include <thread>
#include <utility>

using namespace boost;

NominatimAddressService::NominatimAddressService(
    std::unique_ptr<WebClient> client, std::shared_ptr<ILogger> logger)
    : client_(std::move(client)), logger_(std::move(logger)) {}

std::optional<AddressLookupResult> NominatimAddressService::ReverseGeocode(
    double longitude, double latitude) {
   if (!client_) {
      if (logger_) {
         logger_->Log({.level = LogLevel::Warn,
                       .phase = PipelinePhase::Enrichment,
                       .message = "Nominatim client is nullptr."});
      }
      return std::nullopt;
   }

   const std::string url = std::format(
       "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={}&"
       "lon={}&zoom=18&addressdetails=1",
       latitude, longitude);

   std::string body;
   try {
      body = client_->Get(url);
   } catch (const std::runtime_error& e) {
      if (logger_) {
         logger_->Log({.level = LogLevel::Warn,
                       .phase = PipelinePhase::Enrichment,
                       .message = std::format(
                           "NominatimAddressService: request failed for "
                           "({}, {}): {}",
                           latitude, longitude, e.what())});
      }
      return std::nullopt;
   }

   {
      using namespace std::literals::chrono_literals;
      std::this_thread::sleep_for(1s);
   }

   system::error_code ec;
   const json::value doc = json::parse(body, ec);

   if (ec) {
      if (logger_) {
         logger_->Log({.level = LogLevel::Warn,
                       .phase = PipelinePhase::Enrichment,
                       .message = std::format(
                           "NominatimAddressService: JSON parse error for "
                           "({}, {}): {}",
                           latitude, longitude, ec.message())});
      }
      return std::nullopt;
   }

   const json::object* obj = doc.if_object();
   if ((obj == nullptr) || obj->contains("error")) {
      if (logger_) {
         logger_->Log(
             {.level = LogLevel::Warn,
              .phase = PipelinePhase::Enrichment,
              .message = std::format("NominatimAddressService: no address "
                                     "found for ({}, {})",
                                     latitude, longitude)});
      }
      return std::nullopt;
   }

   const json::value* address_ptr = obj->if_contains("address");
   if ((address_ptr == nullptr) || !address_ptr->is_object()) {
      if (logger_) {
         logger_->Log(
             {.level = LogLevel::Warn,
              .phase = PipelinePhase::Enrichment,
              .message = std::format("NominatimAddressService: missing "
                                     "'address' for ({}, {})",
                                     latitude, longitude)});
      }
      return std::nullopt;
   }

   const json::object& address = address_ptr->get_object();

   const auto extract_string = [&address](std::string_view key) -> std::string {
      const json::value* value_ptr = address.if_contains(key);
      if ((value_ptr == nullptr) || !value_ptr->is_string()) {
         return {};
      }
      return std::string(value_ptr->get_string());
   };

   const std::string house_number = extract_string("house_number");
   const std::string road = extract_string("road");
   const std::string postal_code = extract_string("postcode");

   std::string address_line1 = road;
   if (!house_number.empty()) {
      address_line1 = address_line1.empty() ? house_number
                                             : house_number + " " + road;
   }

   if (address_line1.empty()) {
      if (logger_) {
         logger_->Log(
             {.level = LogLevel::Warn,
              .phase = PipelinePhase::Enrichment,
              .message = std::format("NominatimAddressService: no usable "
                                     "street address for ({}, {})",
                                     latitude, longitude)});
      }
      return std::nullopt;
   }

   return AddressLookupResult{.address_line1 = address_line1,
                              .postal_code = postal_code};
}
