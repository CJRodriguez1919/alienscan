export const metadata = {
  title: "About — AlienScan",
};

export default function AboutPage() {
  return (
    <div className="container-page py-12">
      <article className="prose-tight max-w-3xl space-y-6">
        <header>
          <h1 className="font-display text-4xl font-medium tracking-tightish text-ink-900">
            About AlienScan
          </h1>
        </header>

        <section className="space-y-4">
          <p>
            AlienScan is a modern, fast frontend over the public NUFORC sighting
            database. The original NUFORC site is a treasure of weird Americana,
            but it looks like it was last styled in 1998. This is a 2026 take —
            same data, real maps, real filters, real stats.
          </p>

          <h2>What we are not</h2>
          <p>
            AlienScan is not a vehicle for telling you aliens are real. It's
            also not a vehicle for telling you they aren't. The data is what
            people reported. Some of those reports describe Venus low on the
            horizon. Some describe Starlink trains. Some are genuinely
            unexplained. We trust you to draw your own conclusions.
          </p>

          <h2>Where the data comes from</h2>
          <p>
            We do not scrape NUFORC directly — their terms of service forbid
            it. Instead, AlienScan builds on{" "}
            <a
              className="text-signal-600 underline"
              href="https://github.com/timothyrenner/nuforc_sightings_data"
              target="_blank"
              rel="noopener noreferrer"
            >
              timothyrenner/nuforc_sightings_data
            </a>
            , a CC-licensed cleaned and geocoded version of the corpus. Our
            pipeline applies a few additional standardizations and ships a
            compact Parquet file that the frontend queries with DuckDB-WASM.
          </p>
          <p>
            See <code>docs/DATA.md</code> in the repo for the full data
            lineage.
          </p>

          <h2>Honest caveats</h2>
          <ul className="ml-6 list-disc space-y-1.5 text-ink-700">
            <li>
              Locations are city-level. We can't pinpoint a sighting on a
              street.
            </li>
            <li>
              Reports are user-submitted and unverified. NUFORC staff classify
              some recent ones with confidence tiers; older entries are
              ungraded.
            </li>
            <li>
              Coverage is heavily US-biased. NUFORC is an American
              organization.
            </li>
            <li>
              The reporting volume reflects reporting infrastructure as much as
              actual sightings — the post-2014 spike maps neatly onto "everyone
              now has a camera in their pocket and a web form to fill out."
            </li>
          </ul>

          <h2>Open source</h2>
          <p>
            AlienScan is{" "}
            <a
              className="text-signal-600 underline"
              href="https://github.com/CJRodriguez1919/alienscan"
              target="_blank"
              rel="noopener noreferrer"
            >
              MIT-licensed on GitHub
            </a>
            . PRs welcome. If you want to add a non-US data source, build a new
            visualization, or just fix something, go for it.
          </p>
        </section>
      </article>
    </div>
  );
}
