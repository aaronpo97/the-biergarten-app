# Brewery index redesign — data gaps

Frontend for the new `/breweries` layout is integrated with real data wherever the API already supports it. These gaps are filled with lorem-ipsum-style filler until the backend catches up:

- **Featured brewery** — no "editorially flagged" concept exists (no field, no endpoint). Currently defaults to the most recently created brewery. Needs a real flag (e.g. `IsFeatured` + an admin toggle, or a rotation query) plus the "week" cadence implied by the "THIS WEEK" badge.
- **Brewery tagline / one-line note** — `SimplifiedBreweryDto` (used by both `/locations` and `/locations/nearby`) has no description-like field. The nearby list and recently-added cards use filler note text. Needs a short field added to that DTO (or a truncated `Description`).
- **Founded year, beers listed count, house style** — none of these exist anywhere in the domain (`BreweryPost` has no founding date or style; there's no beer-count aggregate; `Features.Beers` has no query handlers at all yet). Featured card stats are entirely filler.
- **Total brewery count** — no lightweight count endpoint. CTA copy ("All N partner breweries...") uses a filler number rather than an unbounded fetch just to count rows. Needs something like `GET /api/brewery/count`.
- **Distance** is computed client-side (Haversine) from the coordinates `/locations/nearby` already returns — no backend change needed there.
- **Manual location entry** — "Change location" button re-requests browser geolocation only; there's no geocoding/place-search endpoint to resolve a typed address, so free-text entry isn't wired up yet.
