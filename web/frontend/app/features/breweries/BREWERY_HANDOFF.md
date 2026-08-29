# Brewery feature: data requirements

Covers `/breweries` (`routes/breweries.tsx`) and `/breweries/:id`
(`routes/brewery-detail.tsx`). Both routes are built and live. This document
lists what's real vs. filler, and what backend work closes each gap.

## Status legend

- ✅ **Available**: real data, wired up.
- ⚠️ **Partial**: endpoint exists but is missing a field the design needs.
- ❌ **Missing**: no backend support; page shows filler or local-only state.

## Breweries index (`/breweries`)

### Featured brewery

| Field                                | Status | Source                            | Gap                                                                                                    |
| ------------------------------------ | ------ | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Name, description, address, location | ✅     | `GET /api/brewery` (`BreweryDto`) |                                                                                                        |
| "Editorially featured" selection     | ❌     | none (defaults to newest brewery) | No `IsFeatured` flag or rotation concept. Needs a field + admin toggle, or a scheduled rotation query. |
| Founded year                         | ❌     | none                              | No founding-date column (distinct from `CreatedAt`, which is post-creation time).                      |
| Beers listed count                   | ❌     | none                              | Blocked on the Beers gap below.                                                                        |
| House style                          | ❌     | none                              | No style/tag field, and no aggregate over a brewery's beers' styles.                                   |

### Breweries near you

| Field                                                   | Status | Source                                                                                  | Gap                                                                                                            |
| ------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Nearby breweries by coordinates + radius                | ✅     | `GET /api/brewery/locations/nearby?latitude&longitude&rangeInMetres`                    |                                                                                                                |
| Distance from search center                             | ✅     | `SimplifiedBreweryDto.DistanceMetres`, computed server-side via `geography::STDistance` |                                                                                                                |
| One-line note per brewery                               | ❌     | none                                                                                    | `SimplifiedBreweryDto` has no description-like field. Needs a tagline field, or a truncated `Description`.     |
| User's current location                                 | ✅     | Browser Geolocation API                                                                 |                                                                                                                |
| Fallback region (before permission granted / on denial) | ⚠️     | Falls back to the featured brewery's coordinates                                        | Works, but isn't a deliberate default. A real deployment wants a configured default (e.g. per-tenant HQ city). |
| Manual location entry ("Change location")               | ❌     | Re-requests browser geolocation only                                                    | No geocoding/place-search endpoint to resolve a typed address to coordinates.                                  |
| Search radius                                           | ✅     | Client-side state (10–150 km slider), passed as `rangeInMetres`                         |                                                                                                                |

### Recently added

✅ Fully real: `GET /api/brewery`, already sorted newest-first. No gaps.

### Directory CTA

| Field                                   | Status | Source                | Gap                                                                                                                            |
| --------------------------------------- | ------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Total partner brewery count             | ❌     | Filler number (`128`) | No count endpoint. Needs `GET /api/brewery/count` rather than fetching the full list to measure it.                            |
| Filter by country / region / beer style | ❌     | Copy only             | Describes the future directory page's capability, not a data need of this page. Implies the directory will need filter params. |

## Brewery detail (`/breweries/:id`)

### Header, location, dates

| Field                                   | Status | Source                                                                               |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| Name, description, address, coordinates | ✅     | `GET /api/brewery/{id}` (`BreweryDto`)                                               |
| Created / updated dates                 | ✅     | `BreweryDto`                                                                         |
| Founded year, brewery type, website     | ❌     | `FILLER_BREWERY_META`: `BreweryPost` has no `FoundedAt`, `Type`, or `Website` column |

### Beers, style breakdown

| Field                        | Status | Source                                  | Gap                                                                           |
| ---------------------------- | ------ | --------------------------------------- | ----------------------------------------------------------------------------- |
| Beers belonging to a brewery | ❌     | `FILLER_BEERS`                          | See "Beers feature is empty" below.                                           |
| Beer style breakdown         | ❌     | Derived client-side from `FILLER_BEERS` | Blocked on the same gap; otherwise an aggregate query over a brewery's beers. |

### Likes, ratings, comments

| Field                       | Status | Source                         | Gap                                                                                                                                                                             |
| --------------------------- | ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brewery like/unlike + count | ❌     | Local component state          | No like concept in the schema. Needs a join table (composite `BreweryPostId`/`UserAccountId`, like `UserFollow`).                                                               |
| Your rating (1–5) + average | ❌     | Local component state          | No brewery rating table/endpoint.                                                                                                                                               |
| Comments (list + post)      | ❌     | `FILLER_COMMENTS`, local state | No `BreweryPostComment` table. `BeerPostComment` is a close precedent (comment + 1–5 `CHECK`-constrained rating + FKs) but is unused and targets `BeerPost`, not `BreweryPost`. |
| Per-comment like toggle     | ❌     | Local component state          | No "like a comment" concept; needs a join table alongside a new `BreweryPostComment` table.                                                                                     |

## Cross-cutting: the Beers feature is empty

`Features.Beers` (backend) has a `.csproj` and nothing else: no query
handlers, no controller, no DTOs. `BeerPost` exists as a domain entity (with
`BrewedById` linking to `BreweryPost`) but nothing exposes it over the API.
This blocks:

- "Beers listed" count and "House style" on the index page's featured card.
- The beer list and style breakdown on the detail page.
- Any future beer-style filter on the directory.

## Summary of backend work

1. `IsFeatured` flag (or rotation query) on `BreweryPost`.
2. `FoundedAt`/`FoundedYear`, `Type`, `Website` columns on `BreweryPost` (+ `BreweryDto`).
3. A tagline/note field on `BreweryPost`, surfaced through `SimplifiedBreweryDto`.
4. Stand up `Features.Beers`: a query + controller route for a brewery's beers, following the `Features.Breweries` vertical-slice pattern. Unblocks beer counts, style breakdown, and style filters.
5. `GET /api/brewery/count`.
6. A geocoding/place-search endpoint for manual location entry.
7. `BreweryPostLike` join table + command/query/controller (toggle, read count/liked-by-current-user); public GET, JWT-required toggle, mirroring `BreweryController`'s `[AllowAnonymous]`-on-reads pattern.
8. `BreweryPostRating` table (1–5, `CHECK`-constrained like `BeerPostComment.Rating`) + aggregate query for average/count.
9. `BreweryPostComment` table (mirroring `BeerPostComment.sql`, FK'd to `BreweryPost`) + `BreweryPostCommentLike` join table, plus command/query/controller for both.
10. (Product decision, not code) a configured default region to fall back to instead of the featured brewery's coordinates.

Once these land, swap `FILLER_BEERS` / `FILLER_COMMENTS` / `FILLER_BREWERY_META`
(`utils/filler-brewery-detail.ts`) and the local `useState` in
`brewery-detail.tsx` for loader data and `authorizedRequest`-based mutations
(see `auth.server.ts`).
