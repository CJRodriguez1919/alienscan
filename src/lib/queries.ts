/**
 * Query helpers. Each function here is a single, well-defined data fetch
 * against the sightings table. Keeping these separated makes them
 * unit-testable and easy to compose into UI hooks.
 */

import { query, TABLE } from "./duckdb";
import type {
  Shape,
  ShapeCount,
  Sighting,
  SightingFilters,
  StateCount,
  YearCount,
} from "@/types/sighting";

/**
 * Build a SQL WHERE clause from filters. Returns the clause (without the
 * leading WHERE) and the bound parameters in order.
 *
 * We do parameter binding rather than string interpolation everywhere
 * except for the shape `IN (...)` list, which is fixed-size per request
 * and built from a known enum.
 */
export function buildWhere(filters: SightingFilters): {
  clause: string;
  params: unknown[];
} {
  const parts: string[] = [];
  const params: unknown[] = [];

  if (filters.shapes && filters.shapes.length > 0) {
    const placeholders = filters.shapes.map(() => "?").join(", ");
    parts.push(`shape IN (${placeholders})`);
    params.push(...filters.shapes);
  }

  if (filters.yearFrom !== undefined) {
    parts.push("EXTRACT(year FROM occurred_at) >= ?");
    params.push(filters.yearFrom);
  }
  if (filters.yearTo !== undefined) {
    parts.push("EXTRACT(year FROM occurred_at) <= ?");
    params.push(filters.yearTo);
  }
  if (filters.state) {
    parts.push("state = ?");
    params.push(filters.state);
  }
  if (filters.minDurationSec !== undefined) {
    parts.push("duration_seconds >= ?");
    params.push(filters.minDurationSec);
  }
  if (filters.maxDurationSec !== undefined) {
    parts.push("duration_seconds <= ?");
    params.push(filters.maxDurationSec);
  }
  if (filters.bbox) {
    parts.push("longitude BETWEEN ? AND ?");
    parts.push("latitude BETWEEN ? AND ?");
    params.push(filters.bbox.west, filters.bbox.east);
    params.push(filters.bbox.south, filters.bbox.north);
  }

  return {
    clause: parts.length > 0 ? parts.join(" AND ") : "TRUE",
    params,
  };
}

export async function fetchSightings(
  filters: SightingFilters = {},
  limit = 5000,
): Promise<Sighting[]> {
  const { clause, params } = buildWhere(filters);
  const sql = `
    SELECT id, occurred_at, reported_at, city, state, country,
           shape, duration_seconds, duration_text, summary,
           latitude, longitude, source_url
    FROM ${TABLE}
    WHERE ${clause}
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
    LIMIT ?
  `;
  return query<Sighting>(sql, [...params, limit]);
}

export async function countByShape(
  filters: SightingFilters = {},
): Promise<ShapeCount[]> {
  const { clause, params } = buildWhere(filters);
  const sql = `
    SELECT shape, COUNT(*)::INTEGER AS count
    FROM ${TABLE}
    WHERE ${clause}
    GROUP BY shape
    ORDER BY count DESC
  `;
  return query<ShapeCount>(sql, params);
}

export async function countByYear(
  filters: SightingFilters = {},
): Promise<YearCount[]> {
  const { clause, params } = buildWhere(filters);
  const sql = `
    SELECT EXTRACT(year FROM occurred_at)::INTEGER AS year,
           COUNT(*)::INTEGER AS count
    FROM ${TABLE}
    WHERE ${clause} AND occurred_at IS NOT NULL
    GROUP BY year
    ORDER BY year
  `;
  return query<YearCount>(sql, params);
}

export async function countByState(
  filters: SightingFilters = {},
): Promise<StateCount[]> {
  const { clause, params } = buildWhere(filters);
  const sql = `
    SELECT state, COUNT(*)::INTEGER AS count
    FROM ${TABLE}
    WHERE ${clause} AND state IS NOT NULL
    GROUP BY state
    ORDER BY count DESC
  `;
  return query<StateCount>(sql, params);
}

/**
 * The fun-stat backbone: how shape distributions have shifted decade by
 * decade. Drones and Starlink visibly bend the "light" curve from ~2015
 * onwards, which makes for a nice annotated chart.
 */
export async function shapeByDecade(): Promise<
  Array<{ decade: number; shape: Shape; count: number }>
> {
  const sql = `
    SELECT
      (EXTRACT(year FROM occurred_at)::INTEGER / 10) * 10 AS decade,
      shape,
      COUNT(*)::INTEGER AS count
    FROM ${TABLE}
    WHERE occurred_at IS NOT NULL
    GROUP BY decade, shape
    ORDER BY decade, count DESC
  `;
  return query(sql);
}

/**
 * Sightings on US holidays vs. average. We count by month-day, then
 * annotate a fixed list of dates client-side. Results are sorted by
 * lift over the daily mean.
 */
export async function holidayLift(): Promise<
  Array<{ month_day: string; count: number; lift: number }>
> {
  const sql = `
    WITH daily AS (
      SELECT
        STRFTIME(occurred_at, '%m-%d') AS month_day,
        COUNT(*)::INTEGER AS count
      FROM ${TABLE}
      WHERE occurred_at IS NOT NULL
      GROUP BY month_day
    ),
    avg AS (SELECT AVG(count) AS mean FROM daily)
    SELECT month_day, count, count / (SELECT mean FROM avg) AS lift
    FROM daily
    ORDER BY lift DESC
  `;
  return query(sql);
}

/**
 * Nearest-N sightings to a point. Uses a simple haversine in SQL — DuckDB
 * doesn't ship spatial extensions in WASM by default and pulling them in
 * isn't worth it for this query.
 */
export async function nearestSightings(
  lat: number,
  lon: number,
  n = 25,
): Promise<Array<Sighting & { distance_km: number }>> {
  const sql = `
    SELECT *,
      6371 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS((latitude - ?) / 2)), 2) +
        COS(RADIANS(?)) * COS(RADIANS(latitude)) *
        POWER(SIN(RADIANS((longitude - ?) / 2)), 2)
      )) AS distance_km
    FROM ${TABLE}
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    ORDER BY distance_km
    LIMIT ?
  `;
  return query(sql, [lat, lat, lon, n]);
}
