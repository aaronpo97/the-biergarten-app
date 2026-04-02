#include "stream_parser.h"
#include "database.h"
#include <cstdio>
#include <rapidjson/filereadstream.h>
#include <rapidjson/reader.h>
#include <rapidjson/stringbuffer.h>
#include <spdlog/spdlog.h>

using namespace rapidjson;

class CityRecordHandler : public BaseReaderHandler<UTF8<>, CityRecordHandler> {
public:
  struct ParseContext {
    SqliteDatabase *db = nullptr;
    std::function<void(const CityRecord &)> on_city;
    std::function<void(size_t, size_t)> on_progress;
    size_t cities_emitted = 0;
    size_t total_file_size = 0;
    int countries_inserted = 0;
    int states_inserted = 0;
  };

  CityRecordHandler(ParseContext &ctx) : context(ctx) {}

  bool StartArray() {
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

  bool EndArray(SizeType /*elementCount*/) {
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

  bool StartObject() {
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

  bool EndObject(SizeType /*memberCount*/) {
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
          spdlog::warn("    WARN: Failed to emit city: {}", e.what());
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
          spdlog::warn("    WARN: Failed to insert state: {}", e.what());
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
          spdlog::warn("    WARN: Failed to insert country: {}", e.what());
        }
      }
      in_country_object = false;
    }

    depth--;
    return true;
  }

  bool Key(const char *str, SizeType len, bool /*copy*/) {
    current_key.assign(str, len);
    return true;
  }

  bool String(const char *str, SizeType len, bool /*copy*/) {
    if (building_city && current_key == "name") {
      current_city.name.assign(str, len);
    } else if (in_state_object && current_key == "name") {
      state_info[0].assign(str, len);
    } else if (in_state_object && current_key == "iso2") {
      state_info[1].assign(str, len);
    } else if (in_country_object && current_key == "name") {
      country_info[0].assign(str, len);
    } else if (in_country_object && current_key == "iso2") {
      country_info[1].assign(str, len);
    } else if (in_country_object && current_key == "iso3") {
      country_info[2].assign(str, len);
    }
    return true;
  }

  bool Int(int i) {
    if (building_city && current_key == "id") {
      current_city.id = i;
    } else if (in_state_object && current_key == "id") {
      current_state_id = i;
    } else if (in_country_object && current_key == "id") {
      current_country_id = i;
    }
    return true;
  }

  bool Uint(unsigned i) { return Int(static_cast<int>(i)); }

  bool Int64(int64_t i) { return Int(static_cast<int>(i)); }

  bool Uint64(uint64_t i) { return Int(static_cast<int>(i)); }

  bool Double(double d) {
    if (building_city) {
      if (current_key == "latitude") {
        current_city.latitude = d;
      } else if (current_key == "longitude") {
        current_city.longitude = d;
      }
    }
    return true;
  }

  bool Bool(bool /*b*/) { return true; }
  bool Null() { return true; }

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

  std::string country_info[3];
  std::string state_info[2];
};

void StreamingJsonParser::Parse(
    const std::string &filePath, SqliteDatabase &db,
    std::function<void(const CityRecord &)> onCity,
    std::function<void(size_t, size_t)> onProgress) {

  spdlog::info("  Streaming parse of {}...", filePath);

  FILE *file = std::fopen(filePath.c_str(), "rb");
  if (!file) {
    throw std::runtime_error("Failed to open JSON file: " + filePath);
  }

  size_t total_size = 0;
  if (std::fseek(file, 0, SEEK_END) == 0) {
    long file_size = std::ftell(file);
    if (file_size > 0) {
      total_size = static_cast<size_t>(file_size);
    }
    std::rewind(file);
  }

  CityRecordHandler::ParseContext ctx{&db,        onCity, onProgress, 0,
                                      total_size, 0,      0};
  CityRecordHandler handler(ctx);

  Reader reader;
  char buf[65536];
  FileReadStream frs(file, buf, sizeof(buf));

  if (!reader.Parse(frs, handler)) {
    ParseErrorCode errCode = reader.GetParseErrorCode();
    size_t errOffset = reader.GetErrorOffset();
    std::fclose(file);
    throw std::runtime_error(std::string("JSON parse error at offset ") +
                             std::to_string(errOffset) +
                             " (code: " + std::to_string(errCode) + ")");
  }

  std::fclose(file);

  spdlog::info("    OK: Parsed {} countries, {} states, {} cities",
               ctx.countries_inserted, ctx.states_inserted, ctx.cities_emitted);
}
