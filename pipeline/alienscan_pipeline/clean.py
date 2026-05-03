"""Cleaning steps applied to the upstream NUFORC dataset."""

from __future__ import annotations

import re

import polars as pl

from .schema import ALLOWED_SHAPES, SHAPE_ALIASES

_ALLOWED_SET = set(ALLOWED_SHAPES)


def normalize_shape(value: str | None) -> str:
    """Map a free-text shape to one of the canonical labels."""
    if value is None:
        return "unknown"
    cleaned = value.strip().lower()
    if cleaned in _ALLOWED_SET:
        return cleaned
    if cleaned in SHAPE_ALIASES:
        return SHAPE_ALIASES[cleaned]
    return "unknown"


_WS = re.compile(r"\s+")


def _normalize_city(city: str | None) -> str | None:
    if city is None:
        return None
    text = _WS.sub(" ", city.strip())
    if not text:
        return None
    # NUFORC city fields sometimes contain trailing parentheses with
    # qualifiers ("(near)", "(canada)"). Strip them.
    text = re.sub(r"\s*\([^)]*\)\s*$", "", text)
    # Title case but preserve common abbreviations.
    return text.title()


def _normalize_state(state: str | None) -> str | None:
    if state is None:
        return None
    text = state.strip().upper()
    if len(text) == 2 and text.isalpha():
        return text
    return None


def normalize_columns(df: pl.DataFrame) -> pl.DataFrame:
    """Apply all column-level normalizations.

    Expects upstream columns: city, state, shape, occurred, reported,
    duration, summary, latitude, longitude, report_link.
    """
    return df.with_columns(
        pl.col("city").map_elements(_normalize_city, return_dtype=pl.Utf8).alias("city"),
        pl.col("state").map_elements(_normalize_state, return_dtype=pl.Utf8).alias("state"),
        pl.col("shape").map_elements(normalize_shape, return_dtype=pl.Utf8).alias("shape"),
    )


def filter_geocoded(df: pl.DataFrame) -> pl.DataFrame:
    """Drop rows with missing or absurd coordinates.

    Latitude must be in [-90, 90], longitude in [-180, 180]. We also drop
    `(0, 0)`-coded rows since they almost always indicate failed geocoding
    upstream rather than legitimate Gulf-of-Guinea sightings.
    """
    return df.filter(
        pl.col("latitude").is_not_null()
        & pl.col("longitude").is_not_null()
        & pl.col("latitude").is_between(-90, 90)
        & pl.col("longitude").is_between(-180, 180)
        & ~((pl.col("latitude") == 0) & (pl.col("longitude") == 0))
    )


def drop_duplicates(df: pl.DataFrame) -> pl.DataFrame:
    """Drop reports that look like the same event.

    Same shape + same city + same minute counts as a duplicate. Catches
    rows that the upstream scraper accidentally included twice.
    """
    return df.unique(
        subset=["occurred_at", "city", "state", "shape"],
        keep="first",
    )
