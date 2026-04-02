#include <chrono>

#include <spdlog/spdlog.h>

#include "json_loader.h"
#include "stream_parser.h"

void JsonLoader::LoadWorldCities(const std::string &jsonPath,
                                 SqliteDatabase &db) {
  constexpr size_t kBatchSize = 10000;

  auto startTime = std::chrono::high_resolution_clock::now();
  spdlog::info("\nLoading {} (streaming RapidJSON SAX)...", jsonPath);

  db.BeginTransaction();
  bool transactionOpen = true;

  size_t citiesProcessed = 0;
  try {
    StreamingJsonParser::Parse(
        jsonPath, db,
        [&](const CityRecord &record) {
          db.InsertCity(record.id, record.state_id, record.country_id,
                        record.name, record.latitude, record.longitude);
          ++citiesProcessed;

          if (citiesProcessed % kBatchSize == 0) {
            db.CommitTransaction();
            db.BeginTransaction();
          }
        },
        [&](size_t current, size_t /*total*/) {
          if (current % kBatchSize == 0 && current > 0) {
            spdlog::info("  [Progress] Parsed {} cities...", current);
          }
        });

    spdlog::info("  OK: Parsed all cities from JSON");

    if (transactionOpen) {
      db.CommitTransaction();
      transactionOpen = false;
    }
  } catch (...) {
    if (transactionOpen) {
      db.CommitTransaction();
    }
    throw;
  }

  auto endTime = std::chrono::high_resolution_clock::now();
  auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
      endTime - startTime);

  spdlog::info("\n=== World City Data Loading Summary ===\n");
  spdlog::info("Cities inserted: {}", citiesProcessed);
  spdlog::info("Elapsed time:    {} ms", duration.count());
  long long throughput =
      (citiesProcessed > 0 && duration.count() > 0)
          ? (1000LL * static_cast<long long>(citiesProcessed)) /
                static_cast<long long>(duration.count())
          : 0LL;
  spdlog::info("Throughput:      {} cities/sec", throughput);
  spdlog::info("=======================================\n");
}
