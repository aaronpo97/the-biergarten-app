#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_MOCK_POSTAL_CODE_SERVICE_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_MOCK_POSTAL_CODE_SERVICE_H_

/**
 * @file services/postal_code/mock_postal_code_service.h
 * @brief Data-driven postal code service that selects the first curated
 * example for a city and validates it against the city's postal-code regex.
 */

#include <format>
#include <regex>
#include <stdexcept>
#include <string>

#include "services/postal_code/postal_code_service.h"

/**
 * @brief Postal code service backed entirely by the curated locations
 * dataset: it returns the city's first example postal code after checking it
 * against the curated postal-code regex.
 *
 * A precise city regex is preferred when present; otherwise the permissive
 * country format regex is used as the fallback. A city with no examples, or an
 * example that fails validation, throws so the caller can skip the city.
 */
class MockPostalCodeService final : public IPostalCodeService {
  public:
   std::string GeneratePostalCode(const City& city) override {
      const PostalCodeSpec& spec = city.postal_code;

      if (spec.examples.empty()) {
         throw std::runtime_error(std::format(
             "No postal-code examples available for city '{}'", city.city));
      }

      const std::string& candidate = spec.examples.front();

      if (!MatchesAnyPattern(candidate, spec)) {
         throw std::runtime_error(
             std::format("Postal code '{}' for city '{}' does not match the "
                         "curated postal-code regex",
                         candidate, city.city));
      }

      return candidate;
   }

  private:
   /**
    * @brief Returns true if @p candidate matches any city regex, or the
    * country format regex when no city regex matches. When the spec carries no
    * usable regex at all, validation is skipped (returns true).
    */
   static bool MatchesAnyPattern(const std::string& candidate,
                                 const PostalCodeSpec& spec) {
      bool has_pattern = false;

      for (const std::string& pattern : spec.city_regexes) {
         if (pattern.empty()) {
            continue;
         }
         has_pattern = true;
         if (std::regex_match(candidate, std::regex(pattern))) {
            return true;
         }
      }

      if (!spec.country_format_regex.empty()) {
         has_pattern = true;
         if (std::regex_match(candidate,
                              std::regex(spec.country_format_regex))) {
            return true;
         }
      }

      return !has_pattern;
   }
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_MOCK_POSTAL_CODE_SERVICE_H_
