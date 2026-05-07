# Data sources

## Primary source

**timothyrenner/nuforc_sightings_data** — a community-maintained,
cleaned and geocoded version of the NUFORC sightings database.

- URL: <https://github.com/timothyrenner/nuforc_sightings_data>
- License: MIT (code) / data redistributable per the upstream README
- Coverage: ~120,000 sightings, mostly US, 1900–present
- Geocoding: city-level via Maxmind GeoLite2 + manual fixes
- Update cadence: irregular; the upstream maintainer pulls new data when
  NUFORC publishes batches

## Why not scrape NUFORC directly

NUFORC's terms of service explicitly forbid scraping and redistribution
of their data. The upstream cleaned dataset above was negotiated with
NUFORC's CTO and is the legitimate path for downstream tools.

If you want to use AlienScan with up-to-the-day data, the upstream
project's README has instructions for re-running the scraper against
the live NUFORC site for personal use. We don't recommend doing this
inside a public-facing tool.

## Cleaning steps the pipeline applies

The pipeline (`pipeline/alienscan_pipeline/`) layers additional
standardization on top of the upstream cleaning:

1. **Shape canonicalization.** NUFORC's free-text shape field has a
   long tail of variants ("disc", "circular", "orb", "starlike", etc.).
   We map them to 19 canonical categories. See `schema.py` for the full
   alias table.
2. **Duration parsing.** Free-text durations are parsed to integer
   seconds where the format is recognizable. Roughly 75% of rows yield
   a numeric duration; the rest are kept as `duration_text` only.
3. **Coordinate validation.** Drops rows with `(0, 0)` or
   out-of-bounds coordinates.
4. **City normalization.** Strips trailing parentheticals like
   "(near)" or "(canada)", title-cases the result.
5. **State filter.** Only keeps two-letter US/Canadian state codes;
   long-form names are nulled.
6. **De-duplication.** Drops repeat rows that share the same
   `(occurred_at, city, state, shape)` tuple.

After cleaning, the dataset is sorted by occurred date and written as a
zstd-level-11 Parquet to `public/data/sightings.parquet`. Typical size:
5–7 MB.

## Caveats AlienScan surfaces

We try to be honest about the data's limits in the UI:

- Locations are city-level, never precise.
- Reports are user-submitted and unverified.
- Reporting volume reflects reporting infrastructure (post-2014 spike).
- Coverage is heavily US-biased.

These caveats are repeated on the About page and in the README.
