# Landing page: data requirements

Covers `/` (`routes/home.tsx`), the public marketing landing page. The page is
built and live. This document lists what's real vs. filler, and what backend
work closes each gap.

## Status legend

- ✅ **Available**: real data, wired up.
- ⚠️ **Partial**: endpoint exists but is missing a field the design needs.
- ❌ **Missing**: no backend support; page shows filler or local-only state.

## Partner breweries preview

| Field                          | Status | Source                                               | Gap                                                                                                          |
| ------------------------------ | ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Name, description, city/region | ✅     | `GET /api/brewery?limit=3&offset=0`                  |                                                                                                              |
| Newest-first ordering          | ✅     | `GET /api/brewery` is already sorted                 |                                                                                                              |
| "{n} beers" badge              | ❌     | `FILLER_BEER_COUNTS` (`utils/filler-beer-counts.ts`) | Blocked on `Features.Beers`, which has a `.csproj` and nothing else — see `../breweries/BREWERY_HANDOFF.md`. |

## Hero, features, closing CTA

Static marketing copy and one bundled photo
(`assets/bar-background.jpg`, carried over from the archived Next.js
frontend). No data needs. Replace the photo when real photography exists.

## Theme try-out

✅ Fully real: renders `ThemeSegmentedControl`
(`../theme/components/ThemeSegmentedControl.tsx`), the same `join` + radio
control the theme guide uses. Selection sets `data-theme` on `<html>` and
persists through the `biergarten-theme` cookie that the root loader reads.

## Footer

✅ Fully real: swaps Login for Dashboard from the session that
`getOptionalAuth` resolves in the route loader.

## Loader resilience

`getBreweries` throws a 503 `data()` response when the API is unreachable. The
landing page catches it and renders the "No breweries have been posted yet."
empty state, so a brewery service outage leaves the marketing content intact.
`/breweries` keeps the opposite behaviour — a brewery page with no breweries is
an error, so it surfaces its `ErrorBoundary`.

## Summary of backend work

1. Stand up `Features.Beers` so the per-brewery beer count is real. This is the
   same blocker already listed in `../breweries/BREWERY_HANDOFF.md`; closing it
   there closes it here.

Once that lands, swap `FILLER_BEER_COUNTS` for a count carried on `BreweryDto`
(or a dedicated beers-by-brewery query) and delete
`utils/filler-beer-counts.ts`.
