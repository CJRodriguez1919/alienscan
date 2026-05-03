"""AlienScan data pipeline.

Downloads the upstream cleaned NUFORC dataset, applies our additional
standardizations, geocodes any rows missing coordinates by city/state
lookup, and emits a Parquet file the frontend can query.
"""

from __future__ import annotations

__version__ = "0.1.0"
