#include <cstdio>
#include <stdexcept>

#include <boost/json.hpp>
#include <boost/json/basic_parser_impl.hpp>
#include <spdlog/spdlog.h>

#include "database/database.h"
#include "json_handling/stream_parser.h"

class CityRecordHandler {
  friend class boost::json::basic_parser<CityRecordHandler>;

public:
  static constexpr std::size_t max_array_size = static_cast<std::size_t>(-1);
  static constexpr std::size_t max_object_size = static_cast<std::size_t>(-1);
  static constexpr std::size_t max_string_size = static_cast<std::size_t>(-1);
  static constexpr std::size_t max_key_size = static_cast<std::size_t>(-1);

  struct ParseContext {
    SqliteDatabase *db = nullptr;
    std::function<void(const CityRecord &)> on_city;
    std::function<void(size_t, size_t)> on_progress;
    size_t cities_emitted = 0;
    size_t total_file_size = 0;
    int countries_inserted = 0;
    int states_inserted = 0;
  };

  explicit CityRecordHandler(ParseContext &ctx) : context(ctx) {}

private:
  ParseContext &context;

  int depth = 0;
  bool in_countries_array = false;
  bool in_country_object = false;
  bool in_states_array = false;
  bool in_state_object = false;
  bool in_cities_array = false;
  bool building_city = false;

  int current_country_id = 0;
  int current_state_id = 0;
  CityRecord current_city = {};
  std::string current_key;
  std::string current_key_val;
  std::string current_string_val;

  std::string country_info[3];
  std::string state_info[2];

  // Boost.JSON SAX Hooks
  bool on_document_begin(boost::system::error_code &) { return true; }
  bool on_document_end(boost::system::error_code &) { return true; }

  bool on_array_begin(boost::system::error_code &) {
    depth++;
    if (depth == 1) {
      in_countries_array = true;
    } else if (depth == 3 && current_key == "states") {
      in_states_array = true;
    } else if (depth == 5 && current_key == "cities") {
      in_cities_array = true;
    }
    return true;
  }

  bool on_array_end(std::size_t, boost::system::error_code &) {
    if (depth == 1) {
      in_countries_array = false;
    } else if (depth == 3) {
      in_states_array = false;
    } else if (depth == 5) {
      in_cities_array = false;
    }
    depth--;
    return true;
  }

  bool on_object_begin(boost::system::error_code &) {
    depth++;
    if (depth == 2 && in_countries_array) {
      in_country_object = true;
      current_country_id = 0;
      country_info[0].clear();
      country_info[1].clear();
      country_info[2].clear();
    } else if (depth == 4 && in_states_array) {
      in_state_object = true;
      current_state_id = 0;
      state_info[0].clear();
      state_info[1].clear();
    } else if (depth == 6 && in_cities_array) {
      building_city = true;
      current_city = {};
    }
    return true;
  }

  bool on_object_end(std::size_t, boost::system::error_code &) {
    if (depth == 6 && building_city) {
      if (current_city.id > 0 && current_state_id > 0 &&
          current_country_id > 0) {
        current_city.state_id = current_state_id;
        current_city.country_id = current_country_id;

        try {
          context.on_city(current_city);
          context.cities_emitted++;

          if (context.on_progress && context.cities_emitted % 10000 == 0) {
            context.on_progress(context.cities_emitted,
                                context.total_file_size);
          }
        } catch (const std::exception &e) {
          spdlog::warn("Record parsing failed: {}", e.what());
        }
      }
      building_city = false;
    } else if (depth == 4 && in_state_object) {
      if (current_state_id > 0 && current_country_id > 0) {
        try {
          context.db->InsertState(current_state_id, current_country_id,
                                  state_info[0], state_info[1]);
          context.states_inserted++;
        } catch (const std::exception &e) {
          spdlog::warn("Record parsing failed: {}", e.what());
        }
      }
      in_state_object = false;
    } else if (depth == 2 && in_country_object) {
      if (current_country_id > 0) {
        try {
          context.db->InsertCountry(current_country_id, country_info[0],
                                    country_info[1], country_info[2]);
          context.countries_inserted++;
        } catch (const std::exception &e) {
          spdlog::warn("Record parsing failed: {}", e.what());
        }
      }
      in_country_object = false;
    }

    depth--;
    return true;
  }

