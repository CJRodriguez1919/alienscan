"""Tests for column normalization helpers."""

from __future__ import annotations

import polars as pl

from alienscan_pipeline.clean import (
    drop_duplicates,
    filter_geocoded,
    normalize_columns,
    normalize_shape,
)


def test_normalize_shape_canonical_passes() -> None:
    assert normalize_shape("triangle") == "triangle"
    assert normalize_shape("LIGHT") == "light"


def test_normalize_shape_aliases() -> None:
    assert normalize_shape("disc") == "disk"
    assert normalize_shape("Circular") == "circle"
    assert normalize_shape("orb") == "sphere"


def test_normalize_shape_unknown() -> None:
    assert normalize_shape(None) == "unknown"
    assert normalize_shape("") == "unknown"
    assert normalize_shape("blob-with-tentacles") == "unknown"


def test_normalize_columns_preserves_other_cols() -> None:
    df = pl.DataFrame(
        {
            "city": ["  los angeles  "],
            "state": ["ca"],
            "shape": ["circular"],
            "extra": ["preserve me"],
        }
    )
    result = normalize_columns(df)
    assert result["city"][0] == "Los Angeles"
    assert result["state"][0] == "CA"
    assert result["shape"][0] == "circle"
    assert result["extra"][0] == "preserve me"


def test_normalize_columns_strips_parens_qualifier() -> None:
    df = pl.DataFrame({"city": ["seattle (near)"], "state": ["wa"], "shape": ["disk"]})
    assert normalize_columns(df)["city"][0] == "Seattle"


def test_normalize_state_invalid() -> None:
    df = pl.DataFrame(
        {"city": ["x"], "state": ["california"], "shape": ["disk"]}
    )
    # Long-form names get nulled out — we only keep 2-letter codes
    assert normalize_columns(df)["state"][0] is None


def test_filter_geocoded_drops_missing() -> None:
    df = pl.DataFrame(
        {
            "latitude": [40.0, None, 200.0, 0.0],
            "longitude": [-100.0, -100.0, -100.0, 0.0],
        }
    )
    result = filter_geocoded(df)
    assert result.height == 1
    assert result["latitude"][0] == 40.0


def test_drop_duplicates() -> None:
    import datetime as dt

    when = dt.datetime(2020, 1, 1, 23, 0)
    df = pl.DataFrame(
        {
            "occurred_at": [when, when, when],
            "city": ["X", "X", "Y"],
            "state": ["CA", "CA", "CA"],
            "shape": ["disk", "disk", "disk"],
            "summary": ["a", "b", "c"],
        }
    )
    result = drop_duplicates(df)
    assert result.height == 2
