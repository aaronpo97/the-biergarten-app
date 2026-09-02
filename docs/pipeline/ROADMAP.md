---
title: Pipeline roadmap — reaching the planned architecture
last-updated: 2026-09-01
tags:
  - pipeline
  - roadmap
  - cpp
  - concurrency
---

Engineering breakdown for closing the gap between the **current** pipeline and
the **planned** architecture in
[`diagrams/planned/class.md`](./diagrams/planned/class.md) /
[`diagrams/planned/activity.md`](./diagrams/planned/activity.md). Items are
grouped by layer, roughly by dependency order. For the current implementation,
see [README.md](./README.md).

The only concurrency today is a log dispatcher thread draining a
`BoundedChannel<LogEntry>` into spdlog; sampling, enrichment, generation, and
export run synchronously on the main thread — §6 introduces the planned
worker threads.

---

## 1. Domain Models

`tooling/pipeline/includes/data_model/generated_models.h` and `models.h`.

- [ ] Add `Completeness` enum (`Full`/`Partial`/`Absent`) and a
      `LocationContext` struct (`text`, `completeness`, `char_count`); replace
      `EnrichedCity::region_context` (a plain `string` today) with it.
- [ ] Add `BeerStyle` (`name`, `description`, `min_abv`, `max_abv`, `min_ibu`,
      `max_ibu`).
- [ ] Add `BeerResult`, `CheckinResult`, `RatingResult` payloads.
- [ ] Add `GenerationMetadata` (`generation_id`, `generated_time`,
      `context_provided`, `generated_with`).
- [x] `UserResult` gained `first_name`/`last_name`/`gender`/`activity_weight`
      (was just `username`/`bio`), copied from the sampled `Name`, not
      LLM-invented.
- [x] Added `Name` (`first_name`, `last_name`, `gender`) and `ForenameEntry`
      (`name`, `gender`). Flatter than planned: no `NamesByCountry` wrapper —
      `ICuratedDataService` exposes `ForenamesByCountryMap`/
      `SurnamesByCountryMap` (keyed by ISO 3166-1) directly, and sampling is a
      free function, `SampleName(forenames, surnames, iso3166_1, rng)`, not a
      class method.
- [ ] Extend `GeneratedBrewery` with `brewery_id`, `context_completeness`,
      `metadata` (currently just `{location, brewery}`).
- [ ] Add `GeneratedBeer`, `GeneratedCheckin`, `GeneratedRating`,
      `GeneratedFollow` aggregate structs.
- [x] Added `UserRecord` (`location`, `user`, `email`, `date_of_birth`), the
      current stand-in for the planned `GeneratedUser`. `email`/
      `date_of_birth` are programmatic (never LLM-authored), for downstream
      auth-account seeding. Missing `user_id`/`password`/`metadata`; already
      exported via `ProcessRecord(const UserRecord&)` (§5).
- [x] Added `UserPersona` (`name`, `description`, `style_affinities`).

## 2. Data Preloading

`tooling/pipeline/includes/services/curated_data/`, fixture files.

- [x] Extracted `ICuratedDataService` (not `DataPreloader`); `Load*()` methods
      take no arguments, return `const&`. `CuratedJsonDataService` (renamed
      from `JsonLoader`) takes a `CuratedDataFilePaths` DTO at construction
      and memoizes each `Load*()` result. `MockCuratedDataService` (fixed data
      for `US`/`DE`/`FR`/`BE`) binds in its place under `--mocked`.
- [ ] Add `LoadBeerStyles()`. `beer-styles.json` exists and is copied into the
      Docker image, but no loader reads it and the native CMake build doesn't
      copy it into `build/` at all.
- [x] Added `LoadPersonas()` and authored `personas.json`.
- [x] Added `LoadForenamesByCountry()` / `LoadSurnamesByCountry()` (two
      methods, not one combined `LoadNamesByCountry()`), parsing vendored CC0
      data from `sigpwned/popular-names-by-country-dataset` — see
      ETHICS-AND-KNOWN-ISSUES.md for provenance. Deliberately not pre-paired
      or filtered to `locations.json`'s countries, to keep per-forename gender
      and support more countries later without re-sourcing.

## 3. Policy / Strategy Layer

Entirely new — no `includes/policy/` (or equivalent) exists today.

- [ ] `ContextStrategy` + `BreweryContextStrategy`/`BeerContextStrategy`.
      Today `WikipediaEnrichmentService::GetLocationContext` hardcodes a
      `"brewing"` query and a `"beer in {country}"` query directly.
- [ ] `SamplingStrategy` + `UniformSamplingStrategy`, replacing the inline
      `std::ranges::sample(...)` in `QueryCitiesWithCountries()`.
- [ ] `BeerSelectionStrategy` + `RandomBeerSelectionStrategy` (depends on §1,
      §2).
- [ ] `CheckinDistributionStrategy` + `JCurveCheckinStrategy` /
      `RandomCheckinStrategy` — the "Check-In System" README next step, made
      concrete.
- [ ] `FollowGenerationStrategy` + `RandomFollowStrategy` /
      `ActivityWeightedFollowStrategy`.

## 4. Data Generation

`tooling/pipeline/includes/data_generation/`, `src/data_generation/`.

- [ ] Extend `DataGenerator` with `GenerateBeer`, `GenerateCheckin`,
      `GenerateRating` (today: only `GenerateBrewery`/`GenerateUser`).
- [x] Added `OpenAIGenerator`, a third backend calling the OpenAI Chat
      Completions API with Structured Outputs (`json_schema`, `strict`) —
      schema-valid JSON with no `IPromptFormatter`/GBNF grammar needed.
      Selected via `--openai`/`GeneratorMode::kOpenAI`; landed ahead of §3/§4.
      Now shown in `diagrams/planned/class.md` alongside
      `MockGenerator`/`LlamaGenerator`, noting only
      `GenerateBrewery`/`GenerateUser` are implemented so far.
