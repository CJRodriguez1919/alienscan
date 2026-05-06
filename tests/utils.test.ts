import { describe, expect, it } from "vitest";
import { formatDuration, formatDate, truncate, sortBy } from "@/lib/utils";

describe("formatDuration", () => {
  it("returns 'unknown' for null", () => {
    expect(formatDuration(null)).toBe("unknown");
  });

  it("formats sub-minute as seconds", () => {
    expect(formatDuration(30)).toBe("30s");
  });

  it("formats sub-hour as minutes", () => {
    expect(formatDuration(150)).toBe("3 min");
  });

  it("formats hours with one decimal under 10", () => {
    expect(formatDuration(3600 * 2.5)).toBe("2.5 hr");
  });

  it("formats large hours as integers", () => {
    expect(formatDuration(3600 * 12)).toBe("12 hr");
  });

  it("formats days", () => {
    expect(formatDuration(86400 * 3)).toBe("3 days");
  });
});

describe("formatDate", () => {
  it("returns em-dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns the input slice when unparseable", () => {
    expect(formatDate("not-a-date")).toBe("not-a-dat");
  });
});

describe("truncate", () => {
  it("returns the input when shorter than max", () => {
    expect(truncate("short", 100)).toBe("short");
  });

  it("truncates at word boundary with ellipsis", () => {
    const result = truncate("the quick brown fox jumps", 18);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("handles null/undefined", () => {
    expect(truncate(null, 10)).toBe("");
    expect(truncate(undefined, 10)).toBe("");
  });
});

describe("sortBy", () => {
  it("is stable for equal keys", () => {
    const items = [
      { id: 1, key: "a" },
      { id: 2, key: "a" },
      { id: 3, key: "b" },
      { id: 4, key: "a" },
    ];
    const sorted = sortBy(items, (i) => i.key);
    expect(sorted.map((i) => i.id)).toEqual([1, 2, 4, 3]);
  });
});
