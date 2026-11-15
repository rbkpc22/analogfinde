import { SITES, type Site, type Target } from "./data";
import { aridezFromPrecipitation, frioFromTemperature, type NasaAnnual } from "./nasa";
import { scorePoint, type Weights } from "./score";

export type Probe =
  | { status: "loading"; lat: number; lng: number; queryLat: number; queryLng: number }
  | {
      status: "error";
      lat: number;
      lng: number;
      queryLat: number;
      queryLng: number;
    }
  | {
      status: "ready";
      lat: number;
      lng: number;
      queryLat: number;
      queryLng: number;
      climate: NasaAnnual;
      elevation: number | null;
    };

export type Candidate = {
  id: string;
  lat: number;
  lng: number;
  queryLat: number;
  queryLng: number;
  climate: NasaAnnual;
  elevation: number | null;
};

const STORAGE_KEY = "analogfinder.candidatos";

export function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatCoord(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${ns} ${Math.abs(lng).toFixed(4)}°${ew}`;
}

export function cacheKey(lat: number, lng: number): string {
  return `${roundCoord(lat).toFixed(2)},${roundCoord(lng).toFixed(2)}`;
}

export function climateScore(climate: NasaAnnual, target: Target, weights: Weights): number | null {
  return scorePoint(
    frioFromTemperature(climate.T2M),
    aridezFromPrecipitation(climate.PRECTOTCORR),
    target,
    weights,
  );
}

export function haversineKm(latA: number, lngA: number, latB: number, lngB: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(latB - latA);
  const dLng = toRad(lngB - lngA);
  const lat1 = toRad(latA);
  const lat2 = toRad(latB);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function nearestSite(lat: number, lng: number, sites: Site[] = SITES): { site: Site; km: number } | null {
  let best: { site: Site; km: number } | null = null;
  for (const site of sites) {
    const km = haversineKm(lat, lng, site.lat, site.lng);
    if (!best || km < best.km) best = { site, km };
  }
  return best;
}

export function formatKm(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

function isClimate(value: unknown): value is NasaAnnual {
  if (!value || typeof value !== "object") return false;
  const row = value as NasaAnnual;
  return [row.T2M, row.T2M_MAX, row.T2M_MIN, row.PRECTOTCORR].every(
    (item) => typeof item === "number" && Number.isFinite(item) && item > -900,
  );
}

function isCandidate(value: unknown): value is Candidate {
  if (!value || typeof value !== "object") return false;
  const row = value as Candidate;
  return (
    typeof row.id === "string" &&
    typeof row.lat === "number" &&
    typeof row.lng === "number" &&
    typeof row.queryLat === "number" &&
    typeof row.queryLng === "number" &&
    (row.elevation === null || typeof row.elevation === "number") &&
    isClimate(row.climate)
  );
}

export function loadCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCandidate);
  } catch {
    return [];
  }
}

export function saveCandidates(items: Candidate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* modo privado o cuota llena */
  }
}
