# Brewery index — data requirements

`/breweries` (`app/features/breweries/routes/breweries.tsx`) is built and live. This document inventories every piece of data the page needs, section by section: what's already wired to real data, what's filler pending backend work, and what the backend would need to add to close each gap.

## Status legend

- ✅ **Available** — real data, already wired up.
- ⚠️ **Partial** — an endpoint exists but is missing a field the design needs.
- ❌ **Missing** — no backend support at all; page currently shows filler.

## 1. Page header

Static copy only. No data.

## 2. Featured brewery

| Field | Status | Current source | Gap |
|---|---|---|---|
| Name, description, address, location | ✅ | `GET /api/brewery` (`BreweryDto`) | — |
| "Editorially featured" selection | ❌ | none — defaults to the most recently created brewery | No `IsFeatured` flag or rotation concept anywhere in `BreweryPost`. Needs a field + an admin toggle, or a scheduled rotation query, to back the "THIS WEEK" cadence the badge implies. |
| Founded year | ❌ | none | `BreweryPost` has no founding date. Would need a new column (distinct from `CreatedAt`, which is post-creation time, not the brewery's actual founding). |
| Beers listed count | ❌ | none | No beer-count aggregate exists. Blocked on the beers gap below. |
| House style | ❌ | none | No style/tag field on `BreweryPost`, and no aggregate over its beers' styles either. |

## 3. Breweries near you

| Field | Status | Current source | Gap |
|---|---|---|---|
| Nearby breweries by coordinates + radius | ✅ | `GET /api/brewery/locations/nearby?latitude&longitude&rangeInMetres` | — |
| Distance from search center | ✅ | Computed client-side (Haversine) from the coordinates the endpoint already returns | — |
| One-line note / tagline per brewery | ❌ | none | `SimplifiedBreweryDto` (used by both `/locations` and `/locations/nearby`) has no description-like field. List and map-popup text use filler. Needs either a short tagline field or a truncated `Description` added to that DTO. |
| User's current location | ✅ | Browser Geolocation API | — |
| Fallback region (before permission granted / on denial) | ⚠️ | Falls back to the featured brewery's own coordinates as a proxy center | Works, but isn't a deliberate "default region." A real deployment likely wants a configured default (e.g. per-tenant HQ city) rather than borrowing the featured brewery's location. |
| Manual location entry ("Change location") | ❌ | Re-requests browser geolocation only | No geocoding/place-search endpoint exists to resolve a typed address or city name to coordinates. |
| Search radius | ✅ | Client-side state (10–150 km slider), passed straight through to `rangeInMetres` | — |

## 4. Recently added

| Field | Status | Current source | Gap |
|---|---|---|---|
| Newest breweries, name/city/description | ✅ | `GET /api/brewery` (already sorted newest-first) | — |

No gaps — this section is fully real.

## 5. Directory CTA

| Field | Status | Current source | Gap |
|---|---|---|---|
| Total partner brewery count | ❌ | Filler number (`128`) | No lightweight count endpoint. Needs something like `GET /api/brewery/count` rather than fetching the full unbounded list just to measure it. |
| Filter by country / region / beer style | ❌ | Copy only — not implemented | This is CTA copy describing the destination directory page's future capability, not a data need of this page itself. Tracked here because it implies the directory page will eventually need country/region/style filter params. |

## Cross-cutting: the Beers feature is empty

`Features.Beers` (backend) has a `.csproj` and nothing else — no query handlers, no controller, no DTOs. `BeerPost` exists as a domain entity (with `BrewedById` linking to `BreweryPost`) but nothing exposes it over the API. This blocks:
- "Beers listed" count on the featured card.
- "House style" (would likely aggregate from a brewery's beers' `BeerStyle`).
- Any future beer-style filter on the directory.

## Summary of backend work to fully close the gaps

1. `IsFeatured` flag (or equivalent rotation query) on `BreweryPost`.
2. `FoundedYear` (or similar) column on `BreweryPost`.
3. A short tagline/note field on `BreweryPost`, surfaced through `SimplifiedBreweryDto`.
4. Stand up `Features.Beers` — at minimum a query to count beers per brewery and read their styles.
5. `GET /api/brewery/count`.
6. A geocoding/place-search endpoint for manual location entry.
7. (Product decision, not code) a configured default region to fall back to instead of the featured brewery's coordinates.
