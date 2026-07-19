#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_XEGER_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_XEGER_H_
/**
 * @brief Generates a random string matching @p pattern.
 *
 * Supported syntax:
 * - literals
 * - `.`
 * - alternation `|`
 * - groups `(...)` and non-capturing groups `(?:...)`
 * - quantifiers `*` `+` `?` `{n}` `{n,}` `{n,m}`
 * - character classes `[...]` / `[^...]`
 * - shorthand escapes `\d \D \w \W \s \S \n \t \r`
 *
 * Not supported: lookaround, backreferences, and lazy quantifiers.
 *
 * @param pattern              Regular expression to generate a matching
 *                             string for.
 * @param rng                  Random source driving alternation/quantifier/
 *                             class choices.
 * @param unbounded_repeat_cap Extra repeats allowed on top of the declared
 *                             minimum for unbounded quantifiers
 *                             (`*`, `+`, `{n,}`).
 *
 * @return A string satisfying `std::regex_match(result, std::regex(pattern))`
 *         for any @p pattern within the supported syntax subset.
 *
 * @throws std::runtime_error if @p pattern cannot be parsed.
 */
std::string GenerateStringFromRegex(std::string_view pattern, std::mt19937& rng,
                                    int unbounded_repeat_cap = 8);

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_POSTAL_CODE_XEGER_H_
