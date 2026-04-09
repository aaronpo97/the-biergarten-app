# Biergarten Pipeline

A C++23 tool for processing geographic data and generating brewery metadata. It utilizes a local city manifest, parallel Wikipedia enrichment via `std::async`, and local LLM inference via llama.cpp.

## Overview

The pipeline runs in four stages:

- **Query**: Loads and samples from a local `locations.json` file.
- **Enrich**: Fetches regional and cultural context from Wikipedia in parallel using `std::async`.
- **Generate**: Creates authentic brewery names and descriptions using a local GGUF model or a deterministic mock.
- **Log**: Outputs results and metadata summaries via spdlog.

## Implementation Details

### Concurrency

- **Async Enrichment**: Wikipedia API lookups are parallelized using `std::async`. Each city is processed in its own thread to hide network latency.
- **RAII**: Resource management for libcurl handles and llama.cpp weights is handled via constructors/destructors to ensure clean teardown.

### LLM Logic

- **Retries**: Includes a 3-attempt loop with automated error correction. If the model returns invalid JSON, the specific error is fed back into the next prompt.
- **Context Injection**: Wikipedia summaries are injected into the LLM system prompt to ensure descriptions are grounded in actual regional beer culture.
- **Sampling**: Temperature, top-p, and seeds are configurable via the CLI.

## Hardware & GPU Config

### Test Machines

#### x86/64 Linux, NVIDIA RTX 2000

- **Host**: ThinkPad P1 Gen 7 (Fedora 43)
- **CPU**: Intel Core Ultra 7 155H
- **GPU**: NVIDIA RTX 2000 Ada Generation
- **Memory**: 32GB
- **Model**: Qwen3-8B-Q6-K
- **Inference**: llama.cpp with CUDA 12.x support

#### ARM MacOS, M1 Pro

- **Host**: MacBook Pro 14" (2021)
- **CPU**: Apple M1 Pro (8-core)
- **GPU**: Apple M1 Pro (14-core) [Integrated]
- **Memory**: 16GB
- **Model**: Qwen3-8B-Q6-K
- **Inference**: llama.cpp with Metal (MPS) support

### GPU Build Flags

```bash
cmake -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=89 ..
cmake --build . --config Release
```

```zsh
cmake ..
cmake --build .
```

## Core Components

| Component               | Function                                                          |
| ----------------------- | ----------------------------------------------------------------- |
| BiergartenDataGenerator | Orchestrates the sampling, enrichment, and generation stages.     |
| WikipediaService        | Fetches and caches summaries for cities and regional beer styles. |
| LlamaGenerator          | Handles local GGUF inference and output validation.               |
| JsonLoader              | Parses the local `locations.json` file into internal structures.  |
| CURLWebClient           | libcurl wrapper for parallel Wikipedia API requests.              |

## CLI Options

```
./biergarten-pipeline --model ./path/to/model.gguf [options]
```

| Flag            | Description                                     |
| --------------- | ----------------------------------------------- |
| `--mocked`      | Use deterministic mock data instead of an LLM.  |
| `--model`, `-m` | Path to the GGUF file.                          |
| `--temperature` | Model temperature (0.0 - 1.0).                  |
| `--n-ctx`       | Context window size (default: 8192).            |
| `--cache-dir`   | Directory containing the `locations.json` file. |

## Building

### Requirements

- C++23 compiler (GCC 13+ / Clang 16+)
- CMake 3.20+
- Boost (JSON, Program_options), libcurl
- CUDA Toolkit 12.x (optional for GPU)

### Steps

```bash
mkdir build && cd build
cmake ..
cmake --build . -j$(nproc)
```
