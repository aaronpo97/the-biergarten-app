#include <functional>
#include <string>

#include "data_generation/mock_generator.h"

UserResult MockGenerator::GenerateUser(const std::string& locale) {
   const std::size_t hash = std::hash<std::string>{}(locale);

   UserResult result;
   result.username = kUsernames[hash % kUsernames.size()];
   result.bio = kBios[(hash / 11) % kBios.size()];
   return result;
}
