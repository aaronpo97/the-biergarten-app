# Biergarten Pipeline

Biergarten Pipeline is a C++23 command-line tool that reads a local city list, resolves contextual enrichment for each sampled city through an injected service, and generates brewery names and descriptions. The current code samples up to four locations per run, then uses either a local GGUF model or the mock generator to produce the output.

## Pipeline

| Stage    | What happens                                                            |
| -------- | ----------------------------------------------------------------------- |
| Load     | Reads `locations.json` and picks up to four city/country pairs.         |
| Enrich   | Calls the injected enrichment service for each sampled city.            |
| Generate | Passes the city, country, and gathered context to the active generator. |
| Log      | Writes the generated breweries and any warnings through `spdlog`.       |

If an enrichment lookup throws, the pipeline skips that city and keeps going. If the lookup returns an empty string, the city stays in the pipeline and is still passed to the generator.

## Core Components

| Component               | Role                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| BiergartenDataGenerator | Orchestrates loading, enrichment lookup, generation, and logging.      |
| IEnrichmentService      | Abstraction for location-context providers.                            |
| WikipediaService        | Default enrichment provider backed by Wikipedia and in-memory caching. |
| LlamaGenerator          | Runs local GGUF inference and validates output.                        |
| MockGenerator           | Produces deterministic fallback data without a model.                  |
| JsonLoader              | Parses the local `locations.json` file.                                |
| CURLWebClient           | Handles HTTP requests to Wikipedia.                                    |

## Build

| Requirement          | Notes                                                                      |
| -------------------- | -------------------------------------------------------------------------- |
| C++23 compiler       | GCC 13+ or Clang 16+ are good starting points.                             |
| CMake                | Version 3.24 or newer.                                                     |
| libcurl              | Required for Wikipedia requests.                                           |
| Optional GPU tooling | CUDA on NVIDIA, HIP/ROCm on supported AMD systems, Metal on Apple Silicon. |

Boost, Boost.DI, spdlog, and llama.cpp are fetched by CMake. On Apple Silicon, Metal is enabled automatically. On Linux, the build looks for CUDA or HIP/ROCm when the matching toolkit is present. Windows is not supported.

```bash
cmake -S . -B build
cmake --build build
```

If the dependency build fails on macOS, check the repo build notes.

## Run

Run the executable from the build directory so the copied `locations.json` is available.

```bash
./biergarten-pipeline --mocked
./biergarten-pipeline --model /path/to/model.gguf --temperature 0.8 --top-p 0.92 --n-ctx 8192 --seed -1
```

| Flag            | Purpose                                      |
| --------------- | -------------------------------------------- |
| `--mocked`      | Uses the mock generator instead of a model.  |
| `--model, -m`   | Path to a GGUF model file.                   |
| `--temperature` | Sampling temperature. Default: `0.8`.        |
| `--top-p`       | Nucleus sampling parameter. Default: `0.92`. |
| `--n-ctx`       | Context window size. Default: `8192`.        |
| `--seed`        | Random seed. Default: `-1`.                  |
| `--help, -h`    | Prints usage.                                |

`--mocked` and `--model` are mutually exclusive. If neither is set, the program exits with an error. The sampling flags only matter when a model is loaded. The enrichment step is sequential now, and empty context is allowed.

## Layout

| Path             | Use                                         |
| ---------------- | ------------------------------------------- |
| `includes/`      | Public headers.                             |
| `src/`           | Implementation files.                       |
| `locations.json` | Input city list copied into the build tree. |
| `prompts/`       | Prompt text used by the model path.         |
