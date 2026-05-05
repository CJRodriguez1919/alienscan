"use client";

import { useEffect, useState } from "react";
import {
  countByShape,
  countByState,
  countByYear,
  holidayLift,
} from "@/lib/queries";
import type { ShapeCount, StateCount, YearCount } from "@/types/sighting";
import { BarChart } from "@/components/bar-chart";
import { YearTrend } from "@/components/year-trend";
import { StatCard } from "@/components/stat-card";

const HOLIDAYS: Record<string, string> = {
  "07-04": "Independence Day",
  "10-31": "Halloween",
  "12-31": "New Year's Eve",
  "01-01": "New Year's Day",
  "12-25": "Christmas",
  "11-05": "Election-adjacent",
};

interface HolidayRow {
  month_day: string;
  count: number;
  lift: number;
}

export default function StatsPage() {
  const [byShape, setByShape] = useState<ShapeCount[]>([]);
  const [byYear, setByYear] = useState<YearCount[]>([]);
  const [byState, setByState] = useState<StateCount[]>([]);
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      countByShape(),
      countByYear(),
      countByState(),
      holidayLift(),
    ])
      .then(([s, y, st, h]) => {
        if (cancelled) return;
        setByShape(s);
        setByYear(y);
        setByState(st);
        setHolidays(h as HolidayRow[]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const total = byShape.reduce((s, x) => s + x.count, 0);
  const peakYear =
    byYear.length > 0
      ? byYear.reduce((m, y) => (y.count > m.count ? y : m), byYear[0]!)
      : null;
  const topShape = byShape[0];

  const holidayRows = holidays
    .filter((h) => h.month_day in HOLIDAYS)
    .map((h) => ({ ...h, name: HOLIDAYS[h.month_day]! }))
    .sort((a, b) => b.lift - a.lift);

  return (
    <div className="container-page py-10">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-medium tracking-tightish text-ink-900">
          Stats
        </h1>
        <p className="mt-2 max-w-2xl text-ink-700">
          What the corpus actually looks like once you stop squinting at it.
        </p>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total sightings"
          value={loading ? "…" : total}
          hint="geocoded reports in the cleaned dataset"
        />
        <StatCard
          label="Peak year"
          value={loading ? "…" : (peakYear?.year ?? "—")}
          hint={
            peakYear
              ? `${peakYear.count.toLocaleString()} reports`
              : undefined
          }
        />
        <StatCard
          label="Most common shape"
          value={loading ? "…" : (topShape?.shape ?? "—")}
          hint={
            topShape ? `${topShape.count.toLocaleString()} reports` : undefined
          }
        />
      </div>

      <section className="mb-12 rounded-2xl border border-paper-200 bg-paper-50 p-6">
        <h2 className="font-display text-2xl font-medium text-ink-900">
          Sightings per year
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          The big spike around 2014 mostly tracks the rise of cellphone
          cameras and easier online reporting — not aliens.
        </p>
        <div className="mt-4">
          <YearTrend data={byYear} />
        </div>
      </section>

      <section className="mb-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-paper-200 bg-paper-50 p-6">
          <h2 className="font-display text-2xl font-medium text-ink-900">
            By shape
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            "Light" dominates — point sources are the most ambiguous report.
          </p>
          <div className="mt-4">
            <BarChart
              data={byShape.slice(0, 10).map((s) => ({
                label: s.shape,
                value: s.count,
              }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-paper-200 bg-paper-50 p-6">
          <h2 className="font-display text-2xl font-medium text-ink-900">
            Top states
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            CA and FL lead. Population matters; per-capita rankings tell a
            different story (looking at you, Washington).
          </p>
          <div className="mt-4">
            <BarChart
              data={byState.slice(0, 10).map((s) => ({
                label: s.state,
                value: s.count,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="mb-12 rounded-2xl border border-paper-200 bg-paper-50 p-6">
        <h2 className="font-display text-2xl font-medium text-ink-900">
          Holiday spikes
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          July 4 wins by a wide margin every year. Make of that what you will —
          fireworks, Chinese lanterns, and a few cold beers reliably look weird
          to people.
        </p>
        <table className="mt-4 w-full font-mono text-sm">
          <thead>
            <tr className="border-b border-paper-200 text-left text-xs uppercase text-ink-500">
              <th className="py-2">date</th>
              <th>holiday</th>
              <th className="text-right">reports</th>
              <th className="text-right">vs avg day</th>
            </tr>
          </thead>
          <tbody>
            {holidayRows.map((h) => (
              <tr key={h.month_day} className="border-b border-paper-200">
                <td className="py-2">{h.month_day}</td>
                <td>{h.name}</td>
                <td className="text-right">{h.count.toLocaleString()}</td>
                <td className="text-right text-signal-600">
                  {h.lift.toFixed(2)}×
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
