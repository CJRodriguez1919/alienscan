"use client";

import { useMemo } from "react";

interface YearTrendProps {
  data: Array<{ year: number; count: number }>;
  height?: number;
}

/**
 * Year-over-year line chart for sighting counts. Hand-rolled SVG keeps
 * the bundle clean and lets us highlight a few specific points (the
 * 2008 reporting tooling overhaul, the 2014 Starlink spike, etc.) on
 * the stats page.
 */
export function YearTrend({ data, height = 200 }: YearTrendProps) {
  const path = useMemo(() => {
    if (data.length < 2) return null;
    const minYear = data[0]!.year;
    const maxYear = data[data.length - 1]!.year;
    const maxCount = Math.max(...data.map((d) => d.count));
    const w = 1000;
    const h = height;
    const padX = 30;
    const padY = 16;
    const xAt = (year: number) =>
      padX +
      ((year - minYear) / Math.max(1, maxYear - minYear)) * (w - padX * 2);
    const yAt = (count: number) =>
      h - padY - (count / maxCount) * (h - padY * 2);

    const line = data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(d.year)} ${yAt(d.count)}`)
      .join(" ");
    const area =
      `M ${xAt(minYear)} ${h - padY} ` +
      data.map((d) => `L ${xAt(d.year)} ${yAt(d.count)}`).join(" ") +
      ` L ${xAt(maxYear)} ${h - padY} Z`;

    return { line, area, w, h, minYear, maxYear, maxCount, xAt, yAt };
  }, [data, height]);

  if (!path) {
    return (
      <div
        className="flex items-center justify-center font-mono text-sm text-ink-500"
        style={{ height }}
      >
        not enough data
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${path.w} ${path.h}`}
      preserveAspectRatio="none"
      className="h-auto w-full"
      role="img"
      aria-label="Sightings per year"
    >
      <path d={path.area} fill="rgba(95, 207, 111, 0.18)" />
      <path
        d={path.line}
        fill="none"
        stroke="#1f7a3d"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[path.minYear, Math.round((path.minYear + path.maxYear) / 2), path.maxYear].map(
        (year) => (
          <text
            key={year}
            x={path.xAt(year)}
            y={path.h - 2}
            textAnchor="middle"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            fill="#71717a"
          >
            {year}
          </text>
        ),
      )}
    </svg>
  );
}
