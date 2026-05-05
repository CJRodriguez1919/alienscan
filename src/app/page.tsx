import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container-page">
      {/* Hero */}
      <section className="relative py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-signal-500/10 via-paper-100 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-12 -z-10 h-64 w-64 rounded-full bg-signal-400/20 blur-3xl"
        />

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-paper-200 bg-paper-50 px-3 py-1 font-mono text-xs uppercase tracking-wider text-ink-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal-500" />
            signal acquired
          </span>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[1.05] tracking-tightish text-ink-900 sm:text-6xl">
            A century of <em className="not-italic text-signal-600">unidentified</em>,
            sorted out.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-700">
            AlienScan is a modern, searchable interface over 100,000+ UFO
            sighting reports. Filter by shape, scrub through decades, find what
            was reported near you. The data was always public — it just looked
            terrible.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-md bg-ink-900 px-5 py-3 font-body text-sm font-medium text-paper-50 transition-colors hover:bg-ink-700"
            >
              Open the map →
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-md border border-paper-200 bg-paper-50 px-5 py-3 font-body text-sm font-medium text-ink-900 transition-colors hover:border-ink-700"
            >
              Scan my area
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="grid gap-px overflow-hidden rounded-2xl border border-paper-200 bg-paper-200 sm:grid-cols-3">
        {[
          {
            tag: "01",
            title: "Map",
            body: "Every geocoded sighting in one place. Cluster, zoom, click for the original report.",
            href: "/map",
          },
          {
            tag: "02",
            title: "Stats",
            body: "Shape distributions over time, holiday spikes, state-by-state weirdness rankings.",
            href: "/stats",
          },
          {
            tag: "03",
            title: "Scan",
            body: "Type a city or ZIP. Get a personal sightings report card, ready to share.",
            href: "/scan",
          },
        ].map((feat) => (
          <Link
            key={feat.tag}
            href={feat.href}
            className="group bg-paper-50 p-6 transition-colors hover:bg-paper-100"
          >
            <div className="font-mono text-xs uppercase tracking-wider text-ink-500">
              {feat.tag}
            </div>
            <div className="mt-2 font-display text-2xl font-medium text-ink-900 group-hover:text-signal-600">
              {feat.title}
            </div>
            <p className="mt-2 text-sm text-ink-700">{feat.body}</p>
          </Link>
        ))}
      </section>

      {/* Pull quote / data note */}
      <section className="my-20 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tightish text-ink-900">
            Built on real data, treated honestly.
          </h2>
          <p className="mt-4 text-ink-700">
            AlienScan uses publicly available, redistributable cleaned versions
            of the NUFORC database. We do not scrape NUFORC directly. Sightings
            are city-level and unverified — that's the nature of the corpus.
          </p>
          <p className="mt-3 text-ink-700">
            Where mundane explanations are likely (Starlink trains line up with
            "fleet of lights" reports almost perfectly after 2019), we say so.
          </p>
        </div>
        <div className="rounded-2xl border border-paper-200 bg-paper-50 p-6 font-mono text-sm leading-relaxed text-ink-700">
          <div className="text-xs uppercase tracking-wider text-ink-500">
            sample query
          </div>
          <pre className="mt-2 whitespace-pre-wrap text-ink-900">{`SELECT shape, COUNT(*) AS n
FROM sightings
WHERE state = 'CA'
  AND occurred_at >= '2010-01-01'
GROUP BY shape
ORDER BY n DESC
LIMIT 5;`}</pre>
          <div className="mt-4 text-xs text-ink-500">
            runs in your browser — DuckDB-WASM, ~2 MB Parquet
          </div>
        </div>
      </section>
    </div>
  );
}
