import { describe, expect, it } from "vitest";
import {
  filtersFromSearchParams,
  searchParamsFromFilters,
} from "@/lib/use-filters";

describe("filter URL roundtrip", () => {
  it("encodes and decodes shapes", () => {
    const params = searchParamsFromFilters({ shapes: ["triangle", "disk"] });
    const decoded = filtersFromSearchParams(params);
    expect(decoded.shapes).toEqual(["triangle", "disk"]);
  });

  it("encodes year range", () => {
    const params = searchParamsFromFilters({ yearFrom: 2000, yearTo: 2020 });
    expect(params.get("from")).toBe("2000");
    expect(params.get("to")).toBe("2020");
  });

  it("ignores unknown shape strings", () => {
    const params = new URLSearchParams("shapes=triangle,not-a-shape,disk");
    const decoded = filtersFromSearchParams(params);
    expect(decoded.shapes).toEqual(["triangle", "disk"]);
  });

  it("returns undefined when no shapes parse", () => {
    const params = new URLSearchParams("shapes=zzz");
    const decoded = filtersFromSearchParams(params);
    expect(decoded.shapes).toBeUndefined();
  });

  it("ignores non-integer year params", () => {
    const params = new URLSearchParams("from=abc&to=2020");
    const decoded = filtersFromSearchParams(params);
    expect(decoded.yearFrom).toBeUndefined();
    expect(decoded.yearTo).toBe(2020);
  });

  it("omits empty filters from output", () => {
    const params = searchParamsFromFilters({});
    expect(params.toString()).toBe("");
  });
});
