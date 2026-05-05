"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Sighting } from "@/types/sighting";
import { fetchSightings } from "@/lib/queries";
import { useFilters } from "@/lib/use-filters";
import { formatDate, formatDuration, truncate } from "@/lib/utils";

const STYLE_URL =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export function SightingsMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  // Init the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [-95, 39],
      zoom: 3.5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    map.on("load", () => {
      map.addSource("sightings", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterRadius: 40,
        clusterMaxZoom: 9,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "sightings",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#a7e3b5",
            50,
            "#5fcf6f",
            500,
            "#1f7a3d",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            50,
            22,
            500,
            30,
          ],
          "circle-opacity": 0.85,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#fdfcf7",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "sightings",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#1a1a1d",
        },
      });

      map.addLayer({
        id: "unclustered",
        type: "circle",
        source: "sightings",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#34a853",
          "circle-radius": 5,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fdfcf7",
          "circle-opacity": 0.85,
        },
      });

      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId === undefined) return;
        const source = map.getSource("sightings") as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const geom = features[0]?.geometry;
          if (geom?.type === "Point") {
            map.easeTo({
              center: geom.coordinates as [number, number],
              zoom,
            });
          }
        });
      });

      map.on("click", "unclustered", (e) => {
        const feat = e.features?.[0];
        if (!feat || feat.geometry.type !== "Point") return;
        const props = feat.properties as Record<string, string>;
        new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat(feat.geometry.coordinates as [number, number])
          .setHTML(popupHtml(props))
          .addTo(map);
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "unclustered", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered", () => {
        map.getCanvas().style.cursor = "";
      });

      mapRef.current = map;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Refetch when filters change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSightings(filters, 20000)
      .then((rows) => {
        if (cancelled) return;
        setCount(rows.length);
        const features = rows
          .filter((r) => r.latitude !== null && r.longitude !== null)
          .map((r) => sightingToFeature(r));
        const geojson = {
          type: "FeatureCollection" as const,
          features,
        };
        const map = mapRef.current;
        if (map) {
          const source = map.getSource("sightings");
          if (source) {
            (source as maplibregl.GeoJSONSource).setData(geojson);
          } else {
            map.once("load", () => {
              (map.getSource("sightings") as maplibregl.GeoJSONSource).setData(
                geojson,
              );
            });
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load sightings", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute left-4 top-4 rounded-md border border-paper-200 bg-paper-50/95 px-3 py-2 font-mono text-xs text-ink-700 shadow-sm backdrop-blur">
        {loading ? "loading…" : `${count.toLocaleString()} sightings`}
      </div>
    </div>
  );
}

function sightingToFeature(s: Sighting): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [s.longitude!, s.latitude!],
    },
    properties: {
      id: s.id,
      shape: s.shape,
      city: s.city ?? "",
      state: s.state ?? "",
      occurred_at: s.occurred_at ?? "",
      duration_seconds: s.duration_seconds ?? "",
      summary: s.summary ?? "",
      source_url: s.source_url ?? "",
    },
  };
}

function popupHtml(props: Record<string, string>): string {
  const date = formatDate(props.occurred_at || null);
  const duration = props.duration_seconds
    ? formatDuration(Number(props.duration_seconds))
    : "—";
  const where = [props.city, props.state].filter(Boolean).join(", ");
  const summary = truncate(props.summary, 220);
  const link = props.source_url
    ? `<a href="${escapeHtml(props.source_url)}" target="_blank" rel="noopener" class="text-signal-600 underline">read full report</a>`
    : "";
  return `
    <div class="font-body text-sm text-ink-900 max-w-xs">
      <div class="font-display text-base capitalize">${escapeHtml(props.shape)}</div>
      <div class="text-ink-500 text-xs mb-1">${escapeHtml(where)} · ${escapeHtml(date)} · ${duration}</div>
      <div class="text-ink-700">${escapeHtml(summary)}</div>
      <div class="mt-2 text-xs">${link}</div>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
