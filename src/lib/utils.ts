import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a duration in seconds to a human-readable string.
 *
 * NUFORC durations are notoriously messy in the upstream data — most are
 * already free-text like "5 minutes" or "an hour-ish". We only call this
 * for rows where the pipeline successfully parsed a number.
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "unknown";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) {
    const hours = seconds / 3600;
    return `${hours.toFixed(hours < 10 ? 1 : 0)} hr`;
  }
  return `${Math.round(seconds / 86400)} days`;
}

export function formatYear(iso: string | null): string {
  if (!iso) return "—";
  return iso.slice(0, 4);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncate a string at a word boundary, with ellipsis.
 */
export function truncate(text: string | null | undefined, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  const sliced = text.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced).trim() + "…";
}

/**
 * Stable sort that keeps original order for equal keys.
 */
export function sortBy<T>(items: readonly T[], key: (t: T) => number | string): T[] {
  return [...items]
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const ka = key(a.item);
      const kb = key(b.item);
      if (ka < kb) return -1;
      if (ka > kb) return 1;
      return a.idx - b.idx;
    })
    .map((x) => x.item);
}
