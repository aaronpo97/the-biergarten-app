/**
 * @file services/xeger/xeger_parser.cc
 * @brief Recursive-descent parser that turns a regex pattern into an AST.
 */

#include "services/xeger/xeger_internal.h"

#include <cctype>
#include <format>
#include <memory>
#include <stdexcept>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace xeger_internal {

Parser::Parser(std::string_view pattern) : src_(StripAnchors(pattern)) {}

NodePtr Parser::Parse() {
  NodePtr node = ParseAlternation();
  if (!AtEnd()) {
    throw std::runtime_error(
        std::format("GenerateStringFromRegex: unexpected '{}' at position {}",
                    Peek(), pos_));
  }
  return node;
}

std::string Parser::StripAnchors(std::string_view pattern) {
  if (!pattern.empty() && pattern.front() == kAnchorStart) {
    pattern.remove_prefix(1);
  }
  const bool has_trailing_dollar =
      !pattern.empty() && pattern.back() == kAnchorEnd &&
      (pattern.size() < 2 || pattern[pattern.size() - 2] != kEscape);
  if (has_trailing_dollar) {
    pattern.remove_suffix(1);
  }
  return std::string(pattern);
}

bool Parser::AtEnd() const { return pos_ >= src_.size(); }
char Parser::Peek() const { return src_[pos_]; }
char Parser::Advance() { return src_[pos_++]; }

bool Parser::Match(const char c) {
  if (!AtEnd() && Peek() == c) {
    ++pos_;
    return true;
  }
  return false;
}

void Parser::Expect(const char c) {
  if (!Match(c)) {
    throw std::runtime_error(std::format(
        "GenerateStringFromRegex: expected '{}' at position {}", c, pos_));
  }
}

NodePtr Parser::ParseAlternation() {
  std::vector<NodePtr> options;
  options.push_back(ParseConcat());
  while (Match(kAlternation)) {
    options.push_back(ParseConcat());
  }
  if (options.size() == 1) {
    return std::move(options.front());
  }
  auto alternation = std::make_unique<Alternation>();
  alternation->options = std::move(options);
  return alternation;
}

NodePtr Parser::ParseConcat() {
  auto concat = std::make_unique<Concat>();
  while (!AtEnd() && Peek() != kAlternation && Peek() != kGroupClose) {
    concat->parts.push_back(ParseRepeat());
  }
  if (concat->parts.size() == 1) {
    return std::move(concat->parts.front());
  }
  return concat;
}

NodePtr Parser::ParseRepeat() {
  NodePtr atom = ParseAtom();
  if (AtEnd()) {
    return atom;
  }

  int lo = 0;
  int hi = -1;
  switch (Peek()) {
    case kStar:
      Advance();
      lo = 0;
      hi = -1;
      break;
    case kPlus:
      Advance();
      lo = 1;
      hi = -1;
      break;
    case kOptional:
      Advance();
      lo = 0;
      hi = 1;
      break;
    case kBraceOpen:
      return ParseBrace(std::move(atom));
    default:
      return atom;
  }
  auto repeat = std::make_unique<Repeat>();
  repeat->child = std::move(atom);
  repeat->min = lo;
  repeat->max = hi;
  return repeat;
}

NodePtr Parser::ParseBrace(NodePtr atom) {
  Expect(kBraceOpen);
  std::string lower_digits;
  std::string upper_digits;
  bool has_comma = false;
  while (!AtEnd() && std::isdigit(static_cast<unsigned char>(Peek())) != 0) {
    lower_digits += Advance();
  }
  if (Match(kBraceComma)) {
    has_comma = true;
    while (!AtEnd() &&
           std::isdigit(static_cast<unsigned char>(Peek())) != 0) {
      upper_digits += Advance();
    }
  }
  Expect(kBraceClose);

  auto repeat = std::make_unique<Repeat>();
  repeat->child = std::move(atom);
  repeat->min = lower_digits.empty() ? 0 : std::stoi(lower_digits);
  if (!has_comma) {
    repeat->max = repeat->min;
  } else if (upper_digits.empty()) {
    repeat->max = -1;
  } else {
    repeat->max = std::stoi(upper_digits);
  }
  if (repeat->max != -1 && repeat->max < repeat->min) {
    throw std::runtime_error(
        "GenerateStringFromRegex: repetition max is smaller than min");
  }
  return repeat;
}

