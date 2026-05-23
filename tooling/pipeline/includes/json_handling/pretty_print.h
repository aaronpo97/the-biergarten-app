#ifndef BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_PRETTY_PRINT_H_
#define BIERGARTEN_PIPELINE_INCLUDES_JSON_HANDLING_PRETTY_PRINT_H_

/**
 * @file json_handling/pretty_print.h
 * @brief Pretty-printing utilities for JSON values.
 *
 * Provides formatting capability for boost::json::value with indentation and
 * readable output. Adapted from Boost JSON library examples.
 */

#include <boost/json.hpp>
#include <ostream>
#include <string>

/**
 * @brief Pretty-prints a JSON value to an output stream with indentation.
 *
 * Recursively formats JSON objects and arrays with consistent 4-space
 * indentation. Adapted from:
 * https://raw.githubusercontent.com/boostorg/json/refs/heads/develop/example/pretty.cpp
 *
 * @param outstream Output stream to write formatted JSON.
 * @param json_val JSON value to format.
 * @param indent Optional indentation string (managed internally on first call).
 */
inline void PrettyPrint(std::ostream& outstream,
                        boost::json::value const& json_val,
                        std::string* indent = nullptr) {
  std::string str;
  if (indent == nullptr) {
    indent = &str;
  }
  switch (json_val.kind()) {
    case boost::json::kind::object: {
      outstream << "{\n";
      indent->append(4, ' ');
      auto const& obj = json_val.get_object();
      if (!obj.empty()) {
        const auto* iter = obj.begin();
        for (;;) {
          outstream << *indent << boost::json::serialize(iter->key()) << " : ";
          PrettyPrint(outstream, iter->value(), indent);
          iter = std::next(iter);
          if (iter == obj.end()) {
            break;
          }

          outstream << ",\n";
        }
      }
      outstream << "\n";
      indent->resize(indent->size() - 4);
      outstream << *indent << "}";
      break;
    }

    case boost::json::kind::array: {
      outstream << "[\n";
      indent->append(4, ' ');
      auto const& arr = json_val.get_array();
      if (!arr.empty()) {
        const auto* iter = arr.begin();
        for (;;) {
          outstream << *indent;
          PrettyPrint(outstream, *iter, indent);
          iter = std::next(iter);
          if (iter == arr.end()) {
            break;
          }
          outstream << ",\n";
        }
      }
      outstream << "\n";
      indent->resize(indent->size() - 4);
      outstream << *indent << "]";
      break;
    }

    case boost::json::kind::string: {
      outstream << serialize(json_val.get_string());
      break;
    }

    case boost::json::kind::uint64:
    case boost::json::kind::int64:
    case boost::json::kind::double_:
      outstream << json_val;
      break;

    case boost::json::kind::bool_:
      if (json_val.get_bool()) {
        outstream << "true";
      } else {
        outstream << "false";
      }
      break;

    case boost::json::kind::null:
      outstream << "null";
      break;
  }

  if (indent->empty()) {
    outstream << "\n";
  }
}

#endif
