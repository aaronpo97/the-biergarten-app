#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_POSTAL_CODE_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_POSTAL_CODE_SERVICE_H_

/**
 * @file services/postal_code/postal_code_service.h
 * @brief Abstraction for resolving a postal code for a city.
 */

#include <string>

#include "data_model/models.h"

/**
 * @brief Interface for services that resolve a postal code for a city.
 */
class IPostalCodeService {
  public:
   IPostalCodeService() = default;
   virtual ~IPostalCodeService() = default;

   IPostalCodeService(const IPostalCodeService&) = delete;
   IPostalCodeService& operator=(const IPostalCodeService&) = delete;
   IPostalCodeService(IPostalCodeService&&) = delete;
   IPostalCodeService& operator=(IPostalCodeService&&) = delete;

   /**
    * @brief Resolves a postal code for @p city.
    *
    * @param city City whose curated postal-code examples supply the result.
    * @return A postal code string, or an empty string if none is available.
    */
   virtual std::string GeneratePostalCode(const City& city) = 0;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_POSTAL_CODE_SERVICE_H_
