import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FilterBar } from "@/components/filter-bar";

// MapLibre touches `window`, so the map component is client-only.
const SightingsMap = dynamic(
  () => import("@/components/sightings-map").then((m) => m.SightingsMap),
  { ssr: false },
);

export const metadata = {
  title: "Map — AlienScan",
};

export default function MapPage() {
  return (
    <div className="flex h-[calc(100vh-128px)] flex-col">
      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>
      <div className="relative flex-1">
        <SightingsMap />
      </div>
    </div>
  );
}
