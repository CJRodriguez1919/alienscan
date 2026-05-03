"""Tests for the duration parser."""

from __future__ import annotations

import pytest

from alienscan_pipeline.duration import parse_duration


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("5 seconds", 5),
        ("5 sec", 5),
        ("5s", 5),
        ("5.5 seconds", 6),  # rounds
        ("2 minutes", 120),
        ("2 min", 120),
        ("2 mins", 120),
        ("1 hour", 3600),
        ("1 hr", 3600),
        ("1 h", 3600),
        ("3 days", 3 * 86400),
        ("2-3 minutes", 150),  # range averaged
        ("2 to 3 min", 150),
        ("about an hour", 3600),
        ("a few seconds", 4),
        ("instantaneous", 1),
    ],
)
def test_parses_common_formats(text: str, expected: int) -> None:
    assert parse_duration(text) == expected


@pytest.mark.parametrize("text", ["", "   ", None, "until it disappeared", "weird"])
def test_returns_none_for_unparseable(text: str | None) -> None:
    assert parse_duration(text) is None


def test_filters_absurd_durations() -> None:
    # 30 days is over our 1-week sanity ceiling.
    assert parse_duration("30 days") is None


def test_negative_rejected() -> None:
    # The regex only matches positive numbers, but make sure nothing leaks.
    assert parse_duration("-5 seconds") is None


def test_case_insensitive() -> None:
    assert parse_duration("5 SECONDS") == 5
    assert parse_duration("5 Minutes") == 300
