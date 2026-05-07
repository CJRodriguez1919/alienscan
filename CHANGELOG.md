# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Initial release

### Added
- Next.js 15 frontend with App Router and TypeScript strict mode
- Interactive sightings map (MapLibre GL) with shape, year, and duration filters
- Stats pages: shape-over-time, state rankings, holiday correlations
- "AlienScan my area" personalized report card by city or ZIP
- DuckDB-WASM client for in-browser SQL over a Parquet sightings file
- Python data pipeline using Polars + DuckDB to clean and geocode the
  upstream NUFORC dataset
- Vitest unit tests for query helpers and components
- Pytest tests for the data pipeline
- GitHub Actions CI: lint, typecheck, test, build, pipeline tests
- Light theme with custom typography
