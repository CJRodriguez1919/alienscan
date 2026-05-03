"""Parse free-text duration strings into seconds.

NUFORC's duration field is famously messy: "5 minutes", "about an hour",
"2-3 sec", "until it disappeared", "30s+". We can't get all of it, but
covering the most common patterns recovers ~75% of rows.
"""

from __future__ import annotations

import re

_NUMBER_PATTERN = re.compile(
    r"""
    ^\s*
    (?P<num>
        \d+(?:\.\d+)?         # 5 or 5.5
        |
        \d+\s*[-–to]+\s*\d+   # 2-3 or 2 to 3
    )
    \s*
    (?P<unit>
        seconds?|secs?|s
        |minutes?|mins?|m
        |hours?|hrs?|h
        |days?|d
    )
    \b
    """,
    re.IGNORECASE | re.VERBOSE,
)

_UNIT_TO_SECONDS: dict[str, int] = {
    "s": 1, "sec": 1, "secs": 1, "second": 1, "seconds": 1,
    "m": 60, "min": 60, "mins": 60, "minute": 60, "minutes": 60,
    "h": 3600, "hr": 3600, "hrs": 3600, "hour": 3600, "hours": 3600,
    "d": 86400, "day": 86400, "days": 86400,
}

# Common phrases that map directly. We check these before the regex.
_PHRASE_OVERRIDES: dict[str, int] = {
    "a few seconds": 4,
    "few seconds": 4,
    "couple seconds": 2,
    "a couple seconds": 2,
    "a moment": 3,
    "instant": 1,
    "instantaneous": 1,
    "split second": 1,
    "a few minutes": 180,
    "few minutes": 180,
    "couple minutes": 120,
    "an hour": 3600,
    "about an hour": 3600,
    "all night": 28800,
}


def _parse_range(text: str) -> float:
    """Average a `2-3` style range."""
    parts = re.split(r"[-–to]+", text)
    nums = [float(p.strip()) for p in parts if p.strip()]
    return sum(nums) / len(nums) if nums else 0.0


def parse_duration(text: str | None) -> int | None:
    """Best-effort parse of a duration string to integer seconds.

    Returns None when the input is unparseable, empty, or pathological
    (negative or absurdly large > 1 week, which is almost always typoed
    or describes "since I was a child" memories).
    """
    if text is None:
        return None
    cleaned = text.strip().lower()
    if not cleaned:
        return None

    if cleaned in _PHRASE_OVERRIDES:
        return _PHRASE_OVERRIDES[cleaned]

    match = _NUMBER_PATTERN.match(cleaned)
    if not match:
        return None

    num_text = match.group("num")
    unit = match.group("unit").lower()

    multiplier = _UNIT_TO_SECONDS.get(unit)
    if multiplier is None:
        return None

    if any(c in num_text for c in "-–t"):
        value = _parse_range(num_text)
    else:
        try:
            value = float(num_text)
        except ValueError:
            return None

    seconds = int(round(value * multiplier))
    if seconds < 0 or seconds > 7 * 86400:
        return None
    return seconds
