# AlienScan — Handoff Notes

**For:** the next AI agent picking this project up.
**From:** the agent that scaffolded the initial repo.
**Date:** 2026-05-08.

This document tells you everything you need to be useful immediately
without re-reading every file. Read this first, then `README.md`, then
`docs/ARCHITECTURE.md`.

---

## What AlienScan is

A modern, light-themed, single-deploy web app that puts ~120k cleaned
NUFORC UFO sighting reports onto a real map with real filters and
fun-stat pages. The original NUFORC site looks like 1998. This is the
2026 version.

Three primary user surfaces:

1. **`/map`** — Clustered MapLibre map of every geocoded sighting,
   filterable by shape and year via URL-synced query params.
2. **`/stats`** — Aggregate views: shape distribution, year-over-year
   trend, top states, holiday-spike table.
3. **`/scan`** — User types a city or ZIP, gets a personalized report:
   nearest sightings, distance bands, shape distribution within 150 km.

Plus a landing page at `/` and a candid `/about` page.

## Stack

- **Next.js 15** (App Router, Server Components by default)
- **TypeScript** strict mode (`noUncheckedIndexedAccess` on)
- **Tailwind 3** with a custom palette (paper / ink / signal-green)
- **DuckDB-WASM** runs SQL against a Parquet served from `/data/`
- **MapLibre GL** for the map (no Mapbox key required)
- **Open-Meteo** for free geocoding in the scan page
- **Vitest** for frontend unit tests, **Playwright** scaffold present
  but no e2e specs yet
- **Python pipeline** (Polars + DuckDB + httpx) processes the upstream
  cleaned NUFORC dataset into a zstd-compressed Parquet

## Repo layout (the bits worth knowing)

```
src/
  app/                    # Next App Router routes
    page.tsx              # Landing
    map/page.tsx          # Map (loads SightingsMap dynamically — ssr:false)
    stats/page.tsx        # Stats page, all queries fired client-side
    scan/page.tsx         # Geocode + nearest-N
    about/page.tsx        # Honest caveats
    layout.tsx            # Fonts (Fraunces, Inter Tight, JetBrains Mono)
    globals.css           # Light theme + MapLibre overrides
  components/
    sightings-map.tsx     # MapLibre wrapper, GeoJSON source w/ clustering
    filter-bar.tsx        # Shape pills + year range, syncs to URL
    bar-chart.tsx         # No-dep horizontal bar
    year-trend.tsx        # Hand-rolled SVG line/area
    stat-card.tsx, nav.tsx, footer.tsx
  lib/
    duckdb.ts             # Singleton DuckDB-WASM connection
    queries.ts            # Every SQL query is a single function here
    use-filters.ts        # URL <-> SightingFilters object
    geocode.ts            # Open-Meteo wrapper
    utils.ts              # cn(), formatDuration, formatDate, truncate, sortBy
  types/
    sighting.ts           # Shared shapes; mirror of pipeline/schema.py
pipeline/
  alienscan_pipeline/
    build.py              # python -m alienscan_pipeline.build
    clean.py              # normalize_columns, filter_geocoded, drop_duplicates
    duration.py           # parse_duration() — ~75% recovery on free text
    schema.py             # ALLOWED_SHAPES + SHAPE_ALIASES (KEEP IN SYNC w/ TS)
  tests/                  # pytest
tests/                    # vitest (frontend)
data/sample/              # tiny CSV fixture for offline dev / tests
public/data/              # generated Parquet lives here (gitignored by default)
docs/                     # ARCHITECTURE.md, DATA.md, DEPLOY.md
.github/workflows/ci.yml  # frontend + pipeline jobs
```

## How to run it locally

```bash
# Frontend
pnpm install
pnpm dev      # http://localhost:3000

# Pipeline (one-time, then whenever you want fresher data)
cd pipeline
uv sync
uv run python -m alienscan_pipeline.build
# writes ../public/data/sightings.parquet (~5–7 MB)
```

The frontend will 404 on `/data/sightings.parquet` until the pipeline
has run. The map and stats pages will surface a console error but the
landing/about pages still work.

## Where the data comes from

- Upstream: `timothyrenner/nuforc_sightings_data` (CC-licensed cleaned
  CSV, ~120k US/CA reports).
- We do **not** scrape NUFORC directly — their ToS forbids it.
- Our pipeline does additional shape canonicalization, duration parsing,
  city/state normalization, dedupe, and outputs Parquet.

Full lineage: `docs/DATA.md`.

