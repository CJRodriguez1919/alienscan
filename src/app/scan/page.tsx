"use client";

import { useState } from "react";
import { geocode } from "@/lib/geocode";
import { nearestSightings, countByShape } from "@/lib/queries";
import type { Sighting, ShapeCount } from "@/types/sighting";
import { StatCard } from "@/components/stat-card";
import { BarChart } from "@/components/bar-chart";
import { formatDate, formatDuration, truncate } from "@/lib/utils";

interface ScanReport {
  label: string;
  lat: number;
  lon: number;
  nearest: Array<Sighting & { distance_km: number }>;
  byShape: ShapeCount[];
}

export default function ScanPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScanReport | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);
    if (query.trim().length === 0) return;
    setLoading(true);
    try {
      const place = await geocode(query);
      if (!place) {
        setError(`Couldn't find "${query}". Try a city name or ZIP code.`);
        return;
      }
      const nearest = await nearestSightings(place.latitude, place.longitude, 50);
      // Filter shape distribution to within ~150 km of the place
      const shapeCounts = new Map<string, number>();
      for (const s of nearest.filter((n) => n.distance_km <= 150)) {
        shapeCounts.set(s.shape, (shapeCounts.get(s.shape) ?? 0) + 1);
      }
      const byShape: ShapeCount[] = [...shapeCounts.entries()]
        .map(([shape, count]) => ({ shape: shape as Sighting["shape"], count }))
        .sort((a, b) => b.count - a.count);

      setReport({
        label: place.label,
        lat: place.latitude,
        lon: place.longitude,
        nearest: nearest.slice(0, 10),
        byShape,
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again?");
    } finally {
      setLoading(false);
    }
  }

  const within50km = report?.nearest.filter((n) => n.distance_km <= 50).length ?? 0;
  const within150km = report?.nearest.filter((n) => n.distance_km <= 150).length ?? 0;

  return (
    <div className="container-page py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl font-medium tracking-tightish text-ink-900">
          Scan my area
        </h1>
        <p className="mt-2 text-ink-700">
          Drop in a city or ZIP and we'll pull every reported sighting nearby
          out of the database. City-level accuracy — don't expect "in your
          backyard" precision.
        </p>
      </header>

      <form onSubmit={onSubmit} className="mb-10 flex max-w-xl gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Phoenix AZ, or 90210"
          className="flex-1 rounded-md border border-paper-200 bg-paper-50 px-4 py-2.5 font-body text-ink-900 placeholder:text-ink-500 focus:border-signal-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-ink-900 px-5 py-2.5 font-body text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "scanning…" : "Scan"}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-md border border-amber-warn/30 bg-amber-warn/10 px-4 py-3 font-mono text-sm text-amber-warn">
          {error}
        </div>
      )}

      {report && (
        <article className="space-y-8">
          <div>
            <div className="font-mono text-xs uppercase text-ink-500">
              report for
            </div>
            <h2 className="font-display text-3xl font-medium text-ink-900">
              {report.label}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Within 50 km" value={within50km} />
            <StatCard label="Within 150 km" value={within150km} />
            <StatCard
              label="Top shape nearby"
              value={report.byShape[0]?.shape ?? "—"}
              hint={
                report.byShape[0]
                  ? `${report.byShape[0].count} reports`
                  : undefined
              }
            />
          </div>

          {report.byShape.length > 0 && (
            <section className="rounded-2xl border border-paper-200 bg-paper-50 p-6">
              <h3 className="font-display text-xl font-medium text-ink-900">
                Shape distribution (within 150 km)
              </h3>
              <div className="mt-4">
                <BarChart
                  data={report.byShape.map((s) => ({
                    label: s.shape,
                    value: s.count,
                  }))}
                />
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-paper-200 bg-paper-50 p-6">
            <h3 className="font-display text-xl font-medium text-ink-900">
              Nearest reports
            </h3>
            <ul className="mt-4 divide-y divide-paper-200">
              {report.nearest.map((s) => (
                <li key={s.id} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-base capitalize text-ink-900">
                      {s.shape}
                    </span>
                    <span className="font-mono text-xs text-ink-500">
                      {s.distance_km.toFixed(1)} km · {formatDate(s.occurred_at)}
                    </span>
                  </div>
                  <div className="text-xs text-ink-500">
                    {[s.city, s.state].filter(Boolean).join(", ")} ·{" "}
                    {formatDuration(s.duration_seconds)}
                  </div>
                  {s.summary && (
                    <p className="mt-1 text-sm text-ink-700">
                      {truncate(s.summary, 240)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}
    </div>
  );
}
