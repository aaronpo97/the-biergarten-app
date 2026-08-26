#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_NOMINATIM_ADDRESS_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_NOMINATIM_ADDRESS_SERVICE_H_

/**
 * @file services/address/nominatim_address_service.h
 * @brief Reverse geocoding backed by the public Nominatim API.
 */

#include <memory>
#include <optional>

#include "services/address/address_service.h"
#include "services/logging/logger.h"
#include "web_client/web_client.h"

/**
 * @brief Reverse-geocodes coordinates into street addresses via the public
 * Nominatim API (https://nominatim.openstreetmap.org).
 *
 * Required for API usage:
 * - single identifying User-Agent and at most one request per
 * second (https://operations.osmfoundation.org/policies/nominatim/).
 */
class NominatimAddressService final : public IAddressService {
  public:
   explicit NominatimAddressService(std::unique_ptr<WebClient> client,
                                    std::shared_ptr<ILogger> logger);

   std::optional<AddressLookupResult> ReverseGeocode(
       double longitude, double latitude) override;

  private:
   std::unique_ptr<WebClient> client_;
   std::shared_ptr<ILogger> logger_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_ADDRESS_NOMINATIM_ADDRESS_SERVICE_H_
