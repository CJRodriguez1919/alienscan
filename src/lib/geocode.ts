/**
 * Lightweight geocoder for the "AlienScan my area" feature.
 *
 * Uses Open-Meteo's free geocoding API — no key required, generous rate
 * limit, decent for cities and ZIP codes. We don't need building-level
 * accuracy here; sightings are city-level anyway.
 */

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  label: string;
  country_code: string | null;
  admin1: string | null;
}

export async function geocode(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return null;

  const url = new URL(ENDPOINT);
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Geocoder returned ${res.status}`);
  }
  const body = (await res.json()) as {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      country_code?: string;
      admin1?: string;
      admin2?: string;
    }>;
  };
  const first = body.results?.[0];
  if (!first) return null;

  const labelParts = [first.name, first.admin1, first.country_code].filter(
    Boolean,
  );
  return {
    latitude: first.latitude,
    longitude: first.longitude,
    label: labelParts.join(", "),
    country_code: first.country_code ?? null,
    admin1: first.admin1 ?? null,
  };
}
