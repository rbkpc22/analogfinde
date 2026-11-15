"use client";

import { useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  GeoJSONSource,
  Map,
  type MapLayerMouseEvent,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl("/maplibre-worker");
import { formatCoord } from "@/lib/point";
import { partialScoreLabel } from "@/lib/score";
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
        "raster-saturation": -0.4,
        "raster-brightness-max": 0.85,
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

function graticule() {
  const features: { type: "Feature"; properties: Record<string, never>; geometry: { type: "LineString"; coordinates: [number, number][] } }[] = [];
  for (let lng = -180; lng < 180; lng += 30) {
    const coordinates: [number, number][] = [];
    for (let lat = -80; lat <= 80; lat += 4) coordinates.push([lng, lat]);
    features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const coordinates: [number, number][] = [];
    for (let lng = -180; lng <= 180; lng += 6) coordinates.push([lng, lat]);
    features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });
  }
  return { type: "FeatureCollection" as const, features };
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
      ? `<div style="margin:4px 0 6px;font-size:11px;letter-spacing:0.14em">CANDIDATO</div>`
      : site.usoNasa
        ? `<div style="margin:4px 0 6px;font-size:11px;letter-spacing:0.14em">NASA</div>`
        : "";
  const partial = partialScoreLabel(site);
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
    (partial ? `<div style="font-size:11px;letter-spacing:0.04em">${esc(partial)}</div>` : "") +
    more
  );
}