## Things that are intentional and shouldn't be "fixed"

- **No backend.** Everything runs in the browser via DuckDB-WASM. If
  the dataset ever crosses ~50 MB compressed, revisit — but not before.
- **No analytics.** No Plausible, no GA, nothing.
- **`shape IN (...)` uses string interpolation for the placeholder
  list.** This is safe because shapes are validated against an enum
  (`ALL_SHAPES`) before they ever reach the SQL builder. See
  `src/lib/queries.ts::buildWhere`.
- **Map page uses `dynamic(... { ssr: false })`.** MapLibre touches
  `window` at import time. Don't try to SSR it.
- **CI does not regenerate the Parquet.** It's a release artifact, not
  a build artifact. See `docs/DEPLOY.md`.
- **Holiday list in `stats/page.tsx` is hardcoded.** Six US-centric
  dates. Easy to extend, but the upstream data is so US-skewed that
  international holidays don't produce signal.
- **`buildWhere` returns `"TRUE"` when no filters apply.** Don't replace
  with `1=1` — DuckDB is fine with `TRUE` and it reads better.

## Known rough edges / good first issues

- **No e2e tests yet.** Playwright is installed but `tests/e2e/` is
  empty. Highest-value first test: load `/map`, verify the count
  badge updates after applying a shape filter.
- **No skeleton loading states.** The map shows "loading…" in the
  count badge but pages flash blank during the first DuckDB init
  (~300–500ms cold). A subtle skeleton would help perceived perf.
- **Geocoder has no rate limiting / caching.** Open-Meteo is generous
  but a localStorage cache keyed by query string would be ~10 lines
  and a noticeable speedup for repeat scans.
- **Pipeline doesn't dedupe by URL.** `drop_duplicates` uses
  `(occurred_at, city, state, shape)`. URL-based dedupe would catch a
  few more cases. Trade-off: some upstream rows have no URL.
- **No country filter UI.** The data is mostly US, but a handful of
  CA rows exist. Either expose a country filter or filter to US-only
  in the pipeline. Currently we keep both.
- **The "AlienScan my area" page has no map.** Just a list. Adding a
  small static map (same MapLibre, lighter) would make it shareable as
  a screenshot.
- **No share-sheet / OG image generator.** The scan page especially
  begs for "share my report card" — generate a PNG with the user's
  city + headline stats, suitable for posting.

## Things I considered and rejected (so you don't re-litigate)

- **Recharts / D3 / visx.** Bundle cost not worth it for the chart
  needs we have. Two hand-rolled SVG components (BarChart, YearTrend)
  cover everything.
- **Mapbox.** Requires an API token and isn't free at any real scale.
  MapLibre + Carto's Positron gets us 95% there for $0.
- **Server actions for queries.** Pointless given DuckDB-WASM is in
  the browser. Adding a server hop would just make queries slower.
- **next-intl / locale support.** No translations are written; this
  would just bloat the bundle. Add if/when there's actual demand.
- **Per-shape colors on the map.** Looked busy and the cluster colors
  already encode density. Could revisit with a "color by shape" toggle
  but it's not the default.

## Style guide

- **Voice:** dry, slightly amused, never condescending toward people
  who report sightings. The About page is the reference point.
- **Typography:** display = Fraunces, body = Inter Tight, mono =
  JetBrains Mono. Don't add more fonts.
- **Color usage:** signal-green is for "data" / accents only. Don't
  use it for chrome. Ink for text, paper for surfaces.
- **Headers in code:** keep imports grouped (external, then internal,
  then types). Prettier handles the rest.

## Deployment

Vercel zero-config works. `next.config.js` already sets the COOP/COEP
headers DuckDB-WASM needs. Full guide: `docs/DEPLOY.md`.

## Repo address

- Owner: `CJRodriguez1919` (per the user)
- Default branch: `master` (yes, master, not main — preserved from the
  existing repo)
- URL: `https://github.com/CJRodriguez1919/alienscan`

Replace `CJRodriguez1919` placeholders in `README.md`, `LICENSE`, and the
footer component when committing for real.

## What's left (priority order)

1. Run the pipeline to produce `public/data/sightings.parquet` (the
   site is empty without it).
2. Wire up Vercel and deploy.
3. Add a Playwright smoke test to CI.
4. Build the share-sheet PNG generator for `/scan`.
5. Add a country filter or pipeline-level US-only filter (decide
   which).
6. Cache geocoder results in localStorage.

That's it. The code is clean, the tests pass locally, and the docs are
in place. Good luck.
