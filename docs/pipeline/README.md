---
title: Biergarten Pipeline — C++ CLI for generating seed data
last-updated: 2026-08-31
tags:
  - pipeline
  - cpp
  - llm
  - seed-data
  - docker
---

A C++20 command-line pipeline that samples city records from local JSON,
enriches each with Wikipedia context, and generates bilingual brewery names and
descriptions plus locale-grounded user profiles via a local GGUF model or a
deterministic mock.

> **This pipeline produces AI-generated data.** It is not a source of truth for
> brewing techniques, cultural representation, or local-language accuracy. See
> [ETHICS-AND-KNOWN-ISSUES.md](./ETHICS-AND-KNOWN-ISSUES.md) for full
> documentation of limitations, hallucination patterns, and bias.

---

## Table of contents

- [How it fits the main app](#how-it-fits-the-main-app)
- [Quick start](#quick-start)
  - [Build](#build)
  - [Model](#model)
  - [Run](#run)
- [Docker / RunPod](#docker--runpod)
- [Architecture](#architecture)
  - [Pipeline Stages](#pipeline-stages)
  - [Key Components](#key-components)
  - [Runtime Behaviour](#runtime-behaviour)
- [Generated output](#generated-output)
- [Tech stack](#tech-stack)
- [Tested hardware](#tested-hardware)
- [Fixture strategy](#fixture-strategy)
- [Repo layout](#repo-layout)
- [Code tour](#code-tour)
- [Next steps](#next-steps)

---

## How it fits the main app

The pipeline is a data ingestion layer. It sits outside the web app runtime and
produces seed records the app imports at startup or during a dedicated seed
step.

| Planned app area                 | Pipeline contribution                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Brewery discovery and management | Sampled city records, localized names, long-form descriptions                                     |
| Beer reviews and ratings         | Stable brewery fixtures with enough context to anchor review pages                                |
| Social follow relationships      | Repeatable brewery entities for feeds, follows, and saved lists                                   |
| Geospatial brewery experiences   | Latitude, longitude, and country-level metadata                                                   |
| User accounts and profiles       | Locale-grounded names, bios, and an auth-ready email/date-of-birth pair for seeding real accounts |

---

## Quick start

### Build

Requirements: C++20 compiler, CMake 3.31+, OpenSSL, Boost (JSON and
ProgramOptions). SQLite is fetched from the upstream amalgamation, so no system
SQLite package is required.

```bash
cmake -S . -B build
cmake --build build
```

CMake automatically detects whether a compatible llama.cpp installation is
present on the system (`libllama`, `libggml`, `libggml-base`, and `llama.h`
visible on the default search paths). If found, it links against those libraries
and skips the FetchContent build. If not found, it fetches and builds llama.cpp
from source at tag `b9012`. No additional flags are required in either case.

Metal is enabled automatically on Apple Silicon. CUDA or HIP/ROCm is detected
automatically on Linux when the relevant toolkit is present.

### Model

> Skip this step if you only need `--mocked`.

```bash
mkdir -p models
curl -L \
  -o models/google_gemma-4-E4B-it-Q6_K.gguf \
  https://huggingface.co/bartowski/google_gemma-4-E4B-it-GGUF/resolve/main/google_gemma-4-E4B-it-Q6_K.gguf?download=true
```

### Run

Run from `build/` so the copied `locations.json` and `prompts/` are available.
Each run writes a fresh dated SQLite file such as
`biergarten_seed_2026-04-19T15-30-45.123456Z.sqlite` into the working directory.

```bash
./biergarten-pipeline --mocked

./biergarten-pipeline \
  --model ../models/google_gemma-4-E4B-it-Q6_K.gguf \
  --prompt-dir prompts \
  --location-count 25 \
  --temperature 1.0 --top-p 0.95 --top-k 64 --n-ctx 8192 --seed -1
```

#### CLI flags

| Flag               | Purpose                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `--mocked`         | Deterministic mock generator, no model required.                                                             |
| `--model, -m`      | Path to a GGUF file. Required unless `--mocked` is set.                                                      |
| `--prompt-dir`     | Directory containing prompt files (for example, `BREWERY_GENERATION.md`). Required unless `--mocked` is set. |
| `--output, -o`     | Directory for generated SQLite artifacts. Default: `output`.                                                 |
| `--log-path`       | Path for application logs. Default: `pipeline.log`.                                                          |
| `--location-count` | Number of cities to sample from `locations.json` per run. Default: `10`.                                     |
| `--temperature`    | Sampling temperature. Default: `1.0`.                                                                        |
| `--top-p`          | Nucleus sampling. Default: `0.95`.                                                                           |
| `--top-k`          | Top-k sampling. Default: `64`.                                                                               |
| `--n-ctx`          | Context window size. Default: `8192`.                                                                        |
| `--seed`           | Random seed. Default: `-1` (random at runtime).                                                              |
| `--n-gpu-layers`   | Number of model layers to offload to GPU. Default: `0`.                                                      |
| `--help, -h`       | Print usage and exit.                                                                                        |

`--mocked` and `--model` are mutually exclusive. Omitting both exits with an
error before the pipeline starts. Sampling flags are ignored when `--mocked` is
set.

The post-build step copies `prompts/` into `build/prompts/`. Rebuild after
editing any prompt file.

---

## Docker / RunPod

The `tooling/pipeline/runpod/` directory contains a GPU-ready container
configuration for running the pipeline on RunPod or any Docker host with an
NVIDIA GPU.

### How it works

The container uses a two-stage build. The builder stage installs CMake/Ninja,
clones the matching llama.cpp release tag for its headers only (installed into
`/usr/local/include`), and copies prebuilt shared libraries (`libllama`,
`libggml`, and CUDA/CPU backend plugins) from
`ghcr.io/ggml-org/llama.cpp:full-cuda` into `/usr/local/lib`. With both headers
and libraries present, CMake's system-library detection (see [Build](#build)
above) finds them and skips the FetchContent source build, keeping image build
times short.

The runtime stage copies the compiled binary, the same prebuilt shared
libraries, and config/prompt assets into a slim CUDA runtime image. It sets
`LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH` so the dynamic linker resolves
`libllama`/`libggml` at startup, and also co-locates `libggml-cuda.so` and the
CPU backend plugins next to the binary for `ggml_backend_load_all()`'s `dlopen`
scan.

### Build the image

Run from the `tooling/pipeline/` directory (the CMake project root), not from
inside `runpod/`, so the `COPY . .` step picks up the full project context.

```bash
docker build -t biergarten-pipeline:latest -f runpod/Dockerfile .
```

To monitor the full build output and confirm CMake selects the system llama.cpp:

```bash
docker build \
  --progress=plain \
  --no-cache \
  -t biergarten-pipeline:latest \
  -f runpod/Dockerfile \
  . 2>&1 | tee build.log
```

Look for `[biergarten] Found system llama.cpp — skipping FetchContent` in the
output to confirm the fast path was taken.

### Run the container

The container always runs the model-backed path; there is no `--mocked`
container mode (use a native build for that; see [Quick start](#quick-start)).
The entrypoint, `runpod/start.sh`, downloads the GGUF model automatically if it
is not already present at the configured path.

```bash
docker run --rm \
  --runtime=nvidia \
  -v "$PWD/models:/workspace/models" \
  -v "$PWD/output:/workspace/output" \
  -v "$PWD/logs:/workspace/logs" \
  biergarten-pipeline:latest
```

By default this downloads `google_gemma-4-E4B-it-Q6_K.gguf` to `./models/` on
first run if it isn't already there. To use a pre-downloaded model, place it at
that path first; see [Model](#model).

#### Environment variables

| Variable                                                                                                | Purpose                                                                        |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `BIERGARTEN_MODEL_PATH`                                                                                 | GGUF model path. Default: `/workspace/models/google_gemma-4-E4B-it-Q6_K.gguf`. |
| `BIERGARTEN_OUTPUT_DIR`                                                                                 | SQLite output directory. Default: `/workspace/output`.                         |
| `BIERGARTEN_LOG_PATH`                                                                                   | Log file path. Default: `/workspace/logs/pipeline.log`.                        |
| `BIERGARTEN_GL_LAYERS`                                                                                  | GPU layers to offload (`--n-gpu-layers`). Default: `40`.                       |
| `BIERGARTEN_TEMPERATURE`, `BIERGARTEN_TOP_P`, `BIERGARTEN_TOP_K`, `BIERGARTEN_N_CTX`, `BIERGARTEN_SEED` | Optional sampling overrides, unset by default (binary defaults apply).         |
| `BIERGARTEN_EXTRA_ARGS`                                                                                 | Additional raw CLI args appended verbatim.                                     |

`--prompt-dir` is hardcoded to `/app/prompts` inside the container and is not
configurable via environment variable.

### RunPod deployment

Use a GPU pod template. Mount persistent storage for `/workspace/models`,
`/workspace/output`, and `/workspace/logs`. See
`tooling/pipeline/runpod/pod-template.yaml` for a starter template; set the
environment variables listed in [Environment variables](#environment-variables)
to match your run.

---

## Architecture

### Pipeline stages

| Stage              | Implementation                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Load               | `ICuratedDataService` (`CuratedJsonDataService`) reads `locations.json`, `personas.json`, `forenames-by-country.json`, and `surnames-by-country.json` (paths supplied via a `CuratedDataFilePaths` DTO at construction) into typed records, caching each after its first load. `--mocked` runs use `MockCuratedDataService`'s fixed in-memory dataset instead. |
| Sample             | `BiergartenPipelineOrchestrator::QueryCitiesWithCountries()` samples `--location-count` locations per run (default `10`).                                                                                                                                                                                                                                      |
| Enrich             | `WikipediaEnrichmentService` fetches brewing and beer-related context. Keeps going when a lookup fails. `--mocked` runs use `MockEnrichmentService` instead and skip Wikipedia entirely.                                                                                                                                                                       |
| Generate Users     | `GenerateUsers()` samples a persona and a forename/surname pair per enriched city (skipping countries with no name data), then `MockGenerator` or `LlamaGenerator` produces a username, bio, and activity weight around the sampled name.                                                                                                                      |
| Generate Breweries | `MockGenerator` or `LlamaGenerator` produces brewery names and descriptions in English and the local language.                                                                                                                                                                                                                                                 |
| Store              | `SqliteExportService` writes each successful user and brewery into a fresh dated `.sqlite` database with normalized `locations`, `users`, and `breweries` tables.                                                                                                                                                                                              |
| Log                | `spdlog` writes results and warnings to the console.                                                                                                                                                                                                                                                                                                           |

If name sampling, enrichment, or generation fails for a city, that city is
skipped and the pipeline continues. `GenerateUsers()` runs before
`GenerateBreweries()` in `BiergartenPipelineOrchestrator::Run()`.

### Key components

- `src/main.cc`: argument parsing and Boost.DI composition root.
- `CuratedJsonDataService`: implements `ICuratedDataService`; takes a
  `CuratedDataFilePaths` DTO (locations/personas/forenames/surnames paths) in
  its constructor, then parses and validates curated location, persona, and
  forename/surname JSON, memoizing each result after its first load on a given
  instance. `MockCuratedDataService` is the in-memory substitute (4 fixed
  locations, 3 personas, and name data for `US`/`DE`/`FR`/`BE`) used in
  `--mocked` runs.
- `WikipediaEnrichmentService`: queries Wikipedia extracts, caches results,
  returns empty context on failure. `MockEnrichmentService` is the no-op
  substitute used in `--mocked` runs.
- `LlamaGenerator`: formats prompts for Gemma 4, validates JSON output for both
  `GenerateBrewery` and `GenerateUser`, retries malformed responses up to three
  times with corrective feedback in the retry prompt. The token budget is fixed
  across attempts; it is not raised automatically on truncation.
- `MockGenerator`: stable hash-based output so the same city/persona/name input
  always produces the same brewery or user.
- `SqliteExportService`: creates a dated SQLite file per run and persists each
  successful user and brewery into normalized tables.
- Brewery payloads include English and local-language name and description
  fields. User payloads carry a sampled first/last name and gender, an
  LLM-generated username/bio/activity weight, and a programmatically generated
  (not LLM-authored) unique email and date of birth.

### Runtime behaviour

`WikipediaEnrichmentService` fetches two Wikipedia extracts per city: a generic
"brewing" extract and a "beer in `{country}`" extract. It does not currently
query a city- or region-specific page. Each query string is cached after its
first successful (or empty) lookup.

`GetLocationContext()` returns an empty string when the web client is
unavailable or when lookup/parsing fails.

`LlamaGenerator` validates model output as structured JSON. On validation
failure it retries up to three times, replaying the previous error message in
the next prompt so the model can self-correct. All runs to date have produced
valid output on the first pass; the retry path is kept for resilience.

`MockGenerator` uses stable hashes for repeatable output in demos and Storybook
runs.

`CuratedJsonDataService` memoizes each of `LoadLocations()`, `LoadPersonas()`,
`LoadForenamesByCountry()`, and `LoadSurnamesByCountry()` independently the
first time each is called, since `BiergartenPipelineOrchestrator` owns a single
`ICuratedDataService` instance for the whole run; later calls return the cached
result instead of re-parsing.

`GenerateUsers()` samples a forename/surname pair per city via `SampleName()`,
keyed by the city's ISO 3166-1 code. Countries present in `locations.json` but
absent from either name fixture (currently `KE`, `SE`, `SG`, `TH`, `VN`, `ZA`)
are skipped, the same way a failed enrichment or generation call skips a city;
see ETHICS-AND-KNOWN-ISSUES.md's Names-by-Country Dataset section.

### Process flow - activity diagram

See [Activity diagram](./diagrams/current/activity.md).

### Architectural overview - class diagram

See [Class diagram](./diagrams/current/class.md).

---

## Generated output

Each successful run stores a `BreweryRecord` pair with the source location and a
`BreweryResult` payload, and a `UserRecord` pair with the source location and a
`UserResult` payload. The same generated records are also written to a fresh
SQLite export file named with the current UTC timestamp.

| Field               | Meaning                                    |
| ------------------- | ------------------------------------------ |
| `name_en`           | Brewery name in English.                   |
| `description_en`    | Brewery description in English.            |
| `name_local`        | Brewery name in the local language.        |
| `description_local` | Brewery description in the local language. |

| Field             | Meaning                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| `first_name`      | Sampled forename, copied from the curated name data (not LLM-invented).                |
| `last_name`       | Sampled surname, copied from the curated name data (not LLM-invented).                 |
| `gender`          | Gender associated with the sampled forename in the source dataset.                     |
| `username`        | LLM-generated handle.                                                                  |
| `bio`             | LLM-generated short biography.                                                         |
| `activity_weight` | Relative check-in/activity weight, reserved for a future J-curve activity profile.     |
| `email`           | Unique `@thebiergarten.app` address, generated programmatically from the sampled name. |
| `date_of_birth`   | Randomized date of birth (age 19-48), generated programmatically.                      |

The log dump also includes city, country, state or province, ISO subdivision
code, latitude, and longitude for each entry.

### Consumer data shape

| Field                               | Why it matters                                   |
| ----------------------------------- | ------------------------------------------------ |
| `city`, `state_province`, `country` | Human-readable location labels and page headings |
| `iso3166_1`, `iso3166_2`            | Filtering, regional grouping, locale matching    |
| `latitude`, `longitude`             | Map pins and nearby brewery views                |
| `local_languages`                   | Locale-aware copy selection                      |
| `name_en`, `description_en`         | Default English display content                  |
| `name_local`, `description_local`   | Local-language display content                   |

---

## Tech stack

- C++20
- CMake 3.31+
- Boost.JSON, Boost.ProgramOptions, Boost.DI
- spdlog
- cpp-httplib (with OpenSSL)
- SQLite amalgamation fetched and compiled via CMake FetchContent
- llama.cpp (auto-detected from system install or fetched via FetchContent)
- Docker with NVIDIA CUDA 12.6 base image for GPU container builds
- RunPod for cloud GPU inference

The build fetches Boost.DI, spdlog, and SQLite via CMake. llama.cpp is fetched
only when a system installation is not detected. Metal is enabled on Apple
Silicon; CUDA or HIP/ROCm is detected on Linux when the toolkit is present.

> **Code style:** The code follows the Google C++ Style Guide, except that
> indentation is 3 spaces instead of Google's 2, and uses C++20 throughout.

---

## Tested hardware

### ARM macOS (M1 Pro)

|           |                                   |
| --------- | --------------------------------- |
| Host      | MacBook Pro 14" (2021)            |
| CPU       | Apple M1 Pro (8-core)             |
| GPU       | Apple M1 Pro (14-core integrated) |
| Memory    | 16 GB                             |
| Model     | Gemma 4 E4B                       |
| Inference | llama.cpp with Metal              |

### x86_64 Linux (NVIDIA RTX 2000)

|           |                                |
| --------- | ------------------------------ |
| Host      | ThinkPad P1 Gen 7 (Fedora 43)  |
| CPU       | Intel Core Ultra 7 155H        |
| GPU       | NVIDIA RTX 2000 Ada Generation |
| Memory    | 32 GB                          |
| Model     | Gemma 4 E4B                    |
| Inference | llama.cpp with CUDA 12.x       |

### x86_64 Linux (Docker / RunPod, NVIDIA CUDA)

|           |                                             |
| --------- | ------------------------------------------- |
| Host      | RunPod GPU pod                              |
| Base      | nvidia/cuda:12.6.3-devel-ubuntu24.04        |
| Model     | Gemma 4 E4B Q6_K                            |
| Inference | llama.cpp prebuilt CUDA backends via dlopen |

---

## Fixture strategy

- `--mocked` for stable fixtures, repeatable screenshots, and Storybook runs.
  `MockCuratedDataService` swaps in for `CuratedJsonDataService`, so no fixture
  files need to be present on disk.
- `--model` when geographically grounded content matters for demos.
- Keep `locations.json` structured enough to support discovery and future
  filtering.
- `personas.json`, `forenames-by-country.json`, and `surnames-by-country.json`
  are curated/vendored fixture data, not LLM-generated; see
  ETHICS-AND-KNOWN-ISSUES.md's Names-by-Country Dataset section for provenance.
- Treat SQLite output as seed material for the app's brewery and user domains,
  not production data.

---

## Repo layout

| Path                                         | Purpose                                                     |
| -------------------------------------------- | ----------------------------------------------------------- |
| `tooling/pipeline/includes/`                 | Public headers and shared models.                           |
| `tooling/pipeline/src/`                      | Implementation files.                                       |
| `tooling/pipeline/locations.json`            | Curated city input copied into the build tree.              |
| `tooling/pipeline/personas.json`             | Curated user persona archetypes copied into the build tree. |
| `tooling/pipeline/forenames-by-country.json` | Vendored (CC0) forename data by ISO 3166-1 country code.    |
| `tooling/pipeline/surnames-by-country.json`  | Vendored (CC0) surname data by ISO 3166-1 country code.     |
| `tooling/pipeline/prompts/`                  | System prompts used by the model-backed path.               |
| `tooling/pipeline/runpod/`                   | Dockerfile, launcher, and RunPod pod template.              |
| `docs/pipeline/diagrams/`                    | Architecture and pipeline diagrams.                         |
| `docs/pipeline/ETHICS-AND-KNOWN-ISSUES.md`   | Ethics, bias, hallucination analysis, mitigations.          |

---

## Code tour

Paths below are relative to `tooling/pipeline/`.

- `src/main.cc`: argument parsing and DI composition root.
- `src/biergarten_pipeline_orchestrator/`: orchestration, sampling, logging, and
  export.
- `src/services/curated_data/`: `CuratedJsonDataService`, the file-backed
  `ICuratedDataService`, and `MockCuratedDataService`, the in-memory
  `ICuratedDataService` used in `--mocked` runs.
- `src/services/enrichment/wikipedia/`: enrichment service and cache.
- `src/services/sqlite/`: SQLite export implementation.
- `src/data_generation/llama/`: local inference, prompt loading, output
  validation.
- `src/data_generation/mock/`: deterministic fallback.
- `runpod/`: container build and runtime launcher.

---

## Next steps

The pipeline currently produces city-aware brewery and user records and dated
SQLite exports. The next passes add additional fixture types so the app can
exercise the full brewery and social domains without live data. For the detailed
engineering breakdown of what's needed to reach the architecture in
[`diagrams/planned/`](./diagrams/planned/), see [ROADMAP.md](./ROADMAP.md).

### Testing (very high priority)

- Unit test JSON validation and retry logic against malformed, truncated, and
  empty model outputs.
- Integration test the enrichment pipeline with missing context, short context,
  and fake context inputs.
- Adversarial context tests: feed plausible but geographically incorrect
  Wikipedia extracts and verify the model does not silently blend them with
  training data.
- Verify bilingual enrichment behaviour when only an English extract is
  available versus when both extracts are present.
- Confirm the retry path is reachable when the reasoning block consumes
  available token budget.

### Beer generation

Generate catalog entries with style, ABV, IBU, color, aroma notes, and food
pairing hints. Link beers back to breweries and cities. Keep style coverage wide
enough to exercise search, sort, and category filters.

### Check-in system

Produce timestamped check-in events between users and breweries. Use a J-curve
activity profile: a small set of users accounts for most check-ins, the rest
appear occasionally. Add bursty behaviour around weekends and travel periods.

### Beer ratings

Generate rating events with a strong positive skew and a long tail of lower
scores. Avoid uniform distributions. Attach timestamps and user IDs so the app
can compute averages, trends, and per-style comparisons.