  bool on_key_part(boost::json::string_view s, std::size_t,
                   boost::system::error_code &) {
    current_key_val.append(s.data(), s.size());
    return true;
  }

  bool on_key(boost::json::string_view s, std::size_t,
              boost::system::error_code &) {
    current_key_val.append(s.data(), s.size());
    current_key = current_key_val;
    current_key_val.clear();
    return true;
  }

  bool on_string_part(boost::json::string_view s, std::size_t,
                      boost::system::error_code &) {
    current_string_val.append(s.data(), s.size());
    return true;
  }

  bool on_string(boost::json::string_view s, std::size_t,
                 boost::system::error_code &) {
    current_string_val.append(s.data(), s.size());

    if (building_city && current_key == "name") {
      current_city.name = current_string_val;
    } else if (in_state_object && current_key == "name") {
      state_info[0] = current_string_val;
    } else if (in_state_object && current_key == "iso2") {
      state_info[1] = current_string_val;
    } else if (in_country_object && current_key == "name") {
      country_info[0] = current_string_val;
    } else if (in_country_object && current_key == "iso2") {
      country_info[1] = current_string_val;
    } else if (in_country_object && current_key == "iso3") {
      country_info[2] = current_string_val;
    }

    current_string_val.clear();
    return true;
  }

  bool on_number_part(boost::json::string_view, boost::system::error_code &) {
    return true;
  }

  bool on_int64(int64_t i, boost::json::string_view,
                boost::system::error_code &) {
    if (building_city && current_key == "id") {
      current_city.id = static_cast<int>(i);
    } else if (in_state_object && current_key == "id") {
      current_state_id = static_cast<int>(i);
    } else if (in_country_object && current_key == "id") {
      current_country_id = static_cast<int>(i);
    }
    return true;
  }

  bool on_uint64(uint64_t u, boost::json::string_view,
                 boost::system::error_code &ec) {
    return on_int64(static_cast<int64_t>(u), "", ec);
  }

  bool on_double(double d, boost::json::string_view,
                 boost::system::error_code &) {
    if (building_city) {
      if (current_key == "latitude") {
        current_city.latitude = d;
      } else if (current_key == "longitude") {
        current_city.longitude = d;
      }
    }
    return true;
  }

  bool on_bool(bool, boost::system::error_code &) { return true; }
  bool on_null(boost::system::error_code &) { return true; }
  bool on_comment_part(boost::json::string_view, boost::system::error_code &) {
    return true;
  }
  bool on_comment(boost::json::string_view, boost::system::error_code &) {
    return true;
  }
};

void StreamingJsonParser::Parse(
    const std::string &file_path, SqliteDatabase &db,
    std::function<void(const CityRecord &)> on_city,
    std::function<void(size_t, size_t)> on_progress) {

  spdlog::info("  Streaming parse of {} (Boost.JSON)...", file_path);

  FILE *file = std::fopen(file_path.c_str(), "rb");
  if (!file) {
    throw std::runtime_error("Failed to open JSON file: " + file_path);
  }

  size_t total_size = 0;
  if (std::fseek(file, 0, SEEK_END) == 0) {
    long file_size = std::ftell(file);
    if (file_size > 0) {
      total_size = static_cast<size_t>(file_size);
    }
    std::rewind(file);
  }

  CityRecordHandler::ParseContext ctx{&db,        on_city, on_progress, 0,
                                      total_size, 0,      0};
  boost::json::basic_parser<CityRecordHandler> parser(
      boost::json::parse_options{}, ctx);

  char buf[65536];
  size_t bytes_read;
  boost::system::error_code ec;

  while ((bytes_read = std::fread(buf, 1, sizeof(buf), file)) > 0) {
    char const *p = buf;
    std::size_t remain = bytes_read;

    while (remain > 0) {
      std::size_t consumed = parser.write_some(true, p, remain, ec);
      if (ec) {
        std::fclose(file);
        throw std::runtime_error("JSON parse error: " + ec.message());
      }
      p += consumed;
      remain -= consumed;
    }
  }

  parser.write_some(false, nullptr, 0, ec); // Signal EOF
  std::fclose(file);

  if (ec) {
    throw std::runtime_error("JSON parse error at EOF: " + ec.message());
  }

  spdlog::info("    OK: Parsed {} countries, {} states, {} cities",
               ctx.countries_inserted, ctx.states_inserted, ctx.cities_emitted);
}
