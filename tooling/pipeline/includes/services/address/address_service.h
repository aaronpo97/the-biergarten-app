#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_ADDRESS_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_ADDRESS_SERVICE_H_

/**
 * @file services/address/address_service.h
 * @brief Abstraction for resolving a street address from coordinates.
 */

#include <optional>
#include <string>

/**
 * @brief Street-level address resolved from a coordinate pair.
 */
struct AddressLookupResult {
   std::string address_line1;
   std::string postal_code;
};

/**
 * @brief Interface for services that reverse-geocode coordinates into a
 * street address.
 */
class IAddressService {
  public:
   virtual ~IAddressService() = default;

   /**
    * @brief Reverse-geocodes a coordinate pair into a street address.
    *
    * @param longitude Longitude of the point to resolve.
    * @param latitude Latitude of the point to resolve.
    * @return The resolved address, or std::nullopt if it could not be
    * resolved.
    */
   virtual std::optional<AddressLookupResult> ReverseGeocode(
       double longitude, double latitude) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_ADDRESS_SERVICE_H_
