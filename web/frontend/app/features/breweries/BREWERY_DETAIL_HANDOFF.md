# Brewery detail — data requirements

`/breweries/:id` (`app/features/breweries/routes/brewery-detail.tsx`) is built and
live. This document inventories what's real vs. filler, following the same
convention as `BREWERY_INDEX_HANDOFF.md`.

## Status legend

- ✅ **Available** — real data, already wired up.
- ❌ **Missing** — no backend support at all; page currently shows filler or
  local-only client state.

## Header, location, dates

| Field                                      | Status | Current source           |
| ------------------------------------------- | ------ | ------------------------- |
| Name, description, address, coordinates    | ✅     | `GET /api/brewery/{id}` (`BreweryDto`) |
| Created / updated dates                    | ✅     | `BreweryDto`              |
| Founded year, brewery type, website        | ❌     | `FILLER_BREWERY_META` — `BreweryPost` has no `FoundedAt`, `Type`, or `Website` column |

## Beers, style breakdown

| Field                       | Status | Current source       | Gap                                                                                   |
| --------------------------- | ------ | --------------------- | -------------------------------------------------------------------------------------- |
| Beers belonging to a brewery | ❌     | `FILLER_BEERS`        | `Features.Beers` is an empty stub project — no query/controller exposes `BeerPost` at all, despite the entity already having a `BrewedById` FK. |
| Beer style breakdown         | ❌     | Derived client-side from `FILLER_BEERS` | Blocked on the same gap; would otherwise be an aggregate query over a brewery's beers. |

## Likes, ratings, comments

| Field                          | Status | Current source               | Gap                                                                                                                                     |
| ------------------------------ | ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Brewery like/unlike + count    | ❌     | Local component state only    | No like concept exists anywhere in the schema. Needs a new join table (composite `BreweryPostId`/`UserAccountId`, similar shape to `UserFollow`). |
| Your rating (1–5) + average    | ❌     | Local component state only    | No brewery rating table/entity/endpoint exists.                                                                                          |
| Comments (list + post)         | ❌     | `FILLER_COMMENTS`, local state | No `BreweryPostComment` table exists. `BeerPostComment` is a close schema precedent (comment + 1–5 `CHECK`-constrained rating + FKs) but is itself unused by any code and targets `BeerPost`, not `BreweryPost`. |
| Per-comment like toggle        | ❌     | Local component state only    | No "like a comment" concept exists anywhere in the schema — would need a new join table alongside a new `BreweryPostComment` table.       |

## Summary of backend work to close the gaps

1. Add `FoundedAt`, `Type`, `Website` columns to `BreweryPost` (+ `BreweryDto`).
2. Stand up `Features.Beers`: a query (and controller route) returning a
   brewery's beers, following the `Features.Breweries` vertical-slice pattern.
3. New `BreweryPostLike` join table + MediatR command/query + controller
   endpoints (toggle, read count/whether current user liked) — public GET,
   JWT-required toggle, mirroring `BreweryController`'s
   `[AllowAnonymous]`-on-reads pattern.
4. New `BreweryPostRating` table (1–5, `CHECK`-constrained like
   `BeerPostComment.Rating`) + aggregate query for average/count.
5. New `BreweryPostComment` table (mirroring `BeerPostComment.sql`, FK'd to
   `BreweryPost`) + a new `BreweryPostCommentLike` join table for per-comment
   likes, plus the command/query/controller layer for both.

Once these land, swap `FILLER_BEERS` / `FILLER_COMMENTS` / `FILLER_BREWERY_META`
(`utils/filler-brewery-detail.ts`) and the local `useState` in
`brewery-detail.tsx` for loader data and `authorizedRequest`-based mutations
(see `auth.server.ts`).
