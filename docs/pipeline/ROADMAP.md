# Pipeline Roadmap — Reaching the Planned Architecture

This is the engineering breakdown for closing the gap between the **current**
pipeline and the **planned** architecture documented in
[`diagrams/planned/class.puml`](./diagrams/planned/class.puml) and
[`diagrams/planned/activity.puml`](./diagrams/planned/activity.puml). Nothing
in `diagrams/planned/` is implemented yet — this file tracks what it would
take to get there. For the current implementation, see
[README.md](./README.md).

Items are grouped by layer and roughly ordered by dependency: later groups
build on types and services introduced earlier.

The only concurrency in the current pipeline is the log dispatcher thread
(`main.cc` spawns it to drain a `BoundedChannel<LogEntry>` into spdlog for the
whole run). Sampling, enrichment, generation, and export all happen
synchronously on the main thread inside `BiergartenPipelineOrchestrator::Run()`
— §6 below is what introduces the additional worker threads the planned
architecture needs.

---

## 1. Domain Models

`tooling/pipeline/includes/data_model/generated_models.h` and `models.h`.

- [ ] Add `Completeness` enum (`Full`, `Partial`, `Absent`) and a
      `LocationContext` struct (`text`, `completeness`, `char_count`).
      Replace `EnrichedCity::region_context` (currently a plain
      `std::string`) with `context : LocationContext`.
- [ ] Add `BeerStyle` (`name`, `description`, `min_abv`, `max_abv`,
      `min_ibu`, `max_ibu`).
- [ ] Add `BeerResult`, `CheckinResult`, `RatingResult` result payloads.
- [ ] Add `GenerationMetadata` (`generation_id`, `generated_time`,
      `context_provided`, `generated_with`).
- [ ] Add `activity_weight` to `UserResult` (currently just `username`,
      `bio`).
- [ ] Extend `GeneratedBrewery` with `brewery_id`, `context_completeness`,
      `metadata` (currently just `{location, brewery}`).
- [ ] Add `GeneratedBeer`, `GeneratedUser`, `GeneratedCheckin`,
      `GeneratedRating`, `GeneratedFollow` aggregate structs.
- [ ] Add `UserPersona` (`name`, `description`, `style_affinities`).

## 2. Data Preloading

`tooling/pipeline/includes/json_handling/`, fixture files.

- [ ] Extract a `DataPreloader` interface; have `JsonLoader` implement it
      instead of exposing only a static `LoadLocations()`.
- [ ] Add `LoadBeerStyles()`. `beer-styles.json` already exists in the repo
      and is already copied into the Docker image
      (`runpod/Dockerfile`), but no loader reads it yet, and the native
      CMake build doesn't copy it into `build/` at all — `CMakeLists.txt`'s
      "Runtime Assets" step only copies `locations.json` and `prompts/`.
