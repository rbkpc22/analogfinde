"use client";

import { useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  GeoJSONSource,
  Map,
  type MapLayerMouseEvent,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl("/maplibre-worker");
import type { MapSite, MapViewProps } from "@/lib/view";

const GLOBE_ZOOM = 1.6;
const PLACE_ZOOM = 10;
const GLOBE_CENTER: [number, number] = [-60, 15];

const estilo = {
  version: 8 as const,
  projection: { type: "globe" as const },
  sources: {
    satelite: {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Imágenes © Esri, Maxar, Earthstar Geographics",
    },
    calles: {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Mapa © Esri, HERE, Garmin, OpenStreetMap",
    },
  },
  layers: [
    {
      id: "satelite",
      type: "raster" as const,
      source: "satelite",
      paint: {
        "raster-opacity": ["interpolate", ["linear"], ["zoom"], 5, 1, 7, 0],
      },
    },
    {
      id: "calles",
      type: "raster" as const,
      source: "calles",
      paint: {
        "raster-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0, 7, 1],
      },
    },
  ],
};

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] ?? char;
  });
}

function collection(sites: MapSite[], selectedName: string | null) {
  return {
    type: "FeatureCollection" as const,
    features: sites.map((site) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [site.lng, site.lat] },
      properties: {
        nombre: site.name,
        lugar: site.where,
        descripcion: site.desc,
        puntaje: site.score,
        visible: site.visible ? 1 : 0,
        selected: site.name === selectedName ? 1 : 0,
      },
    })),
  };
}

function popupHtml(site: MapSite) {
  const candidato =
    site.estado === "candidato"
      ? `<div style="display:inline-block;margin:4px 0 6px;background:#e9f542;color:#111;border-radius:999px;padding:1px 8px;font-size:11px;font-weight:700">Candidato</div>`
      : "";
  const extra = [
    site.altitud ? `<div><b>Altitud:</b> ${esc(site.altitud)}</div>` : "",
    site.ubicacion ? `<div><b>Ubicación:</b> ${esc(site.ubicacion)}</div>` : "",
    site.tipoTerreno ? `<div><b>Terreno:</b> ${esc(site.tipoTerreno)}</div>` : "",
  ].join("");
  const more = site.geologia?.length || site.comparacion || site.pruebas?.length
    ? `<p>La geología, la comparación, las pruebas y las fuentes están en el panel.</p>`
    : site.desc
      ? `<p>${esc(site.desc)}</p>`
      : "";
  return (
    `<h3>${esc(site.name)}</h3>` +
    candidato +
    `<div>${esc(site.where)}</div>` +
    extra +
    `<div><b>Puntaje:</b> ${site.score}</div>` +
    more
  );
}

