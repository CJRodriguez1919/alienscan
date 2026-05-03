"""Schema for the canonical AlienScan sightings table.

Keep this file in sync with `src/types/sighting.ts` on the frontend.
"""

from __future__ import annotations

import polars as pl

# The 19 shape categories we standardize to. Anything outside the set is
# remapped via SHAPE_ALIASES or falls through to "unknown".
ALLOWED_SHAPES: tuple[str, ...] = (
    "light",
    "circle",
    "triangle",
    "fireball",
    "disk",
    "sphere",
    "oval",
    "cigar",
    "formation",
    "rectangle",
    "cylinder",
    "diamond",
    "chevron",
    "teardrop",
    "egg",
    "cross",
    "cone",
    "other",
    "unknown",
)

# NUFORC's free-text shape field has a long tail of variants. Map them to
# our canonical set.
SHAPE_ALIASES: dict[str, str] = {
    "circular": "circle",
    "round": "circle",
    "disc": "disk",
    "delta": "triangle",
    "triangular": "triangle",
    "rectangular": "rectangle",
    "saturn-like": "sphere",
    "starlike": "light",
    "star-like": "light",
    "starship": "other",
    "flash": "light",
    "orb": "sphere",
    "changing": "other",
    "changed": "other",
    "hexagon": "other",
    "pyramid": "triangle",
    "dome": "sphere",
    "":     "unknown",
}

OUTPUT_SCHEMA: dict[str, pl.DataType] = {
    "id": pl.Utf8,
    "occurred_at": pl.Datetime("us"),
    "reported_at": pl.Datetime("us"),
    "city": pl.Utf8,
    "state": pl.Utf8,
    "country": pl.Utf8,
    "shape": pl.Utf8,
    "duration_seconds": pl.Int64,
    "duration_text": pl.Utf8,
    "summary": pl.Utf8,
    "latitude": pl.Float64,
    "longitude": pl.Float64,
    "source_url": pl.Utf8,
}