- [x] Implemented `LlamaGenerator::GenerateUser` for real (GBNF grammar,
      `ValidateUserJson`, 3 retries with corrective feedback,
      `prompts/USER_GENERATION.md`). Signature is
      `(city, persona, name) : UserResult`, matching the activity diagram.
- [ ] Implement `MockGenerator::GenerateBeer`/`GenerateCheckin`/`GenerateRating`.
- [ ] Add `IPromptFormatter::ExpectedArchitecture()` and
      `LlamaGenerator::ValidateModelArchitecture()` so a mismatched GGUF chat
      template fails fast instead of degrading silently.
- [ ] Add prompt templates for beer/checkin/rating, next to
      `prompts/BREWERY_GENERATION.md`.

## 5. Export Service

`tooling/pipeline/includes/services/database/`, `src/services/sqlite/`.

- [x] `IExportService::ProcessRecord(const UserRecord&)` and the `users`
      table are implemented — every successful user is exported with its
      resolved `location_id`.
- [ ] Extend `IExportService` with `ProcessBeer`, `ProcessCheckin`,
      `ProcessRating`, `ProcessFollow`.
- [ ] Add `beers`, `checkins`, `ratings`, `follows` tables to
      `InitializeSchema()` (`cities`/`breweries`/`brewery_addresses`/`users`/
      `user_addresses` already exist — see `sqlite_statement_helpers.h` for
      the pattern).
- [ ] Add a `brewery_cache_` alongside `city_cache_`, and move from one open
      transaction for the whole run to per-phase batched commits (`BEGIN` /
      `COMMIT & BEGIN` on a batch threshold), per the planned activity
      diagram.

## 6. Concurrency & Orchestration

`tooling/pipeline/includes/concurrency/`,
`src/biergarten_pipeline_orchestrator/`.

- [ ] `BoundedChannel<T>` exists and is production-tested but only wired to
      the log channel. Stand up the per-phase producer/consumer channels
      (`loc_ch`, `exp_ch`, etc.) with a dedicated LLM worker thread and SQLite
      worker thread each; the brewery phase needs a third, a Geocode Worker
      between them on its own `geo_ch` (§9).
- [ ] Rewrite `Run()` from one synchronous pass into phased methods —
      `RunUserPhase` → `RunBreweryAndBeerPhase` (`RunBeerPhase` sub-step once
      `brewery_pool_` fills) → `RunCheckinPhase`/`RunFollowPhase` (parallel) →
      `RunRatingPhase` — backed by `user_pool_`, `brewery_pool_`,
      `beer_pool_`, `checkin_pool_`, `follow_pool_`.
- [ ] Structurally join worker threads (e.g. `std::jthread`) before `Run()`
      returns, per the existing comment in
      `biergarten_pipeline_orchestrator.h`, so nothing logs to a closed
      channel during teardown.

## 7. Enrichment

- [ ] Decide whether to restore the city/region-specific Wikipedia query
      currently commented out in `get_summary.cc` — the §3 `ContextStrategy`
      work is a natural place to reintroduce it.
- [ ] Pre-warm caches at startup (`PreWarmBeerStyleCache`,
      `PreWarmLocationCache`) instead of fetching lazily per record.

## 8. Fixtures / Build

- [x] Authored `personas.json`, `forenames-by-country.json`,
      `surnames-by-country.json` (§2).
- [ ] Fix the `beer-styles.json` build-tree gap: add it to the "Runtime
      Assets" `configure_file` step in `CMakeLists.txt`.

## 9. Geocoding

`tooling/pipeline/includes/services/address/`, `src/services/address/` —
added entirely after `diagrams/planned/` was authored; wasn't tracked here
until now.

- [x] Added `IAddressService` (`ReverseGeocode(lon, lat) :
      optional<AddressLookupResult>`), `NominatimAddressService` (public
      Nominatim API, 1s sleep per request, `nullopt` on failure or no usable
      address), and `MockAddressService` (fixed placeholder for `--mocked`).
      Called once per brewery, after `GenerateBrewery` and before export, to
      resolve `BreweryAddress::address_line1`/`postal_code` — users aren't
      geocoded. `diagrams/planned/class.md` now models this as an
      `InfrastructureGeocoding` namespace owned by the orchestrator.
- [ ] Give the brewery phase its own **Geocode Worker** thread, between the
      LLM worker and the SQLite worker (`loc_ch` → LLM Worker → `geo_ch` →
      Geocode Worker → `exp_ch` → SQLite Worker), rather than calling
      `ReverseGeocode` inline — Nominatim's rate limit is unrelated to
      inference speed, so coupling them stalls whichever side is slower and
      needlessly cools the LLM's KV cache. It never skips a record on lookup
      failure, only attaches a placeholder; shown as its own subgraph
      (`B_GEO`) in `diagrams/planned/activity.md`. One worker per phase is
      safe today since `RunUserPhase` joins before `RunBreweryPhase` starts;
      concurrent phases plus user-geocoding would need a shared rate-limited
      client instead, since the throttle is global, not per-thread.

---

## Suggested build order

The planned activity diagram's phase notes imply a dependency order:

1. Domain models (§1) and data preloading (§2) — nothing else compiles
   without these.
2. Export schema (§5) — so every generation phase has somewhere to land
   output.
3. Policy/strategy layer (§3) and generator interface (§4).
4. Concurrency/orchestration rewrite (§6) — wires §1–§5 into the phased,
   parallel pipeline the planned diagrams show.
5. Enrichment cache pre-warming and the city/region query decision (§7) —
   most valuable once phases run concurrently.
