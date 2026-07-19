/**
 * @file services/postal_code/xeger.cc
 * @brief Parses a regex pattern into an AST and walks it to emit a random
 * matching string ("xeger" -- "regex" backwards).
 *
 *   1. Parser         Turns the pattern text into an AST (Literal, AnyChar,
 *                     CharClass, Concat, Alternation, Repeat nodes).
 *   2. Visitor        Double-dispatch contract -- each AST-walking
 *                     operation implements this
 *   3. Generator      a Visitor that emits a random character wherever the
 *                     AST says a character belongs, respecting alternation
 *                     choices and repeat counts.
 */

#include "services/postal_code/xeger.h"

#include <cassert>
#include <cctype>
#include <format>
#include <memory>
#include <stdexcept>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace {

// Regex syntax characters

constexpr char kAnchorStart = '^';
constexpr char kAnchorEnd = '$';
constexpr char kAlternation = '|';
constexpr char kGroupOpen = '(';
constexpr char kGroupClose = ')';
constexpr char kNonCapturingMarker = '?';
constexpr char kNonCapturingColon = ':';
constexpr char kClassOpen = '[';
constexpr char kClassClose = ']';
constexpr char kClassNegate = '^';
constexpr char kClassRange = '-';
constexpr char kAnyChar = '.';
constexpr char kEscape = '\\';
constexpr char kStar = '*';
constexpr char kPlus = '+';
constexpr char kOptional = '?';
constexpr char kBraceOpen = '{';
constexpr char kBraceClose = '}';
constexpr char kBraceComma = ',';

// AST

struct Literal;
struct AnyChar;
struct CharClass;
struct Concat;
struct Alternation;
struct Repeat;

struct Visitor {
  virtual void Visit(const Literal&) = 0;
  virtual void Visit(const AnyChar&) = 0;
  virtual void Visit(const CharClass&) = 0;
  virtual void Visit(const Concat&) = 0;
  virtual void Visit(const Alternation&) = 0;
  virtual void Visit(const Repeat&) = 0;
  virtual ~Visitor() = default;
};

struct Node {
  virtual void Accept(Visitor&) const = 0;
  virtual ~Node() = default;
};

using NodePtr = std::unique_ptr<Node>;

template <typename Derived>
struct Visitable : Node {
  void Accept(Visitor& visitor) const override {
    visitor.Visit(static_cast<const Derived&>(*this));
  }
};

// One fixed character, e.g. 'a'.
struct Literal : Visitable<Literal> {
  char ch;
  explicit Literal(const char c) : ch(c) {}
};

// The "." wildcard: any single printable character.
struct AnyChar : Visitable<AnyChar> {};

// A set of allowed characters, stored as inclusive ranges. A single
// character 'x' is the range {'x', 'x'}. `negated` flips the meaning to
// "any character NOT listed" (i.e. `[^...]`).
struct CharClass : Visitable<CharClass> {
  std::vector<std::pair<char, char>> ranges;
  bool negated = false;
};

// "Do these children one after another."
struct Concat : Visitable<Concat> {
  std::vector<NodePtr> parts;
};

// "Pick exactly one of these options at random" -- the `|` operator.
struct Alternation : Visitable<Alternation> {
  std::vector<NodePtr> options;
};

// "Repeat one child between min and max times."
//   a*     -> min 0, max infinite
//   a+     -> min 1, max infinite
//   a?     -> min 0, max 1
//   a{2,5} -> min 2, max 5
struct Repeat : Visitable<Repeat> {
  NodePtr child;
  unsigned int min = 0;
  std::optional<unsigned int> max;  // std::nullopt means "no upper bound"
};

// Parser (recursive descent)
//
// Precedence, loosest to tightest binding:
//   ParseAlternation  ::=  a|b|c
//     ParseConcat     ::=  abc
//       ParseRepeat   ::=  a*  a{2,5}
//         ParseAtom   ::=  a  .  [..]  (..)  \d

class Parser {
 public:
  explicit Parser(std::string_view pattern) : src_(StripAnchors(pattern)) {}

  NodePtr Parse() {
    NodePtr node = ParseAlternation();
    if (!AtEnd()) {
      throw std::runtime_error(
          std::format("GenerateStringFromRegex: unexpected '{}' at position {}",
                      Peek(), pos_));
    }
    return node;
  }

 private:
  std::string src_;
  size_t pos_ = 0;

