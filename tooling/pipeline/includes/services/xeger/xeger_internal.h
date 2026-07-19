#ifndef BIERGARTEN_PIPELINE_INCLUDES_SERVICES_XEGER_XEGER_INTERNAL_H_
#define BIERGARTEN_PIPELINE_INCLUDES_SERVICES_XEGER_XEGER_INTERNAL_H_
/**
 * @file services/xeger/xeger_internal.h
 * @brief Declarations shared by the xeger parser and generator.
 *
 *   1. Parser         Turns the pattern text into an AST (Literal, AnyChar,
 *                      CharClass, Concat, Alternation, Repeat nodes).
 *   2. Visitor         Double-dispatch contract -- each AST-walking
 *                      operation implements this.
 *   3. XegerGenerator  a Visitor that emits a random character wherever the
 *                      AST says a character belongs, respecting alternation
 *                      choices and repeat counts.
 */

#include <memory>
#include <optional>
#include <random>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace xeger_internal {

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
   explicit Parser(std::string_view pattern);

   NodePtr Parse();

  private:
   std::string src_;
   size_t pos_ = 0;

   // Strips anchors (leading '^' and trailing '$') as they are not needed for
   // generation.
   static std::string StripAnchors(std::string_view pattern);

   [[nodiscard]] bool AtEnd() const;
   [[nodiscard]] char Peek() const;
   char Advance();
   bool Match(char c);
   void Expect(char c);

   // Level 1: alternation -- ( concat | concat | concat )
   NodePtr ParseAlternation();

   // Level 2: concatenation -- a run of items back to back
   NodePtr ParseConcat();

   // Level 3: an atom plus an optional quantifier
   NodePtr ParseRepeat();

   // Curly-brace quantifiers: {n}, {n,}, {n,m}
   NodePtr ParseBrace(NodePtr atom);

   // Level 4: an atom -- the smallest standalone unit
   NodePtr ParseAtom();

   static NodePtr MakeClass(std::vector<std::pair<char, char>> ranges,
                            bool negated);

   NodePtr ParseEscape();

   NodePtr ParseCharClass();

   // Reads one character inside [ ], turning \] \n etc. into the real
   // character they represent.
   char ClassChar();
};

// Generator -- a Visitor that emits a random matching string

class XegerGenerator final : public Visitor {
  public:
   XegerGenerator(std::mt19937& rng, int unbounded_cap);

   std::string Run(const Node& root);

   void Visit(const Literal& node) override;
   void Visit(const AnyChar&) override;
   void Visit(const CharClass& node) override;
   void Visit(const Concat& node) override;
   void Visit(const Alternation& node) override;
   void Visit(const Repeat& node) override;

  private:
   std::mt19937& rng_;
   int unbounded_cap_;
   std::string out_;

   static bool InRanges(const CharClass& node, char c);

   char PickFromClass(const CharClass& node);
};

}  // namespace xeger_internal

#endif  // BIERGARTEN_PIPELINE_INCLUDES_SERVICES_XEGER_XEGER_INTERNAL_H_
