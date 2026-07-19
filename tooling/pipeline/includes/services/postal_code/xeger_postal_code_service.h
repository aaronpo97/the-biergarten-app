#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_XEGER_POSTAL_CODE_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_XEGER_POSTAL_CODE_SERVICE_H_

/**
 * @file services/postal_code/xeger_postal_code_service.h
 * @brief Postal code service that generates a fresh, format-conformant code
 * per call from the curated regex patterns, instead of returning a fixed
 * example.
 */

#include <random>

#include "services/postal_code/postal_code_service.h"

/**
 * @brief Postal code service using regex-driven generation (xeger).
 *
 * Picks among the city's curated `city_regexes` (falls back to
 * `country_format_regex`), then generates a random string matching that pattern
 * via GenerateStringFromRegex().
 */
class XegerPostalCodeService final : public IPostalCodeService {
  public:
   XegerPostalCodeService();

   std::string GeneratePostalCode(const City& city) override;

  private:
   std::mt19937 rng_;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_XEGER_POSTAL_CODE_SERVICE_H_