export default function MapView({ sites, selectedName, flyTarget, onSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const readyRef = useRef(false);
  const spinningRef = useRef(false);
  const userMovingRef = useRef(false);
  const closeUpRef = useRef(false);
  const returningRef = useRef(false);
  const flownSeq = useRef<number | null>(null);
  const syncRef = useRef<() => void>(() => {});
  const flyRef = useRef<() => void>(() => {});
  const propsRef = useRef({ sites, selectedName, flyTarget, onSelect });
  propsRef.current = { sites, selectedName, flyTarget, onSelect };
  const [closeUp, setCloseUp] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const mapa = new Map({
      container,
      style: estilo as unknown as StyleSpecification,
      center: GLOBE_CENTER,
      zoom: GLOBE_ZOOM,
      attributionControl: false,
    });
    mapRef.current = mapa;
    mapa.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapa.addControl(new AttributionControl({ compact: true }), "bottom-right");

    const paintSpace = () => {
      mapa.setProjection({ type: "globe" });
      mapa.setSky({
        "sky-color": "#05070d",
        "horizon-color": "#1a3358",
        "fog-color": "#05070d",
        "atmosphere-blend": 0.85,
      });
    };

    const syncSites = () => {
      if (!readyRef.current) return;
      const data = collection(propsRef.current.sites, propsRef.current.selectedName);
      const source = mapa.getSource("sitios");
      if (source instanceof GeoJSONSource) source.setData(data);
    };

    const openPopup = (site: MapSite) => {
      popupRef.current?.remove();
      popupRef.current = new Popup({ offset: 12, maxWidth: "260px" })
        .setLngLat([site.lng, site.lat])
        .setHTML(popupHtml(site))
        .addTo(mapa);
    };

    const goTo = (lat: number, lng: number, zoom: number) => {
      spinningRef.current = false;
      mapa.stop();
      if (reduceMotion()) {
        mapa.jumpTo({ center: [lng, lat], zoom });
        return;
      }
      mapa.flyTo({
        center: [lng, lat],
        zoom,
        speed: zoom > GLOBE_ZOOM ? 0.9 : 1.2,
        curve: 1.5,
        essential: true,
      });
    };

    const flySelection = () => {
      const target = propsRef.current.flyTarget;
      if (!target || !readyRef.current || flownSeq.current === target.seq) return;
      flownSeq.current = target.seq;
      closeUpRef.current = true;
      setCloseUp(true);
      goTo(target.lat, target.lng, PLACE_ZOOM);
      const site = propsRef.current.sites.find((item) => item.name === propsRef.current.selectedName);
      if (site) openPopup(site);
    };

    const spin = () => {
      if (returningRef.current || !spinningRef.current || userMovingRef.current || mapa.getZoom() >= 3 || mapa.isMoving()) return;
      const center = mapa.getCenter();
      mapa.easeTo({
        center: [center.lng - 6, center.lat],
        duration: 1000,
        easing: (amount: number) => amount,
      });
    };

    syncRef.current = syncSites;
    flyRef.current = flySelection;

    mapa.on("style.load", paintSpace);
    mapa.on("load", () => {
      readyRef.current = true;
      spinningRef.current = !reduceMotion();
      mapa.addSource("sitios", {
        type: "geojson",
        data: collection(propsRef.current.sites, propsRef.current.selectedName),
      });
      mapa.addLayer({
        id: "sitios",
        type: "circle",
        source: "sitios",
        paint: {
          "circle-color": ["step", ["get", "puntaje"], "#ff6b6b", 50, "#f5a142", 65, "#e9f542", 80, "#5fdc8f"],
          "circle-radius": [
            "case",
            ["==", ["get", "visible"], 1],
            ["interpolate", ["linear"], ["get", "puntaje"], 0, 6, 100, 14],
            0,
          ],
          "circle-opacity": ["case", ["==", ["get", "visible"], 1], 0.95, 0],
          "circle-stroke-width": ["case", ["==", ["get", "selected"], 1], 3, 2],
          "circle-stroke-color": ["case", ["==", ["get", "selected"], 1], "#E9F542", "#111"],
        },
      });
      mapa.on("click", "sitios", (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const nombre = feature?.properties?.nombre;
        if (!feature || feature.properties?.visible !== 1 || typeof nombre !== "string") return;
        const site = propsRef.current.sites.find((item) => item.name === nombre);
        if (!site?.visible) return;
        propsRef.current.onSelect(site);
      });
      mapa.on("mouseenter", "sitios", () => {
        mapa.getCanvas().style.cursor = "pointer";
      });
      mapa.on("mouseleave", "sitios", () => {
        mapa.getCanvas().style.cursor = "";
      });
      flySelection();
      spin();
    });

    const hold = () => {
      userMovingRef.current = true;
    };
    const release = () => {
      userMovingRef.current = false;
      spin();
    };
    mapa.on("mousedown", hold);
    mapa.on("touchstart", hold);
    mapa.on("mouseup", release);
    mapa.on("touchend", release);
    mapa.on("moveend", () => {
      if (returningRef.current) return;
      spin();
    });

    const fix = () => mapa.resize();
    fix();
    const timer = window.setTimeout(fix, 180);
    const observer = new ResizeObserver(fix);
    observer.observe(container);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      popupRef.current?.remove();
      readyRef.current = false;
      syncRef.current = () => {};
      flyRef.current = () => {};
      mapa.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    syncRef.current();
    const selected = sites.find((site) => site.name === selectedName);
    if (selected && popupRef.current?.isOpen()) popupRef.current.setHTML(popupHtml(selected));
  }, [sites, selectedName]);

  useEffect(() => {
    flyRef.current();
  }, [flyTarget]);

  function volver() {
    const mapa = mapRef.current;
    if (!mapa) return;
    popupRef.current?.remove();
    closeUpRef.current = false;
    returningRef.current = true;
    spinningRef.current = false;
    setCloseUp(false);
    mapa.stop();
    const settle = () => {
      if (!mapRef.current) return;
      const zoom = mapRef.current.getZoom();
      const lat = mapRef.current.getCenter().lat;
      if (zoom > GLOBE_ZOOM + 0.45 || Math.abs(lat - GLOBE_CENTER[1]) > 25) {
        mapRef.current.jumpTo({ center: GLOBE_CENTER, zoom: GLOBE_ZOOM, bearing: 0, pitch: 0 });
      }
      returningRef.current = false;
      spinningRef.current = !reduceMotion();
      mapRef.current.fire("moveend");
    };
    if (reduceMotion()) {
      mapa.jumpTo({ center: GLOBE_CENTER, zoom: GLOBE_ZOOM, bearing: 0, pitch: 0 });
      settle();
      return;
    }
    mapa.flyTo({
      center: GLOBE_CENTER,
      zoom: GLOBE_ZOOM,
      bearing: 0,
      pitch: 0,
      speed: 0.9,
      curve: 1.4,
      essential: true,
    });
    window.setTimeout(settle, 1800);
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="map-globe h-full w-full" />
      <button
        id="volver"
        type="button"
        onClick={volver}
        className={`absolute top-[52px] right-2.5 z-10 rounded-xl bg-[#1f6feb] px-3.5 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-[#388bfd] min-[641px]:top-2.5 min-[641px]:right-14 ${
          closeUp ? "" : "hidden"
        }`}
      >
        Volver al globo
      </button>
    </div>
  );
}
