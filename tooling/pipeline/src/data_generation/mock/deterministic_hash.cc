/**
 * @file data_generation/mock/deterministic_hash.cc
 * @brief Implements a stable hash combiner used by MockGenerator to derive
 * repeatable pseudo-random indices from location input.
 */

#include <boost/container_hash/hash.hpp>

#include "data_generation/mock_generator.h"

size_t MockGenerator::DeterministicHash(const Location& location) {
  size_t seed = 0;
  boost::hash_combine(seed, location.city);
  boost::hash_combine(seed, location.country);
  return seed;
}

size_t MockGenerator::DeterministicHash(const Location& location,
                                        const UserPersona& persona,
                                        const Name& name) {
  size_t seed = DeterministicHash(location);
  boost::hash_combine(seed, persona.name);
  boost::hash_combine(seed, name.first_name);
  boost::hash_combine(seed, name.last_name);
  return seed;
}
