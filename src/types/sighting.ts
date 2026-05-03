/**
 * Shared types for AlienScan sightings data.
 *
 * These mirror the columns produced by the Python pipeline. Keep this file
 * in sync with `pipeline/alienscan_pipeline/schema.py`.
 */

export type Shape =
  | "light"
  | "circle"
  | "triangle"
  | "fireball"
  | "disk"
  | "sphere"
  | "oval"
  | "cigar"
  | "formation"
  | "rectangle"
  | "cylinder"
  | "diamond"
  | "chevron"
  | "teardrop"
  | "egg"
  | "cross"
  | "cone"
  | "other"
  | "unknown";

export const ALL_SHAPES: Shape[] = [
  "light",
  "circle",
  "triangle",
  "fireball",
  "disk",
  "sphere",
  "oval",
  "cigar",
  "formation",
  "rectangle",
  "cylinder",
  "diamond",
  "chevron",
  "teardrop",
  "egg",
  "cross",
  "cone",
  "other",
  "unknown",
];

/**
 * One row from the cleaned sightings table.
 *
 * `occurred_at` and `reported_at` are ISO-8601 strings (UTC where known).
 * `duration_seconds` is null when the upstream "duration" field couldn't
 * be parsed.
 */
export interface Sighting {
  id: string;
  occurred_at: string | null;
  reported_at: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  shape: Shape;
  duration_seconds: number | null;
  duration_text: string | null;
  summary: string | null;
  latitude: number | null;
  longitude: number | null;
  source_url: string | null;
}

export interface SightingFilters {
  shapes?: Shape[];
  yearFrom?: number;
  yearTo?: number;
  state?: string;
  minDurationSec?: number;
  maxDurationSec?: number;
  bbox?: BoundingBox;
}

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface ShapeCount {
  shape: Shape;
  count: number;
}

export interface YearCount {
  year: number;
  count: number;
}

export interface StateCount {
  state: string;
  count: number;
  per_capita?: number;
}

export interface AreaReport {
  query: string;
  resolved_lat: number;
  resolved_lon: number;
  resolved_label: string;
  total: number;
  nearest: Sighting[];
  by_shape: ShapeCount[];
  by_year: YearCount[];
  most_recent: Sighting | null;
}
