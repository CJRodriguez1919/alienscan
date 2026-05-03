"""Pipeline entry point.

Usage:

    uv run python -m alienscan_pipeline.build [--source SOURCE] [--out OUT]

Defaults to fetching the upstream cleaned dataset and writing
`public/data/sightings.parquet` from the project root.
"""

from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

import httpx
import polars as pl
from rich.console import Console

from .clean import drop_duplicates, filter_geocoded, normalize_columns
from .duration import parse_duration

# Cleaned NUFORC dataset published under CC0/CC-BY by the upstream project.
DEFAULT_SOURCE = (
    "https://raw.githubusercontent.com/timothyrenner/nuforc_sightings_data"
    "/master/data/processed/nuforc_reports.csv"
)

console = Console()


def _project_root() -> Path:
    """Resolve the repo root so default output paths work from anywhere."""
    return Path(__file__).resolve().parents[2]


def fetch_source(url: str) -> bytes:
    console.log(f"fetching {url}")
    with httpx.Client(timeout=120.0, follow_redirects=True) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.content


def load_csv(raw: bytes) -> pl.DataFrame:
    console.log("loading CSV")
    return pl.read_csv(
        io.BytesIO(raw),
        infer_schema_length=10_000,
        try_parse_dates=True,
        ignore_errors=True,
    )


def transform(df: pl.DataFrame) -> pl.DataFrame:
    console.log(f"input rows: {len(df):,}")

    # Adapt upstream column names to ours.
    rename_map = {
        "report_link": "source_url",
        "city_latitude": "latitude",
        "city_longitude": "longitude",
        "duration": "duration_text",
        "text": "summary",
    }
    cols_to_rename = {k: v for k, v in rename_map.items() if k in df.columns}
    df = df.rename(cols_to_rename)

    # Synthesize `occurred_at` / `reported_at` from upstream date fields.
    occurred_col = (
        "occurred"
        if "occurred" in df.columns
        else "date_time" if "date_time" in df.columns else None
    )
    reported_col = (
        "reported"
        if "reported" in df.columns
        else "posted" if "posted" in df.columns else None
    )

    if occurred_col is not None:
        df = df.with_columns(
            pl.col(occurred_col)
            .cast(pl.Utf8, strict=False)
            .str.to_datetime(strict=False, format=None)
            .alias("occurred_at")
        )
    if reported_col is not None:
        df = df.with_columns(
            pl.col(reported_col)
            .cast(pl.Utf8, strict=False)
            .str.to_datetime(strict=False, format=None)
            .alias("reported_at")
        )

    # Add country if upstream omitted it (the timothyrenner set is US/CA).
    if "country" not in df.columns:
        df = df.with_columns(pl.lit("US", dtype=pl.Utf8).alias("country"))

    # Stable per-row id from URL where available, otherwise positional.
    if "source_url" in df.columns:
        df = df.with_columns(
            pl.col("source_url")
            .str.extract(r"=(\d+)", 1)
            .fill_null(pl.int_range(0, df.height).cast(pl.Utf8))
            .alias("id")
        )
    else:
        df = df.with_columns(pl.int_range(0, df.height).cast(pl.Utf8).alias("id"))

    df = normalize_columns(df)

    df = df.with_columns(
        pl.col("duration_text")
        .map_elements(parse_duration, return_dtype=pl.Int64)
        .alias("duration_seconds")
    )

    df = filter_geocoded(df)
    console.log(f"after geocoded filter: {len(df):,}")

    df = drop_duplicates(df)
    console.log(f"after dedupe: {len(df):,}")

    final_cols = [
        "id",
        "occurred_at",
        "reported_at",
        "city",
        "state",
        "country",
        "shape",
        "duration_seconds",
        "duration_text",
        "summary",
        "latitude",
        "longitude",
        "source_url",
    ]
    for c in final_cols:
        if c not in df.columns:
            df = df.with_columns(pl.lit(None).alias(c))

    return df.select(final_cols).sort("occurred_at", nulls_last=True)


def write_parquet(df: pl.DataFrame, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    df.write_parquet(out, compression="zstd", compression_level=11)
    size_mb = out.stat().st_size / (1024 * 1024)
    console.log(f"wrote {out} ({size_mb:.1f} MB)")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build the AlienScan dataset.")
    parser.add_argument("--source", default=DEFAULT_SOURCE)
    parser.add_argument(
        "--out",
        type=Path,
        default=_project_root() / "public" / "data" / "sightings.parquet",
    )
    parser.add_argument(
        "--from-file",
        type=Path,
        default=None,
        help="Read CSV from a local file instead of downloading.",
    )
    args = parser.parse_args(argv)

    if args.from_file is not None:
        raw = args.from_file.read_bytes()
    else:
        raw = fetch_source(args.source)

    df = load_csv(raw)
    df = transform(df)
    write_parquet(df, args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
