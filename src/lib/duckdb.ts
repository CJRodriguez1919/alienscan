/**
 * DuckDB-WASM client.
 *
 * Loads the sightings parquet from /data and exposes a small `query` API.
 * The bundle is downloaded lazily on first query — subsequent queries reuse
 * the same connection.
 */

import * as duckdb from "@duckdb/duckdb-wasm";

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;

const PARQUET_URL = "/data/sightings.parquet";
const TABLE_NAME = "sightings";

async function initDb(): Promise<duckdb.AsyncDuckDB> {
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);

  // The worker has to be a Blob URL because Next.js doesn't serve the
  // jsdelivr-hosted worker from our own origin.
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {
      type: "text/javascript",
    }),
  );

  const worker = new Worker(workerUrl);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerUrl);

  // Register the parquet file as a virtual table.
  await db.registerFileURL(
    "sightings.parquet",
    PARQUET_URL,
    duckdb.DuckDBDataProtocol.HTTP,
    false,
  );

  const conn = await db.connect();
  await conn.query(
    `CREATE OR REPLACE VIEW ${TABLE_NAME} AS SELECT * FROM 'sightings.parquet'`,
  );
  await conn.close();

  return db;
}

export async function getDb(): Promise<duckdb.AsyncDuckDB> {
  if (!dbPromise) {
    dbPromise = initDb();
  }
  return dbPromise;
}

/**
 * Run a SQL query and return rows as plain JS objects.
 *
 * Uses parameterized queries when `params` is provided.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: readonly unknown[],
): Promise<T[]> {
  const db = await getDb();
  const conn = await db.connect();
  try {
    let result;
    if (params && params.length > 0) {
      const stmt = await conn.prepare(sql);
      result = await stmt.query(...params);
    } else {
      result = await conn.query(sql);
    }
    return result.toArray().map((row) => row.toJSON() as T);
  } finally {
    await conn.close();
  }
}

export const TABLE = TABLE_NAME;
