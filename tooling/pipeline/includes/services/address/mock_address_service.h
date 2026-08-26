#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_MOCK_ADDRESS_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_MOCK_ADDRESS_SERVICE_H_

/**
 * @file services/address/mock_address_service.h
 * @brief Deterministic IAddressService used when network geocoding is
 * disabled.
 */

#include <optional>

#include "services/address/address_service.h"

/**
 * @brief Address service that returns a fixed placeholder address for any
 * coordinate pair, without making network calls.
 */
class MockAddressService final : public IAddressService {
  public:
   std::optional<AddressLookupResult> ReverseGeocode(
       double /*longitude*/, double /*latitude*/) override {
      return AddressLookupResult{.address_line1 = "123 Mock Street",
                                 .postal_code = "00000"};
   }
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_MOCK_ADDRESS_SERVICE_H_
