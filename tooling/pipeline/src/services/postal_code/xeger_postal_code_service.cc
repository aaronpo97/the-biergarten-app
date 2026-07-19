/**
 * @file services/postal_code/xeger_postal_code_service.cc
 * @brief XegerPostalCodeService::GeneratePostalCode() implementation.
 */

#include "services/postal_code/xeger_postal_code_service.h"

#include <format>
#include <random>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

#include "services/xeger/xeger.h"

XegerPostalCodeService::XegerPostalCodeService()
    : rng_(std::random_device{}()) {}

std::string XegerPostalCodeService::GeneratePostalCode(const City& city) {
   const PostalCodeSpec& spec = city.postal_code;

   std::vector<std::string_view> city_patterns;
   for (const std::string& pattern : spec.city_regexes) {
      if (!pattern.empty()) {
         city_patterns.push_back(pattern);
      }
   }

   std::string_view pattern;
   if (!city_patterns.empty()) {
      std::uniform_int_distribution<size_t> dist(0, city_patterns.size() - 1);
      pattern = city_patterns[dist(rng_)];
   } else if (!spec.country_format_regex.empty()) {
      pattern = spec.country_format_regex;
   } else {
      throw std::runtime_error(std::format(
          "XegerPostalCodeService: no postal-code pattern available for "
          "city '{}'",
          city.city));
   }

   return GenerateStringFromRegex(pattern, rng_);
}