NodePtr Parser::ParseAtom() {
  if (AtEnd()) {
    throw std::runtime_error(
        "GenerateStringFromRegex: pattern ended unexpectedly");
  }
  const char c = Peek();
  switch (c) {
    case kGroupOpen: {
      Advance();
      // Non-capturing group "(?:...)" -- capture semantics don't apply
      // here (nothing back-references a group), so it's treated exactly
      // like a plain group once the "?:" marker is consumed.
      if (!AtEnd() && Peek() == kNonCapturingMarker) {
        if (pos_ + 1 < src_.size() && src_[pos_ + 1] == kNonCapturingColon) {
          pos_ += 2;
        } else {
          throw std::runtime_error(std::format(
              "GenerateStringFromRegex: unsupported group syntax at "
              "position {} (only plain '(...)' and non-capturing "
              "'(?:...)' groups are supported)",
              pos_));
        }
      }
      NodePtr inner = ParseAlternation();
      Expect(kGroupClose);
      return inner;
    }
    case kClassOpen:
      return ParseCharClass();
    case kAnyChar:
      Advance();
      return std::make_unique<AnyChar>();
    case kEscape:
      Advance();
      return ParseEscape();
    case kStar:
    case kPlus:
    case kOptional:
    case kBraceOpen:
      throw std::runtime_error(std::format(
          "GenerateStringFromRegex: quantifier with no preceding item at "
          "position {}",
          pos_));
    default:
      Advance();
      return std::make_unique<Literal>(c);
  }
}

NodePtr Parser::MakeClass(std::vector<std::pair<char, char>> ranges,
                          const bool negated) {
  auto char_class = std::make_unique<CharClass>();
  char_class->ranges = std::move(ranges);
  char_class->negated = negated;
  return char_class;
}

NodePtr Parser::ParseEscape() {
  if (AtEnd()) {
    throw std::runtime_error(
        "GenerateStringFromRegex: a backslash at the very end has nothing "
        "to escape");
  }
  const char c = Advance();
  switch (c) {
    case 'd':
      return MakeClass({{'0', '9'}}, false);
    case 'D':
      return MakeClass({{'0', '9'}}, true);
    case 'w':
      return MakeClass({{'a', 'z'}, {'A', 'Z'}, {'0', '9'}, {'_', '_'}},
                       false);
    case 'W':
      return MakeClass({{'a', 'z'}, {'A', 'Z'}, {'0', '9'}, {'_', '_'}},
                       true);
    case 's':
      return MakeClass({{' ', ' '}, {'\t', '\t'}, {'\n', '\n'}, {'\r', '\r'}},
                       false);
    case 'S':
      return MakeClass({{' ', ' '}, {'\t', '\t'}, {'\n', '\n'}, {'\r', '\r'}},
                       true);
    case 'n':
      return std::make_unique<Literal>('\n');
    case 't':
      return std::make_unique<Literal>('\t');
    case 'r':
      return std::make_unique<Literal>('\r');
    default:
      // \.  \*  \(  \\  etc. -- the literal character itself.
      return std::make_unique<Literal>(c);
  }
}

NodePtr Parser::ParseCharClass() {
  Expect(kClassOpen);
  auto char_class = std::make_unique<CharClass>();
  if (Match(kClassNegate)) {
    char_class->negated = true;
  }
  if (AtEnd()) {
    throw std::runtime_error(
        "GenerateStringFromRegex: character class '[' is never closed");
  }

  while (!AtEnd() && Peek() != kClassClose) {
    char lo = ClassChar();
    const bool is_range = Peek() == kClassRange && pos_ + 1 < src_.size() &&
                          src_[pos_ + 1] != kClassClose;
    if (is_range) {
      Advance();
      char hi = ClassChar();
      if (hi < lo) {
        std::swap(lo, hi);
      }
      char_class->ranges.emplace_back(lo, hi);
    } else {
      char_class->ranges.emplace_back(lo, lo);
    }
  }
  Expect(kClassClose);
  if (char_class->ranges.empty()) {
    throw std::runtime_error(
        "GenerateStringFromRegex: empty character class []");
  }
  return char_class;
}

char Parser::ClassChar() {
  const char c = Advance();
  if (c != kEscape) {
    return c;
  }
  if (AtEnd()) {
    throw std::runtime_error(
        "GenerateStringFromRegex: backslash at end of character class");
  }
  const char escaped = Advance();
  switch (escaped) {
    case 'n':
      return '\n';
    case 't':
      return '\t';
    case 'r':
      return '\r';
    default:
      return escaped;
  }
}

}  // namespace xeger_internal
