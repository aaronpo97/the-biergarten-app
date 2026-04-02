Biergarten Pipeline

Overview

The pipeline orchestrates five key stages:

Download: Fetches countries+states+cities.json from a pinned GitHub commit with optional local caching.

Parse: Streams JSON using Boost.JSON's basic_parser to extract country/state/city records without loading the entire file into memory.

Buffer: Routes city records through a bounded concurrent queue to decouple parsing from writes.

Store: Inserts records with concurrent thread safety using an in-memory SQLite database.

Generate: Produces mock brewery metadata for a sample of cities (mockup for future LLM integration).

Architecture

Data Sources and Formats

Hierarchical structure: countries array → states per country → cities per state.

Fields: id (integer), name (string), iso2 / iso3 (codes), latitude / longitude.

Sourced from: dr5hn/countries-states-cities-database on GitHub.

Output: Structured SQLite in-memory database + console logs via spdlog.

Concurrency Architecture

The pipeline splits work across parsing and writing phases:

Main Thread:
parse_sax() -> Insert countries (direct)
-> Insert states (direct)
-> Push CityRecord to WorkQueue

Worker Threads (implicit; pthread pool via sqlite3):
Pop CityRecord from WorkQueue
-> InsertCity(db) with mutex protection

Key synchronization primitives:

WorkQueue<T>: Bounded (default 1024 items) concurrent queue with blocking push/pop, guarded by mutex + condition variables.

SqliteDatabase::dbMutex: Serializes all SQLite operations to avoid SQLITE_BUSY and ensure write safety.

Backpressure: When the WorkQueue fills (≥1024 city records pending), the parser thread blocks until workers drain items.

Component Responsibilities

Component

Purpose

Thread Safety

DataDownloader

GitHub fetch with curl; optional filesystem cache; handles retries and ETags.

Blocking I/O; safe for single-threaded startup.

StreamingJsonParser

Subclasses boost::json::basic_parser; emits country/state/city via callbacks; tracking parse depth.

Single-threaded parse phase; thread-safe callbacks.

JsonLoader

Wraps parser; runs country/state/city callbacks; manages WorkQueue lifecycle.

Produces to WorkQueue; consumes from callbacks.

SqliteDatabase

In-memory schema; insert/query methods; mutex-protected SQL operations.

Mutex-guarded; thread-safe concurrent inserts.

LlamaBreweryGenerator

Mock brewery text generation using deterministic seed-based selection.

Stateless; thread-safe method calls.

Database Schema

SQLite in-memory database with three core tables:

Countries

CREATE TABLE countries (
id INTEGER PRIMARY KEY,
name TEXT NOT NULL,
iso2 TEXT,
iso3 TEXT
);
CREATE INDEX idx_countries_iso2 ON countries(iso2);

States

CREATE TABLE states (
id INTEGER PRIMARY KEY,
country_id INTEGER NOT NULL,
name TEXT NOT NULL,
iso2 TEXT,
FOREIGN KEY (country_id) REFERENCES countries(id)
);
CREATE INDEX idx_states_country ON states(country_id);

Cities

CREATE TABLE cities (
id INTEGER PRIMARY KEY,
state_id INTEGER NOT NULL,
country_id INTEGER NOT NULL,
name TEXT NOT NULL,
latitude REAL,
longitude REAL,
FOREIGN KEY (state_id) REFERENCES states(id),
FOREIGN KEY (country_id) REFERENCES countries(id)
);
CREATE INDEX idx_cities_state ON cities(state_id);
CREATE INDEX idx_cities_country ON cities(country_id);

Configuration and Extensibility

Command-Line Arguments

Boost.Program_options provides named CLI arguments:

./biergarten-pipeline [options]

Arg

Default

Purpose

--model, -m

""

Path to LLM model (mock implementation used if left blank).

--cache-dir, -c

/tmp

Directory for cached JSON DB.

--commit

c5eb7772

Git commit hash for consistency (stable 2026-03-28 snapshot).

--help, -h

-

Show help menu.

Examples:

./biergarten-pipeline
./biergarten-pipeline --model ./models/llama.gguf --cache-dir /var/cache
./biergarten-pipeline -c /tmp --commit v1.2.3

Building and Running

Prerequisites

C++23 compiler (g++, clang, MSVC).

CMake 3.20+.

curl (for HTTP downloads).

sqlite3.

Boost 1.75+ (requires Boost.JSON and Boost.Program_options).

spdlog (fetched via CMake FetchContent).

Build

mkdir -p build
cd build
cmake ..
cmake --build . --target biergarten-pipeline -- -j

Run

./biergarten-pipeline

Output: Logs to console; caches JSON in /tmp/countries+states+cities.json.

Code Style and Static Analysis

This project is configured to use:

- clang-format with the Google C++ style guide (via .clang-format)
- clang-tidy checks focused on Google, modernize, performance, and bug-prone rules (via .clang-tidy)

After configuring CMake, use:

cmake --build . --target format

to apply formatting, and:

cmake --build . --target format-check

to validate formatting without modifying files.

clang-tidy runs automatically on the biergarten-pipeline target when available. You can disable it at configure time:

cmake -DENABLE_CLANG_TIDY=OFF ..

You can also disable format helper targets:

cmake -DENABLE_CLANG_FORMAT_TARGETS=OFF ..
