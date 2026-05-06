import { describe, expect, it } from "vitest";
import { buildWhere } from "@/lib/queries";

describe("buildWhere", () => {
  it("returns TRUE when no filters", () => {
    const { clause, params } = buildWhere({});
    expect(clause).toBe("TRUE");
    expect(params).toEqual([]);
  });

  it("adds shape IN clause", () => {
    const { clause, params } = buildWhere({ shapes: ["triangle", "disk"] });
    expect(clause).toContain("shape IN (?, ?)");
    expect(params).toEqual(["triangle", "disk"]);
  });

  it("adds year range", () => {
    const { clause, params } = buildWhere({ yearFrom: 2010, yearTo: 2020 });
    expect(clause).toContain("EXTRACT(year FROM occurred_at) >= ?");
    expect(clause).toContain("EXTRACT(year FROM occurred_at) <= ?");
    expect(params).toEqual([2010, 2020]);
  });

  it("adds state filter", () => {
    const { clause, params } = buildWhere({ state: "CA" });
    expect(clause).toContain("state = ?");
    expect(params).toEqual(["CA"]);
  });

  it("adds duration bounds", () => {
    const { clause, params } = buildWhere({
      minDurationSec: 60,
      maxDurationSec: 600,
    });
    expect(clause).toContain("duration_seconds >= ?");
    expect(clause).toContain("duration_seconds <= ?");
    expect(params).toEqual([60, 600]);
  });

  it("adds bounding box (lon then lat order)", () => {
    const { clause, params } = buildWhere({
      bbox: { west: -120, south: 30, east: -100, north: 40 },
    });
    expect(clause).toContain("longitude BETWEEN ? AND ?");
    expect(clause).toContain("latitude BETWEEN ? AND ?");
    expect(params).toEqual([-120, -100, 30, 40]);
  });

  it("combines multiple filters with AND", () => {
    const { clause, params } = buildWhere({
      shapes: ["light"],
      state: "WA",
      yearFrom: 2015,
    });
    expect(clause).toMatch(/AND/);
    expect(params).toContain("light");
    expect(params).toContain("WA");
    expect(params).toContain(2015);
  });
});
