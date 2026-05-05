"use client";

import { useMemo } from "react";

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  maxBars?: number;
  valueFormat?: (n: number) => string;
}

/**
 * Tiny no-dep bar chart. We don't pull in recharts/d3 because the chart
 * needs are minimal and the bundle savings are real.
 */
export function BarChart({
  data,
  height = 240,
  maxBars = 20,
  valueFormat = (n) => n.toLocaleString(),
}: BarChartProps) {
  const trimmed = useMemo(() => data.slice(0, maxBars), [data, maxBars]);
  const max = useMemo(
    () => trimmed.reduce((m, d) => Math.max(m, d.value), 0) || 1,
    [trimmed],
  );

  if (trimmed.length === 0) {
    return (
      <div
        className="flex items-center justify-center font-mono text-sm text-ink-500"
        style={{ height }}
      >
        no data
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-1.5" style={{ minHeight: height }}>
        {trimmed.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div
              key={d.label}
              className="grid grid-cols-[6rem_1fr_auto] items-center gap-3"
            >
              <div className="truncate font-mono text-xs uppercase text-ink-700">
                {d.label}
              </div>
              <div className="relative h-6 overflow-hidden rounded bg-paper-100">
                <div
                  className="absolute inset-y-0 left-0 bg-signal-400/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="font-mono text-xs text-ink-700">
                {valueFormat(d.value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
