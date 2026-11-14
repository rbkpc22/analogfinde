"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { scoreColor } from "@/lib/score";
import type { FlyTarget, MapViewProps } from "@/lib/view";

function MapController({ flyTarget }: { flyTarget: FlyTarget | null }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const fix = () => {
      map.invalidateSize();
    };
    fix();
    const timer = window.setTimeout(fix, 180);
    const observer = new ResizeObserver(fix);
    observer.observe(container);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  useEffect(() => {
    if (!flyTarget) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      map.setView([flyTarget.lat, flyTarget.lng], 6);
      return;
    }
    map.flyTo([flyTarget.lat, flyTarget.lng], 6, { duration: 0.8 });
  }, [flyTarget, map]);

  return null;
}

export default function MapView({ sites, selectedName, flyTarget, onSelect }: MapViewProps) {
  return (
    <MapContainer
      center={[25, -40]}
      zoom={2}
      worldCopyJump
      zoomControl={false}
      className="h-full w-full"
      style={{ height: "100%", width: "100%", background: "#0b0f1a" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={18}
      />
      <ZoomControl position="topright" />
      <MapController flyTarget={flyTarget} />
      {sites.map((site) => {
        const selected = site.name === selectedName;
        const radius = site.visible ? 5 + site.score / 12 : 0;
        return (
          <CircleMarker
            key={site.name}
            center={[site.lat, site.lng]}
            radius={radius}
            interactive={site.visible}
            pathOptions={{
              color: selected ? "#E9F542" : "#0b0f1a",
              weight: selected ? 3 : 2,
              fillColor: scoreColor(site.score),
              fillOpacity: site.visible ? 0.9 : 0,
              opacity: site.visible ? 1 : 0,
            }}
            eventHandlers={{
              click: () => {
                if (!site.visible) return;
                onSelect(site);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              {site.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
