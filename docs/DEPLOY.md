# Deploying AlienScan

The site is a static-export-friendly Next.js app + a Parquet data
file. Anywhere that serves static files works; we recommend Vercel
(zero-config) or Cloudflare Pages.

## Vercel (recommended)

1. Push the repo to GitHub.
2. Import the repo at <https://vercel.com/new>.
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `pnpm build` (default).
5. Output directory: `.next` (default).
6. The `Cross-Origin-*` headers required for DuckDB-WASM are already set
   in `next.config.js`, no extra configuration needed.

After the first deploy, run the data pipeline locally and upload the
resulting `public/data/sightings.parquet` either by committing it (if
you're OK with a ~6 MB file in git history) or by uploading to a
storage bucket and updating `PARQUET_URL` in `src/lib/duckdb.ts`.

## Cloudflare Pages

Same steps as Vercel; preset is also Next.js.

## Self-hosted

```bash
pnpm install
pnpm build
pnpm start  # runs on :3000
```

You'll want to put it behind a CDN that respects the `COOP/COEP`
headers — DuckDB-WASM needs `SharedArrayBuffer`, which requires the
page to be cross-origin-isolated.

## Data file hosting

Two options for the Parquet:

1. **Commit it.** Simplest. Git LFS recommended if the file is over
   ~10 MB. The current dataset is well under that.
2. **Object storage.** Upload to R2/S3/B2, set the URL via an env var,
   read it in `src/lib/duckdb.ts` from `process.env.NEXT_PUBLIC_PARQUET_URL`.
   Recommended once the dataset grows past ~20 MB.

## Updating the data

```bash
cd pipeline
uv run python -m alienscan_pipeline.build
git add ../public/data/sightings.parquet
git commit -m "data: refresh sightings snapshot"
git push
```

CI does **not** rebuild the data on every push. The pipeline runs only
when you choose to.
