# Architecture

## At a glance

```
┌──────────────────────┐    one-time     ┌──────────────────────┐
│  upstream NUFORC CSV │  ─────────────▶ │  Python pipeline     │
│  (public, cleaned)   │                 │  Polars + DuckDB     │
└──────────────────────┘                 └──────────┬───────────┘
                                                    │ writes
                                                    ▼
                                         ┌──────────────────────┐
                                         │  sightings.parquet   │
                                         │  ~6 MB, zstd-11      │
                                         └──────────┬───────────┘
                                                    │ HTTP fetch
                                                    ▼
        ┌─────────────────────┐         ┌──────────────────────┐
        │  Browser            │  query  │  DuckDB-WASM         │
        │  Next.js + React    │ ◀──────▶│  in-browser engine   │
        └─────────────────────┘         └──────────────────────┘
```

The architecture is intentionally backend-light. Once the Parquet is
generated and deployed alongside the static site, every query runs in
the user's browser. There is no server, no API, no rate limit.

## Why DuckDB-WASM

NUFORC has ~120k sightings. That's small enough to ship as a 5–6 MB
Parquet over HTTP and run analytical queries against in-browser. We get:

- Real SQL with `GROUP BY`, `EXTRACT`, window functions
- Sub-100ms response times on a modern laptop
- Free hosting (the Parquet is just a static asset)
- Effectively unbounded scale per user — they're paying for the compute

If the dataset ever grows past ~50 MB compressed, we'd revisit. At that
point a server-side endpoint with DuckDB on Fly.io or Cloudflare D1
would be the natural step.

## Frontend (`src/`)

App Router with React Server Components by default. The map and stats
pages are client components because they touch `window` and need
DuckDB-WASM.

Key modules:

- **`src/lib/duckdb.ts`** — singleton DuckDB connection. Lazy-loads on
  first query, caches the bundle.
- **`src/lib/queries.ts`** — every query is a single function. Easier
  to test, easier to reason about. SQL strings live next to their
  callers.
- **`src/lib/use-filters.ts`** — sync filter state to URL search params
  so every map view is shareable.
- **`src/components/sightings-map.tsx`** — MapLibre with clustered
  GeoJSON source, swap-in source data on filter change.

## Pipeline (`pipeline/`)

Standalone Python project, dev-installed with `uv`. It does:

1. Fetch the cleaned NUFORC CSV (CC-licensed, from `timothyrenner/nuforc_sightings_data`)
2. Normalize column names to our schema
3. Standardize shapes (19 canonical labels) and geo fields
4. Parse free-text durations into integer seconds where possible
5. Drop ungeocoded and obvious-duplicate rows
6. Write a sorted, zstd-compressed Parquet

Key design choice: the pipeline is **not** part of the build. We don't
want every CI run to re-download and reprocess 100k rows. Instead the
Parquet is committed as a release artifact, or generated and uploaded
to S3/Cloudflare R2 and the deployed site fetches it.

## Testing

- **Frontend:** Vitest for query helpers, URL filter roundtripping, and
  formatting utilities. The map and DuckDB integration are exercised
  manually + by Playwright in CI for smoke tests.
- **Pipeline:** Pytest for the duration parser, the shape normalizer,
  and the cleaning helpers. The end-to-end transform is exercised
  against a tiny `data/sample/` fixture.

## What's intentionally not here

- **No backend.** Static assets only.
- **No analytics or telemetry.** Privacy-respecting by default.
- **No API keys.** MapLibre uses the free Carto basemap; geocoding uses
  Open-Meteo.
- **No auth.** Everything is public read.
