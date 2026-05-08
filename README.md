# 🛸 AlienScan

> Modern, searchable interface over a century of UFO sighting reports. Maps, stats, and surprisingly fun patterns hiding in 100,000+ data points.

[![CI](https://github.com/CJRodriguez1919/alienscan/actions/workflows/ci.yml/badge.svg)](https://github.com/CJRodriguez1919/alienscan/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)

## What it does

AlienScan is a fast, modern frontend for the public NUFORC sightings dataset. The original NUFORC site looks like 1998 — this is the version that should exist in 2026.

- 🗺 **Interactive map** of 100k+ geocoded sightings, filterable by shape, year, and duration
- 📊 **Stats pages** that surface the genuinely interesting patterns: shape trends over decades, sightings vs. holiday calendars, state-by-state weirdness rankings
- 🔍 **AlienScan my area** — drop in a city or ZIP and get a personal sighting report
- ⚡ **Runs in your browser** — DuckDB-WASM does SQL over a Parquet file, no backend round-trips
- 🌞 **Light, clean UI** — designed to be readable, not spooky

## Stack

- **[Next.js 15](https://nextjs.org/)** with App Router and React Server Components
- **[TypeScript](https://www.typescriptlang.org/)** strict mode
- **[Tailwind CSS](https://tailwindcss.com/)** for styling
- **[DuckDB-WASM](https://duckdb.org/docs/api/wasm/overview)** for in-browser analytical queries
- **[MapLibre GL JS](https://maplibre.org/)** for the map (no API token required)
- **Python pipeline** (Polars + DuckDB) for the one-time data prep
- **Vitest** for unit tests, **Playwright** for end-to-end
- **GitHub Actions** for CI

## Quick start

```bash
# Install
pnpm install

# Build the dataset (one-time, ~5 min)
cd pipeline
uv sync
uv run python -m alienscan_pipeline.build

# Back to root, run the dev server
cd ..
pnpm dev
```

Open <http://localhost:3000>.

## Project layout

```
alienscan/
├── src/                  # Next.js app
│   ├── app/              # Routes (App Router)
│   ├── components/       # React components
│   ├── lib/              # Hooks, query helpers, DuckDB client
│   └── types/            # Shared TypeScript types
├── pipeline/             # Python data prep
│   └── alienscan_pipeline/
├── public/data/          # Generated Parquet, served statically
├── data/sample/          # Tiny sample for tests + offline dev
├── tests/                # Frontend unit tests
└── docs/                 # Architecture notes, data sources
```

## Data sources

AlienScan uses publicly available, redistributable cleaned versions of the
NUFORC database. See [`docs/DATA.md`](docs/DATA.md) for sources, licenses,
and the cleaning steps the pipeline applies.

We do **not** scrape NUFORC directly — their ToS doesn't allow it. The
upstream datasets we build on are CC-licensed.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run Vitest |
| `pnpm test:e2e` | Run Playwright tests |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run `tsc --noEmit` |
| `cd pipeline && uv run pytest` | Run pipeline tests |
| `cd pipeline && uv run python -m alienscan_pipeline.build` | Rebuild the dataset |

## Contributing

Issues and PRs welcome. Run `pnpm lint && pnpm test && pnpm typecheck` before
pushing — CI will run all three.

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [NUFORC](https://nuforc.org/) for collecting decades of reports
- [timothyrenner/nuforc_sightings_data](https://github.com/timothyrenner/nuforc_sightings_data) for the cleaned, geocoded dataset
- [DuckDB](https://duckdb.org/) for making in-browser analytics ridiculously fast
