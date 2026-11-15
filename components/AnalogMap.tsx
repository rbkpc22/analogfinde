"use client";

import dynamic from "next/dynamic";
import type { MapViewProps } from "@/lib/view";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0b0f1a] text-sm text-muted">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
      Cargando mapa…
    </div>
  ),
});

export default function AnalogMap(props: MapViewProps) {
  return (
    <div className="h-full w-full">
      <MapView {...props} />
    </div>
  );
}
