/**
 * @file data_generation/mock/generate_user.cc
 * @brief Generates deterministic mock user profiles by hashing city, persona,
 * and sampled name into predefined username and bio collections.
 */

#include <string_view>

#include "data_generation/mock_generator.h"

UserResult MockGenerator::GenerateUser(const EnrichedCity& city,
                                       const UserPersona& persona,
                                       const Name& name) {
   const size_t hash = DeterministicHash(city.location, persona, name);

   const std::string_view username = kUsernames[hash % kUsernames.size()];
   const std::string_view bio = kBios[hash / kBioHashStride % kBios.size()];
   const float activity_weight =
       static_cast<float>(hash / kActivityWeightHashStride %
                          kActivityWeightHashRange) /
       static_cast<float>(kActivityWeightHashRange);

   return {
       .first_name = name.first_name,
       .last_name = name.last_name,
       .gender = name.gender,
       .username = std::string(username),
       .bio = std::string(bio),
       .activity_weight = activity_weight,
   };
}
