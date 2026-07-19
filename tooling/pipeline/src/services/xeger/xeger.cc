/**
 * @file services/xeger/xeger.cc
 * @brief Public entry point: parses a regex pattern into an AST and walks it
 * to emit a random matching string ("xeger" -- "regex" backwards).
 *
 * See xeger_internal.h for the parser/AST/generator this delegates to.
 */

#include "services/xeger/xeger.h"

#include <random>
#include <string>
#include <string_view>

#include "services/xeger/xeger_internal.h"

std::string GenerateStringFromRegex(std::string_view pattern, std::mt19937& rng,
                                    const int unbounded_repeat_cap) {
   xeger_internal::Parser parser(pattern);
   const xeger_internal::NodePtr ast = parser.Parse();
   xeger_internal::XegerGenerator generator(rng, unbounded_repeat_cap);
   return generator.Run(*ast);
}
