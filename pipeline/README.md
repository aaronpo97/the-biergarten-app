# Biergarten Pipeline

Biergarten Pipeline is a C++20 command-line pipeline that samples city records from local JSON, enriches each city with Wikipedia context, and generates bilingual brewery names and descriptions with either a local GGUF model or a deterministic mock generator.

## Key Components

- `src/main.cc` wires dependencies with Boost.DI.
- `JsonLoader` validates the curated location input.
- `WikipediaService` caches extracts and returns empty context when a lookup fails.
- `LlamaGenerator` formats prompts for Gemma 4, retries malformed output, and validates JSON before accepting it.
- `MockGenerator` emits repeatable output for demos and smoke tests.
- Brewery payloads include English and local-language name and description fields.

A structural overview is available in [biergarten_pipeline.puml](biergarten_pipeline.puml).

## How It Fits The Main App

The parent app uses this pipeline as brewery seed data. Planned brewery discovery, reviews, follows, and map features use the records it emits.

The planned brewery features called out in the parent README map directly to the output this pipeline produces:

| Planned app area                 | Pipeline contribution                                                     |
| -------------------------------- | ------------------------------------------------------------------------- |
| Brewery discovery and management | Sampled city records, localized brewery names, and long-form descriptions |
| Beer reviews and ratings         | Stable brewery fixtures with enough context to anchor review pages        |
| Social follow relationships      | Repeatable brewery entities for feeds, follows, and saved lists           |
| Geospatial brewery experiences   | Latitude, longitude, and country-level metadata                           |
| Additional frontend routes       | Deterministic fixture data for Storybook, demos, and browser tests        |

The pipeline stays outside the web app runtime. That leaves room for a future import job, seed step, or fixture loader.

## Tested Hardware & OS

The local model path was run on both Apple Silicon and discrete-GPU Linux hardware.

### ARM macOS, M1 Pro

- **Host**: MacBook Pro 14" (2021)
- **CPU**: Apple M1 Pro (8-core)
- **GPU**: Apple M1 Pro (14-core) integrated GPU
- **Memory**: 16 GB
- **Model**: Gemma 4 E4B
- **Inference**: llama.cpp with Metal support

### x86_64 Linux, NVIDIA RTX 2000

- **Host**: ThinkPad P1 Gen 7 (Fedora 43)
- **CPU**: Intel Core Ultra 7 155H
- **GPU**: NVIDIA RTX 2000 Ada Generation
- **Memory**: 32 GB
- **Model**: Gemma 4 E4B
- **Inference**: llama.cpp with CUDA 12.x support

## Pipeline

| Stage    | Implementation                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| Load     | `JsonLoader::LoadLocations()` reads `locations.json` into typed `Location` records.                            |
| Sample   | `BiergartenDataGenerator::QueryCitiesWithCountries()` samples up to 50 locations per run.                      |
| Enrich   | `WikipediaService` looks up city and beer context and keeps going when a lookup fails.                         |
| Generate | `MockGenerator` or `LlamaGenerator` produces brewery names and descriptions in English and the local language. |
| Log      | `spdlog` writes results and warnings to the console.                                                           |

If enrichment or generation fails for a city, the pipeline skips that city and continues with the rest.

## Runtime Behaviour

- `WikipediaService` queries city, country, and beer-related Wikipedia extracts, then caches the first successful response for each query string.
- `GetLocationContext()` returns an empty string when the web client is unavailable or when lookup/parsing fails, so the pipeline can continue.
- `LlamaGenerator` validates the model output as structured JSON and retries malformed responses up to three times.
- If the model output looks truncated, the retry path raises the token budget before trying again.
- `MockGenerator` uses stable hashes so the same city input produces the same brewery result every time.

## Tech Stack

- C++20
- CMake 3.24+
- Boost.JSON
- Boost.ProgramOptions
- Boost.DI
- spdlog
- libcurl
- llama.cpp

The build fetches Boost.DI, spdlog, and llama.cpp through CMake. The current configuration targets macOS and Linux; Metal is enabled on Apple Silicon, and CUDA or HIP/ROCm is detected on Linux when the toolkit is present.

## Code Style

The codebase uses modern C++20, RAII for ownership, `std::unique_ptr` for injected dependencies, `std::optional` for parse outcomes, `std::span` for read-only views over generated city data, and structured bindings in the pipeline loops.

Formatting follows the Google C++ Style Guide via `.clang-format`, with a narrow column limit and two-space indentation.

## Build

Requirements:

- C++20 compiler
- CMake 3.24 or newer
- libcurl
- Boost with JSON and Program Options components installed

```bash
cmake -S . -B build
cmake --build build
```

## Model

If you plan to run the model-backed path, create a `models/` directory and download the GGUF file there. Skip this step if you only want `--mocked`.

```bash
mkdir -p models
curl -L \
  -o models/google_gemma-4-E4B-it-Q6_K.gguf \
  https://huggingface.co/bartowski/google_gemma-4-E4B-it-GGUF/resolve/main/google_gemma-4-E4B-it-Q6_K.gguf?download=true
```

## Run

Run the executable from the `build/` directory so the copied `locations.json` and `prompts/` directory are available.

