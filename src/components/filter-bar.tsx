"use client";

import { useFilters } from "@/lib/use-filters";
import { ALL_SHAPES, type Shape } from "@/types/sighting";
import { cn } from "@/lib/utils";

const SHAPE_LABELS: Record<Shape, string> = {
  light: "Light",
  circle: "Circle",
  triangle: "Triangle",
  fireball: "Fireball",
  disk: "Disk",
  sphere: "Sphere",
  oval: "Oval",
  cigar: "Cigar",
  formation: "Formation",
  rectangle: "Rectangle",
  cylinder: "Cylinder",
  diamond: "Diamond",
  chevron: "Chevron",
  teardrop: "Teardrop",
  egg: "Egg",
  cross: "Cross",
  cone: "Cone",
  other: "Other",
  unknown: "Unknown",
};

const PRIMARY_SHAPES: Shape[] = [
  "light",
  "circle",
  "triangle",
  "fireball",
  "disk",
  "sphere",
];

export function FilterBar() {
  const { filters, setFilters } = useFilters();
  const selected = new Set(filters.shapes ?? []);

  function toggleShape(shape: Shape) {
    const next = new Set(selected);
    if (next.has(shape)) next.delete(shape);
    else next.add(shape);
    setFilters({
      ...filters,
      shapes: next.size === 0 ? undefined : (Array.from(next) as Shape[]),
    });
  }

  function setYear(field: "yearFrom" | "yearTo", value: string) {
    const n = Number(value);
    setFilters({
      ...filters,
      [field]: Number.isInteger(n) && n >= 1900 && n <= 2100 ? n : undefined,
    });
  }

  return (
    <div className="border-b border-paper-200 bg-paper-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {PRIMARY_SHAPES.map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => toggleShape(shape)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
                selected.has(shape)
                  ? "border-signal-500 bg-signal-500/10 text-signal-600"
                  : "border-paper-200 bg-white text-ink-700 hover:border-ink-500",
              )}
              aria-pressed={selected.has(shape)}
            >
              {SHAPE_LABELS[shape]}
            </button>
          ))}
          <details className="relative">
            <summary className="cursor-pointer rounded-full border border-paper-200 bg-white px-3 py-1 font-mono text-xs uppercase tracking-wide text-ink-500 hover:border-ink-500">
              + more
            </summary>
            <div className="absolute left-0 top-full z-10 mt-1 grid grid-cols-3 gap-1 rounded-md border border-paper-200 bg-paper-50 p-2 shadow-lg">
              {ALL_SHAPES.filter((s) => !PRIMARY_SHAPES.includes(s)).map(
                (shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => toggleShape(shape)}
                    className={cn(
                      "rounded border px-2 py-1 font-mono text-xs uppercase tracking-wide",
                      selected.has(shape)
                        ? "border-signal-500 bg-signal-500/10 text-signal-600"
                        : "border-paper-200 bg-white text-ink-700",
                    )}
                  >
                    {SHAPE_LABELS[shape]}
                  </button>
                ),
              )}
            </div>
          </details>
        </div>

        <div className="ml-auto flex items-center gap-2 font-mono text-xs text-ink-500">
          <label className="flex items-center gap-1.5">
            from
            <input
              type="number"
              min={1900}
              max={2100}
              defaultValue={filters.yearFrom ?? ""}
              onBlur={(e) => setYear("yearFrom", e.target.value)}
              placeholder="1900"
              className="w-20 rounded border border-paper-200 bg-white px-2 py-1 text-ink-900"
            />
          </label>
          <label className="flex items-center gap-1.5">
            to
            <input
              type="number"
              min={1900}
              max={2100}
              defaultValue={filters.yearTo ?? ""}
              onBlur={(e) => setYear("yearTo", e.target.value)}
              placeholder="2025"
              className="w-20 rounded border border-paper-200 bg-white px-2 py-1 text-ink-900"
            />
          </label>
          {(selected.size > 0 || filters.yearFrom || filters.yearTo) && (
            <button
              type="button"
              onClick={() => setFilters({})}
              className="rounded border border-paper-200 bg-white px-2 py-1 text-ink-500 hover:text-ink-900"
            >
              clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
