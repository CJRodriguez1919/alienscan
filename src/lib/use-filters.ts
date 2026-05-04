"use client";

/**
 * Hook for syncing sighting filters to the URL query string. This makes
 * every map/state/filter combination shareable.
 */

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Shape, SightingFilters } from "@/types/sighting";
import { ALL_SHAPES } from "@/types/sighting";

const SHAPE_SET = new Set<Shape>(ALL_SHAPES);

function parseShapes(raw: string | null): Shape[] | undefined {
  if (!raw) return undefined;
  const out: Shape[] = [];
  for (const s of raw.split(",")) {
    if (SHAPE_SET.has(s as Shape)) out.push(s as Shape);
  }
  return out.length > 0 ? out : undefined;
}

function parseInt32(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isInteger(n) ? n : undefined;
}

export function filtersFromSearchParams(
  params: URLSearchParams,
): SightingFilters {
  return {
    shapes: parseShapes(params.get("shapes")),
    yearFrom: parseInt32(params.get("from")),
    yearTo: parseInt32(params.get("to")),
    state: params.get("state") ?? undefined,
    minDurationSec: parseInt32(params.get("dmin")),
    maxDurationSec: parseInt32(params.get("dmax")),
  };
}

export function searchParamsFromFilters(
  filters: SightingFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.shapes && filters.shapes.length > 0) {
    params.set("shapes", filters.shapes.join(","));
  }
  if (filters.yearFrom !== undefined) params.set("from", String(filters.yearFrom));
  if (filters.yearTo !== undefined) params.set("to", String(filters.yearTo));
  if (filters.state) params.set("state", filters.state);
  if (filters.minDurationSec !== undefined) {
    params.set("dmin", String(filters.minDurationSec));
  }
  if (filters.maxDurationSec !== undefined) {
    params.set("dmax", String(filters.maxDurationSec));
  }
  return params;
}

export function useFilters(): {
  filters: SightingFilters;
  setFilters: (next: SightingFilters) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const setFilters = useCallback(
    (next: SightingFilters) => {
      const params = searchParamsFromFilters(next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return { filters, setFilters };
}