```bash
./biergarten-pipeline --mocked
./biergarten-pipeline --model models/google_gemma-4-E4B-it-Q6_K.gguf --temperature 1.0 --top-p 0.95 --top-k 64 --n-ctx 8192 --seed -1
```

## CLI Flags

| Flag            | Purpose                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| `--mocked`      | Uses the deterministic mock generator instead of loading a model.                                               |
| `--model, -m`   | Path to a GGUF model file, such as `models/google_gemma-4-E4B-it-Q6_K.gguf`. Required unless `--mocked` is set. |
| `--temperature` | Sampling temperature. Default: `1.0`. Ignored when `--mocked` is set.                                           |
| `--top-p`       | Nucleus sampling parameter. Default: `0.95`. Ignored when `--mocked` is set.                                    |
| `--top-k`       | Top-k sampling parameter. Default: `64`. Ignored when `--mocked` is set.                                        |
| `--n-ctx`       | Context window size. Default: `8192`. Ignored when `--mocked` is set.                                           |
| `--seed`        | Random seed. Default: `-1`, which selects a random seed at runtime. Ignored when `--mocked` is set.             |
| `--help, -h`    | Prints the usage text and exits.                                                                                |

`--mocked` and `--model` are mutually exclusive. If neither is provided, the program exits with an error before the pipeline starts.

The post-build step copies `prompts/` into `build/prompts/`, so rebuild after changing [prompts/system.md](prompts/system.md).

## Generated Output

Each successful run stores a `GeneratedBrewery` pair with the source location and a `BreweryResult` payload.

| Field               | Meaning                                    |
| ------------------- | ------------------------------------------ |
| `name_en`           | Brewery name in English.                   |
| `description_en`    | Brewery description in English.            |
| `name_local`        | Brewery name in the local language.        |
| `description_local` | Brewery description in the local language. |

The final log dump also includes the city, country, state or province, ISO subdivision code, latitude, and longitude for each generated entry.

## Consumer Data Shape

| Field                               | Why it matters to the app                         |
| ----------------------------------- | ------------------------------------------------- |
| `city`, `state_province`, `country` | Human-readable location labels and page headings  |
| `iso3166_1`, `iso3166_2`            | Filtering, regional grouping, and locale matching |
| `latitude`, `longitude`             | Map pins and nearby brewery views                 |
| `local_languages`                   | Locale-aware copy selection                       |
| `name_en`, `description_en`         | Default English display content                   |
| `name_local`, `description_local`   | Local-language display content                    |
| `region_context`                    | Richer copy for cards and detail screens          |

## Fixture Strategy

- Use `--mocked` for stable fixtures and repeatable screenshots.
- Use `--model` when you want geographically grounded content for demos.
- Keep `locations.json` structured enough to support discovery and future filtering.
- Rebuild after prompt changes so `build/prompts/system.md` stays aligned with the source prompt.
- Treat the generated output as seed material for the app's brewery domain.

## Next Steps

The current pipeline produces city-aware brewery records. The next pass should add user, beer, check-in, and rating fixtures so the app can exercise more of the brewery domain without live data.

### User Generation

- Generate user profiles with stable names, bios, locale hints, and preference signals.
- Keep the output deterministic for screenshots and Storybook runs, while still allowing larger randomized batches.
- Include stable IDs so downstream fixtures can join on users.
- Shape user data so it can support auth demos, follows, saved lists, and profile pages later.

### Beer Generation

- Generate beer catalog entries with style, ABV, IBU, color, aroma notes, and food pairing hints.
- Link beers back to breweries and cities so the app can build detail pages, related-content panels, and filtered views.
- Keep brewery references and style metadata aligned with the rest of the fixture data.
- Keep style coverage wide enough to exercise search, sort, and category filters.

### Check-In System

- Produce check-in events as timestamped interactions between users and breweries.
- Use a J-curve-like activity profile: a small set of users should account for most check-ins, while the rest appear only occasionally.
- Add bursty behavior around weekends, travel, and brewery-heavy periods so the event stream resembles real usage.
- Keep repeated visits to a smaller subset of breweries so popularity and recency views have something meaningful to rank.

### Beer Ratings

- Generate rating events with a strong positive skew and a long tail of lower scores.
- Avoid uniform distributions; the data should cluster around common values while still leaving room for outliers.
- Attach timestamps and user IDs so the app can compute aggregates, trends, and recent-activity views.
- Keep enough history to support average ratings, rating counts, and per-style comparisons.

## Suggested Code Tour

- `src/main.cc` handles argument parsing and the dependency-injection composition root.
- `src/biergarten_data_generator/` contains the orchestration, sampling, and logging flow.
- `src/services/wikipedia/` contains the enrichment service and its cache.
- `src/data_generation/llama/` contains local inference, prompt loading, and output validation.
- `src/data_generation/mock/` contains the deterministic fallback path.
- `includes/` holds the public interfaces and data models.

## Repo Layout

| Path                       | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `includes/`                | Public headers and shared models.                 |
| `src/`                     | Implementation files.                             |
| `locations.json`           | Curated city input copied into the build tree.    |
| `prompts/`                 | System prompt text used by the model-backed path. |
| `biergarten_pipeline.puml` | Class and composition diagram.                    |
