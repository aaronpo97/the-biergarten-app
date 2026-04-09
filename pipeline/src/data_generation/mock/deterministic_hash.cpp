/**
 * @file data_generation/mock/deterministic_hash.cpp
 * @brief Implements a stable hash combiner used by MockGenerator to derive
 * repeatable pseudo-random indices from location input.
 */

#include <boost/container_hash/hash.hpp>
#include <string>

#include "data_generation/mock_generator.h"

std::size_t MockGenerator::DeterministicHash(const std::string& a,
                                             const std::string& b) {
   std::size_t seed = 0;
   boost::hash_combine(seed, a);
   boost::hash_combine(seed, b);
   return seed;
}
