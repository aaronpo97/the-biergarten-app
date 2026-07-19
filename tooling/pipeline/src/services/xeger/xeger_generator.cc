/**
 * @file services/xeger/xeger_generator.cc
 * @brief Visitor that walks a regex AST and emits a random matching string.
 */

#include <cassert>
#include <limits>
#include <random>
#include <stdexcept>
#include <string>

#include "services/xeger/xeger_internal.h"

namespace xeger_internal {

XegerGenerator::XegerGenerator(std::mt19937& rng, const int unbounded_cap)
    : rng_(rng), unbounded_cap_(unbounded_cap) {}

std::string XegerGenerator::Run(const Node& root) {
   out_.clear();
   root.Accept(*this);
   return out_;
}

void XegerGenerator::Visit(const Literal& node) { out_ += node.ch; }

void XegerGenerator::Visit(const AnyChar&) {
   static constexpr int kPrintableLow = ' ';   // empty space - character 32
   static constexpr int kPrintableHigh = '~';  // tilde - character 126

   std::uniform_int_distribution<int> dist(kPrintableLow, kPrintableHigh);

   // assert that the rand number is in the char range
   bool inCharRange = dist.min() >= std::numeric_limits<char>::min() &&
                      dist.max() <= std::numeric_limits<char>::max();
   assert(inCharRange && "Random number is out of char range");

   out_ += static_cast<char>(dist(rng_));
}

void XegerGenerator::Visit(const CharClass& node) {
   out_ += PickFromClass(node);
}

void XegerGenerator::Visit(const Concat& node) {
   for (const NodePtr& part : node.parts) {
      part->Accept(*this);
   }
}

void XegerGenerator::Visit(const Alternation& node) {
   std::uniform_int_distribution<size_t> dist(0, node.options.size() - 1);
   node.options[dist(rng_)]->Accept(*this);
}

void XegerGenerator::Visit(const Repeat& node) {
   const int lo = node.min;
   const int hi = (node.max < 0) ? node.min + unbounded_cap_ : node.max;
   std::uniform_int_distribution<int> dist(lo, hi);
   const int count = dist(rng_);
   for (int i = 0; i < count; ++i) {
      node.child->Accept(*this);
   }
}

bool XegerGenerator::InRanges(const CharClass& node, const char c) {
   for (const auto& [lo, hi] : node.ranges) {
      if (c >= lo && c <= hi) {
         return true;
      }
   }
   return false;
}

char XegerGenerator::PickFromClass(const CharClass& node) {
   if (!node.negated) {
      int total = 0;
      for (const auto& [lo, hi] : node.ranges) {
         total += hi - lo + 1;
      }
      std::uniform_int_distribution<int> dist(0, total - 1);
      int k = dist(rng_);
      for (const auto& [lo, hi] : node.ranges) {
         const int width = hi - lo + 1;
         if (k < width) {
            return static_cast<char>(lo + k);
         }
         k -= width;
      }
      return node.ranges.back().second;  // unreachable
   }

   // Negated class: draw random printable characters until one falls
   // outside the forbidden set.
   static constexpr int kPrintableLow = 32;
   static constexpr int kPrintableHigh = 126;
   static constexpr int kMaxAttempts = 1000;
   std::uniform_int_distribution<int> dist(kPrintableLow, kPrintableHigh);
   for (int attempt = 0; attempt < kMaxAttempts; ++attempt) {
      const char c = static_cast<char>(dist(rng_));
      if (!InRanges(node, c)) {
         return c;
      }
   }
   throw std::runtime_error(
       "GenerateStringFromRegex: negated class rules out every printable "
       "character");
}

}  // namespace xeger_internal
