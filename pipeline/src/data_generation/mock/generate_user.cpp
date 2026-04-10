/**
 * @file data_generation/mock/generate_user.cpp
 * @brief Generates deterministic mock user profiles by hashing locale values
 * into predefined username and bio collections.
 */

#include <functional>
#include <string>
#include <string_view>

#include "data_generation/mock_generator.h"

UserResult MockGenerator::GenerateUser(const std::string& locale) {
   const std::size_t hash = std::hash<std::string>{}(locale);

   UserResult result;
   const std::string_view username = kUsernames[hash % kUsernames.size()];
   const std::string_view bio = kBios[hash / 11 % kBios.size()];
   result.username = username;
   result.bio = bio;
   return result;
}
