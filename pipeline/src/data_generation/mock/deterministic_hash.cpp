#include <string>

#include "data_generation/mock_generator.h"

std::size_t MockGenerator::DeterministicHash(const std::string& a,
                                             const std::string& b) {
   std::size_t seed = std::hash<std::string>{}(a);
   const std::size_t mixed = std::hash<std::string>{}(b);
   seed ^= mixed + 0x9e3779b97f4a7c15ULL + (seed << 6) + (seed >> 2);
   seed = (seed << 13) | (seed >> ((sizeof(std::size_t) * 8) - 13));
   return seed;
}