- [ ] Add `LoadPersonas()` and author `personas.json` (doesn't exist yet).
- [ ] Add `LoadNamesByCountry()` and author `names-by-country.json` (doesn't
      exist yet).

## 3. Policy / Strategy Layer

Entirely new — no `includes/policy/` (or equivalent) directory exists today.

- [ ] `ContextStrategy` interface + `BreweryContextStrategy` /
      `BeerContextStrategy`. Today `WikipediaEnrichmentService::GetLocationContext`
      hardcodes a generic `"brewing"` query and a `"beer in {country}"`
      query directly — no per-phase strategy selection.
- [ ] `SamplingStrategy` interface + `UniformSamplingStrategy`, replacing
      the inline `std::ranges::sample(...)` call in
      `BiergartenPipelineOrchestrator::QueryCitiesWithCountries()`.
- [ ] `BeerSelectionStrategy` interface + `RandomBeerSelectionStrategy`, to
      pick styles per brewery from the `BeerStyle` palette (depends on §1
      and §2).
- [ ] `CheckinDistributionStrategy` interface + `JCurveCheckinStrategy` /
      `RandomCheckinStrategy` — this is the "Check-In System" item already
      called out in README.md's Next Steps, made concrete.
- [ ] `FollowGenerationStrategy` interface + `RandomFollowStrategy` /
      `ActivityWeightedFollowStrategy`.

## 4. Data Generation

`tooling/pipeline/includes/data_generation/`, `src/data_generation/`.

- [ ] Extend the `DataGenerator` interface with `GenerateBeer`,
      `GenerateCheckin`, `GenerateRating` (today: only `GenerateBrewery` and
      `GenerateUser`).
- [ ] Implement `LlamaGenerator::GenerateUser` for real. It currently
      returns a hardcoded `{"test_user", "This is a test user profile from
    {locale}."}` regardless of input — see the `// TODO` at the top of
      `src/data_generation/llama/generate_user.cc`.
- [ ] Implement `MockGenerator::GenerateBeer` / `GenerateCheckin` /
      `GenerateRating`.
- [ ] Add `IPromptFormatter::ExpectedArchitecture()` and
      `LlamaGenerator::ValidateModelArchitecture()` so loading a GGUF that
      doesn't match the configured chat template fails fast instead of
      silently producing degraded output.
- [ ] Add prompt template files for beer/checkin/rating generation next to
      the existing `prompts/BREWERY_GENERATION.md`.

## 5. Export Service

`tooling/pipeline/includes/services/database/`, `src/services/sqlite/`.

- [ ] Extend `IExportService` with `ProcessBeer`, `ProcessUser`,
      `ProcessCheckin`, `ProcessRating`, `ProcessFollow` (today only
      `ProcessRecord(const GeneratedBrewery&)` exists).
- [ ] Add `beers`, `users`, `checkins`, `ratings`, `follows` tables to
      `SqliteExportService::InitializeSchema()` — see
      `kCreateLocationsTableSql` / `kCreateBreweriesTableSql` in
      `includes/services/database/sqlite_statement_helpers.h` for the
      existing pattern to follow.
- [ ] Add a `brewery_cache_` alongside the existing `location_cache_`, and
      move from one open transaction for the whole run to per-phase batched
      commits (`BEGIN` / `COMMIT & BEGIN` on a batch-size threshold), as
      shown in the planned activity diagram.

## 6. Concurrency & Orchestration

`tooling/pipeline/includes/concurrency/`,
`src/biergarten_pipeline_orchestrator/`.

- [ ] `BoundedChannel<T>` already exists and is production-tested — but
      it's only wired to the single log channel today. Stand up the
      per-phase producer/consumer channels (`loc_ch`, `exp_ch`, etc.) the
      planned activity diagram describes, each with a dedicated LLM worker
      thread and SQLite worker thread.
- [ ] Rewrite `BiergartenPipelineOrchestrator::Run()` from one synchronous
      pass over `generated_breweries_` into phased methods —
      `RunUserPhase` → `RunBreweryAndBeerPhase` (with a `RunBeerPhase`
      sub-step once `brewery_pool_` is populated) → `RunCheckinPhase` /
      `RunFollowPhase` (these two can run in parallel) → `RunRatingPhase` —
      backed by `user_pool_`, `brewery_pool_`, `beer_pool_`,
      `checkin_pool_`, `follow_pool_`.
- [ ] Honor the structural-concurrency requirement already called out in a
      comment on `BiergartenPipelineOrchestrator::Run()` in
      `biergarten_pipeline_orchestrator.h`: once real worker threads exist,
      they must be structurally joined (e.g. via `std::jthread`) before
      `Run()` returns, so no worker logs to a closed channel during
      teardown.

## 7. Enrichment

- [ ] Decide whether to restore the city/region-specific Wikipedia query
      that's currently commented out in
      `src/services/enrichment/wikipedia/get_summary.cc`
      (`GetLocationContext`). The `ContextStrategy` work in §3 is a natural
      place to reintroduce it via `BreweryContextStrategy::QueriesFor()`.
- [ ] Pre-warm caches at startup (`PreWarmBeerStyleCache`,
      `PreWarmLocationCache` in the planned activity diagram) instead of
      fetching lazily per record, so the streaming phases never block on a
      cold cache mid-run.

## 8. Fixtures / Build

- [ ] Author `personas.json` and `names-by-country.json` (see §2).
- [ ] Fix the `beer-styles.json` build-tree gap: add it to the "Runtime
      Assets" `configure_file` step in `CMakeLists.txt` so native builds and
      the Docker image agree on what's available at runtime.

---

## Suggested build order

The planned activity diagram's own phase notes ("brewery*pool* is now fully
populated. Phase 1b may begin.", etc.) imply a dependency order. Roughly:

1. Domain models (§1) and data preloading (§2) — nothing else compiles
   without these.
2. Export schema (§5) — so every later generation phase has somewhere to
   land its output.
3. Policy/strategy layer (§3) and generator interface (§4).
4. Concurrency/orchestration rewrite (§6), which is the only piece that
   actually wires §1–§5 into the phased, parallel pipeline shown in the
   planned diagrams.
5. Enrichment cache pre-warming and the city/region query decision (§7) —
   useful at any point, but most valuable once phases run concurrently.