export default function MapView({
  sites,
  selectedName,
  flyTarget,
  accent,
  analyzing,
  probe,
  candidates,
  onSelect,
  onAnalyze,
  onOpenCandidate,
}: MapViewProps) {
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
  const propsRef = useRef({ sites, selectedName, flyTarget, onSelect, onAnalyze, onOpenCandidate, accent, analyzing });
  propsRef.current = { sites, selectedName, flyTarget, onSelect, onAnalyze, onOpenCandidate, accent, analyzing };
  const paintRef = useRef<() => void>(() => {});
  const [closeUp, setCloseUp] = useState(false);
  const [cursor, setCursor] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<Marker[]>([]);

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

    const paintAccent = () => {
      if (!mapa.isStyleLoaded()) return;
      const color = propsRef.current.accent;
      mapa.setSky({
        "sky-color": "#050505",
        "horizon-color": color,
        "fog-color": "#050505",
        "atmosphere-blend": 0.7,
        "horizon-fog-blend": 0.2,
        "sky-horizon-blend": 0.45,
      });
      if (mapa.getLayer("sitios")) {
        mapa.setPaintProperty("sitios", "circle-color", color);
        mapa.setPaintProperty("sitios", "circle-stroke-color", color);
      }
      if (mapa.getLayer("sitios-pulso")) {
        mapa.setPaintProperty("sitios-pulso", "circle-stroke-color", color);
      }
      if (mapa.getLayer("reticula")) {
        mapa.setPaintProperty("reticula", "line-color", color);
      }
    };

    const paintSpace = () => {
      mapa.setProjection({ type: "globe" });
      paintAccent();
    };

    const markerEl = document.createElement("div");
    markerEl.className = "crosshair";
    const markerLabel = document.createElement("span");
    markerEl.append(markerLabel);
    const crosshair = new Marker({ element: markerEl, anchor: "center" });

    const syncSites = () => {
      if (!readyRef.current) return;
      const data = collection(propsRef.current.sites, propsRef.current.selectedName);
      const source = mapa.getSource("sitios");
      if (source instanceof GeoJSONSource) source.setData(data);
      const selected = propsRef.current.sites.find(
        (site) => site.name === propsRef.current.selectedName && site.visible,
      );
      if (!selected) {
        crosshair.remove();
        return;
      }
      markerLabel.textContent = selected.name;
      crosshair.setLngLat([selected.lng, selected.lat]).addTo(mapa);
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
    paintRef.current = paintAccent;

    mapa.on("style.load", paintSpace);
    let pulseFrame = 0;
    mapa.on("load", () => {
      readyRef.current = true;
      setMapReady(true);
      spinningRef.current = !reduceMotion();
      mapa.addSource("sitios", {
        type: "geojson",
        data: collection(propsRef.current.sites, propsRef.current.selectedName),
      });
      mapa.addSource("reticula", { type: "geojson", data: graticule() });
      mapa.addLayer({
        id: "reticula",
        type: "line",
        source: "reticula",
        paint: {
          "line-color": propsRef.current.accent,
          "line-width": 1,
          "line-opacity": 0.12,
        },
      });
      mapa.addLayer({
        id: "sitios",
        type: "circle",
        source: "sitios",
        paint: {
          "circle-color": propsRef.current.accent,
          "circle-radius": ["case", ["==", ["get", "visible"], 1], 7, 0],
          "circle-opacity": [
            "case",
            ["==", ["get", "visible"], 1],
            ["interpolate", ["linear"], ["get", "puntaje"], 0, 0.12, 100, 0.45],
            0,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": propsRef.current.accent,
          "circle-stroke-opacity": [
            "case",
            ["==", ["get", "visible"], 1],
            ["interpolate", ["linear"], ["get", "puntaje"], 0, 0.3, 100, 1],
            0,
          ],
        },
      });
      mapa.addLayer({
        id: "sitios-pulso",
        type: "circle",
        source: "sitios",
        filter: ["all", ["==", ["get", "visible"], 1], [">=", ["get", "puntaje"], 80]],
        paint: {
          "circle-color": "transparent",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": propsRef.current.accent,
          "circle-stroke-opacity": 0.7,
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
      mapa.on("click", (event) => {
        if (!propsRef.current.analyzing) return;
        const hits = mapa.queryRenderedFeatures(event.point, { layers: ["sitios"] });
        if (hits.some((feature) => feature.properties?.visible === 1)) return;
        const { lat, lng } = event.lngLat;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        propsRef.current.onAnalyze(lat, lng);
      });
      mapa.on("mouseenter", "sitios", () => {
        mapa.getCanvas().style.cursor = "pointer";
      });
      mapa.on("mouseleave", "sitios", () => {
        mapa.getCanvas().style.cursor = propsRef.current.analyzing ? "crosshair" : "";
      });
      mapa.on("mousemove", (event) => {
        setCursor(formatCoord(event.lngLat.lat, event.lngLat.lng));
      });
      paintAccent();
      flySelection();
      spin();
      if (!reduceMotion()) {
        const pulse = (time: number) => {
          if (!mapRef.current?.getLayer("sitios-pulso")) return;
          const phase = (time % 2500) / 2500;
          mapRef.current.setPaintProperty("sitios-pulso", "circle-radius", 8 + phase * 14);
          mapRef.current.setPaintProperty("sitios-pulso", "circle-stroke-opacity", (1 - phase) * 0.65);
          pulseFrame = requestAnimationFrame(pulse);
        };
        pulseFrame = requestAnimationFrame(pulse);
      }
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
      cancelAnimationFrame(pulseFrame);
      observer.disconnect();
      popupRef.current?.remove();
      crosshair.remove();
      readyRef.current = false;
      setMapReady(false);
      syncRef.current = () => {};
      flyRef.current = () => {};
      paintRef.current = () => {};
      mapa.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    paintRef.current();
  }, [accent]);

  useEffect(() => {
    syncRef.current();
    const selected = sites.find((site) => site.name === selectedName);
    if (selected && popupRef.current?.isOpen()) popupRef.current.setHTML(popupHtml(selected));
  }, [sites, selectedName]);

  useEffect(() => {
    flyRef.current();
  }, [flyTarget]);

  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    if (!canvas) return;
    canvas.style.cursor = analyzing ? "crosshair" : "";
  }, [analyzing, mapReady]);

  useEffect(() => {
    const mapa = mapRef.current;
    if (!mapa || !mapReady) return;
    for (const marker of markersRef.current) marker.remove();
    const next: Marker[] = [];
    if (probe?.status === "loading") {
      const element = document.createElement("div");
      element.className = "point-scan";
      element.innerHTML =
        '<span class="point-scan-ring" aria-hidden="true"></span><span class="point-scan-label">CONSULTANDO NASA POWER…</span>';
      next.push(new Marker({ element, anchor: "center" }).setLngLat([probe.lng, probe.lat]).addTo(mapa));
    }
    const scanning = probe?.status === "loading" ? `${probe.queryLat},${probe.queryLng}` : "";
    for (const candidate of candidates) {
      if (`${candidate.queryLat},${candidate.queryLng}` === scanning) continue;
      const element = document.createElement("button");
      element.type = "button";
      element.className = "candidate-ring";
      element.setAttribute("aria-label", `Candidato ${formatCoord(candidate.lat, candidate.lng)}`);
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        propsRef.current.onOpenCandidate(candidate.id);
      });
      next.push(new Marker({ element, anchor: "center" }).setLngLat([candidate.lng, candidate.lat]).addTo(mapa));
    }
    markersRef.current = next;
    return () => {
      for (const marker of next) marker.remove();
    };
  }, [candidates, mapReady, probe]);

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
        className={`absolute top-[52px] right-2.5 z-10 border border-accent bg-panel px-3 py-2 font-mono text-[11px] tracking-[0.14em] text-accent uppercase min-[641px]:top-2.5 min-[641px]:right-14 ${
          closeUp ? "" : "hidden"
        }`}
      >
        Volver al globo
      </button>
      {cursor ? (
        <p className="pointer-events-none absolute bottom-2 left-3 z-10 font-mono text-[11px] tracking-[0.04em] text-[var(--text)] tabular-nums">
          {cursor}
        </p>
      ) : null}
    </div>
  );
}
