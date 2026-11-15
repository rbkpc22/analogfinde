"use client";

import dynamic from "next/dynamic";
import type { MapViewProps } from "@/lib/view";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-canvas text-sm text-muted">
      <span className="mr-2 inline-block h-1.5 w-1.5 bg-accent" />
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