  // Strips anchors (leading '^' and trailing '$') as they are not needed for
  // generation.
  static std::string StripAnchors(std::string_view pattern) {
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

  [[nodiscard]] bool AtEnd() const { return pos_ >= src_.size(); }
  [[nodiscard]] char Peek() const { return src_[pos_]; }
  char Advance() { return src_[pos_++]; }
  bool Match(const char c) {
    if (!AtEnd() && Peek() == c) {
      ++pos_;
      return true;
    }
    return false;
  }
  void Expect(const char c) {
    if (!Match(c)) {
      throw std::runtime_error(std::format(
          "GenerateStringFromRegex: expected '{}' at position {}", c, pos_));
    }
  }

  // Level 1: alternation -- ( concat | concat | concat )
  NodePtr ParseAlternation() {
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

  // Level 2: concatenation -- a run of items back to back
  NodePtr ParseConcat() {
    auto concat = std::make_unique<Concat>();
    while (!AtEnd() && Peek() != kAlternation && Peek() != kGroupClose) {
      concat->parts.push_back(ParseRepeat());
    }
    if (concat->parts.size() == 1) {
      return std::move(concat->parts.front());
    }
    return concat;
  }

  // Level 3: an atom plus an optional quantifier
  NodePtr ParseRepeat() {
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

  // Curly-brace quantifiers: {n}, {n,}, {n,m}
  NodePtr ParseBrace(NodePtr atom) {
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

  // Level 4: an atom -- the smallest standalone unit
  NodePtr ParseAtom() {
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

  static NodePtr MakeClass(std::vector<std::pair<char, char>> ranges,
                           const bool negated) {
    auto char_class = std::make_unique<CharClass>();
    char_class->ranges = std::move(ranges);
    char_class->negated = negated;
    return char_class;
  }

  NodePtr ParseEscape() {
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

  NodePtr ParseCharClass() {
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

  // Reads one character inside [ ], turning \] \n etc. into the real
  // character they represent.
  char ClassChar() {
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
};

// Generator -- a Visitor that emits a random matching string

class XegerGenerator final : public Visitor {
 public:
  XegerGenerator(std::mt19937& rng, const int unbounded_cap)
      : rng_(rng), unbounded_cap_(unbounded_cap) {}

  std::string Run(const Node& root) {
    out_.clear();
    root.Accept(*this);
    return out_;
  }

  void Visit(const Literal& node) override { out_ += node.ch; }

  void Visit(const AnyChar&) override {
    static constexpr int kPrintableLow = ' ';   // empty space - character 32
    static constexpr int kPrintableHigh = '~';  // tilde - character 126

    std::uniform_int_distribution<int> dist(kPrintableLow, kPrintableHigh);

    // assert that the rand number is in the char range
    bool inCharRange = dist.min() >= std::numeric_limits<char>::min() &&
                       dist.max() <= std::numeric_limits<char>::max();
    assert(inCharRange && "Random number is out of char range");

    out_ += static_cast<char>(dist(rng_));
  }

  void Visit(const CharClass& node) override { out_ += PickFromClass(node); }

  void Visit(const Concat& node) override {
    for (const NodePtr& part : node.parts) {
      part->Accept(*this);
    }
  }

  void Visit(const Alternation& node) override {
    std::uniform_int_distribution<size_t> dist(0, node.options.size() - 1);
    node.options[dist(rng_)]->Accept(*this);
  }

  void Visit(const Repeat& node) override {
    const int lo = node.min;
    const int hi = (node.max < 0) ? node.min + unbounded_cap_ : node.max;
    std::uniform_int_distribution<int> dist(lo, hi);
    const int count = dist(rng_);
    for (int i = 0; i < count; ++i) {
      node.child->Accept(*this);
    }
  }

 private:
  std::mt19937& rng_;
  int unbounded_cap_;
  std::string out_;

  static bool InRanges(const CharClass& node, const char c) {
    for (const auto& [lo, hi] : node.ranges) {
      if (c >= lo && c <= hi) {
        return true;
      }
    }
    return false;
  }

  char PickFromClass(const CharClass& node) {
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
};

}  // namespace

std::string GenerateStringFromRegex(std::string_view pattern, std::mt19937& rng,
                                    const int unbounded_repeat_cap) {
  Parser parser(pattern);
  const NodePtr ast = parser.Parse();
  XegerGenerator generator(rng, unbounded_repeat_cap);
  return generator.Run(*ast);
}
