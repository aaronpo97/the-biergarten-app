#include "json_loader.h"
#include "stream_parser.h"
#include "work_queue.h"
#include <atomic>
#include <chrono>
#include <spdlog/spdlog.h>
#include <thread>
#include <vector>

void JsonLoader::LoadWorldCities(const std::string &jsonPath,
                                 SqliteDatabase &db) {
  auto startTime = std::chrono::high_resolution_clock::now();
  spdlog::info("\nLoading {} (streaming RapidJSON SAX + producer-consumer)...",
               jsonPath);

  const unsigned int QUEUE_CAPACITY = 1000;
  WorkQueue<CityRecord> queue(QUEUE_CAPACITY);

  spdlog::info("Creating worker thread pool...");

  unsigned int numWorkers = std::thread::hardware_concurrency();
  if (numWorkers == 0)
    numWorkers = 4; // Fallback if unavailable
  spdlog::info("  Spawning {} worker threads", numWorkers);

  std::vector<std::thread> workers;
  std::atomic<unsigned long> citiesProcessed{0};

  for (unsigned int i = 0; i < numWorkers; ++i) {
    workers.push_back(std::thread([&]() {
      unsigned long localCount = 0;
      while (auto record = queue.pop()) {
        db.InsertCity(record->id, record->state_id, record->country_id,
                      record->name, record->latitude, record->longitude);
        localCount++;
      }
      citiesProcessed += localCount;
    }));
  }

  spdlog::info("Streaming cities into worker queue...");

  unsigned long totalCities = 0;
  StreamingJsonParser::Parse(
      jsonPath, db, [&](const CityRecord &record) { queue.push(record); },
      [&](size_t current, size_t total) {
        if (current % 10000 == 0 && current > 0) {
          spdlog::info("  [Progress] Parsed {} cities...", current);
        }
        totalCities = current;
      });

  spdlog::info("  OK: Parsed all cities from JSON");

  queue.shutdown_queue();

  spdlog::info("Waiting for worker threads to complete...");
  for (auto &worker : workers) {
    if (worker.joinable()) {
      worker.join();
    }
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
  spdlog::info("Worker pool:     {} threads", numWorkers);
  spdlog::info("Queue capacity:  {}", QUEUE_CAPACITY);
  spdlog::info("=======================================\n");
}
