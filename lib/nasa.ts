import { DIMS, type DimKey, type Profile, type Site } from "./data";
import nasaPower from "./nasa-power.json";

export type NasaAnnual = {
  T2M: number;
  T2M_MAX: number;
  T2M_MIN: number;
  PRECTOTCORR: number;
};

export const NASA_BY_SITE = nasaPower as Record<string, NasaAnnual>;

export const NASA_POWER_HOME = "https://power.larc.nasa.gov/";

export function nasaRecord(site: Site): NasaAnnual | null {
  const row = NASA_BY_SITE[site.name];
  if (!row) return null;
  const values = [row.T2M, row.T2M_MAX, row.T2M_MIN, row.PRECTOTCORR];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value) || value <= -900)) {
    return null;
  }
  return row;
}

function scaleScore(value: number): number {
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 10) return 10;
  return rounded;
}

/**
 * Frío (0–10) a partir de la temperatura media anual T2M (°C), valor ANN de NASA POWER.
 * 0 = lugar cálido: T2M ≥ 25 °C.
 * 10 = frío extremo: T2M ≤ −15 °C.
 * Entre esos extremos la escala es lineal: 10 × (25 − T2M) / 40, redondeada al entero.
 * T2M_MAX y T2M_MIN se muestran en la ficha, pero no entran en el puntaje:
 * el resumen del año es la media.
 */
export function frioFromTemperature(t2m: number): number {
  return scaleScore((10 * (25 - t2m)) / 40);
}

/**
 * Aridez (0–10) a partir de la precipitación media anual PRECTOTCORR (mm/día), valor ANN.
 * 10 = hiperárido: precipitación ≤ 0.2 mm/día (unos 73 mm/año).
 * 0 = húmedo: precipitación ≥ 4 mm/día (unos 1460 mm/año).
 * Entre esos extremos la escala es lineal: 10 × (4 − precipitación) / 3.8, redondeada al entero.
 */
export function aridezFromPrecipitation(mmPerDay: number): number {
  return scaleScore((10 * (4 - mmPerDay)) / 3.8);
}

function categoryOrZero(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Perfil del lugar. Frío y aridez salen de NASA POWER cuando hay climatología. Una categoría ausente queda en 0 aquí, pero el puntaje la omite. */
export function earthProfile(site: Site): Profile {
  const base = Object.fromEntries(
    DIMS.map((dim) => [dim.key, categoryOrZero(site.p?.[dim.key])]),
  ) as Profile;
  const row = nasaRecord(site);
  if (!row) return base;
  return {
    ...base,
    frio: frioFromTemperature(row.T2M),
    aridez: aridezFromPrecipitation(row.PRECTOTCORR),
  };
}

export function categoryKnown(site: Site, key: DimKey): boolean {
  if ((key === "frio" || key === "aridez") && nasaRecord(site)) return true;
  return typeof site.p?.[key] === "number";
}

export function categoryLabel(key: DimKey, site?: Site): "Dato NASA" | "Estimado" {
  const nasaCategory = key === "frio" || key === "aridez";
  if (!nasaCategory) return "Estimado";
  if (site && !nasaRecord(site)) return "Estimado";
  return "Dato NASA";
}

/** Climatología por punto, comunidad RE. La misma consulta que los sitios conocidos. */
export function powerPointUrl(lat: number, lng: number): string {
  const url = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
  url.searchParams.set("parameters", "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR");
  url.searchParams.set("community", "RE");
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("format", "JSON");
  return url.toString();
}

export function powerQueryUrl(site: Site): string {
  return powerPointUrl(site.lat, site.lng);
}

function pointCacheKey(lat: number, lng: number): string {
  const round = (value: number) => (Math.round(value * 100) / 100).toFixed(2);
  return `${round(lat)},${round(lng)}`;
}

const powerPointCache = new Map<string, PowerSample>();

export function cachedPowerPoint(lat: number, lng: number): PowerSample | undefined {
  return powerPointCache.get(pointCacheKey(lat, lng));
}

export function rememberPowerPoint(lat: number, lng: number, sample: PowerSample) {
  powerPointCache.set(pointCacheKey(lat, lng), sample);
}

export type PowerSample = {
  climate: NasaAnnual;
  /** Metros. NASA POWER lo trae como tercera coordenada del punto. Null si no viene. */
  elevation: number | null;
};

function annualValue(parameter: Record<string, { ANN?: number }> | undefined, name: string): number {
  const value = parameter?.[name]?.ANN;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= -900) {
    throw new Error(name);
  }
  return value;
}

/**
 * Consulta NASA POWER en vivo. La caché usa latitud y longitud redondeadas a 2 decimales.
 * La elevación sale de geometry.coordinates[2]. Un valor que no es número o es ≤ −900 es un error.
 */
export async function fetchPowerPoint(lat: number, lng: number): Promise<PowerSample> {
  const queryLat = Math.round(lat * 100) / 100;
  const queryLng = Math.round(lng * 100) / 100;
  const cached = cachedPowerPoint(queryLat, queryLng);
  if (cached) return cached;
  const response = await fetch(powerPointUrl(queryLat, queryLng), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(String(response.status));
  const body = (await response.json()) as {
    geometry?: { coordinates?: number[] };
    properties?: { parameter?: Record<string, { ANN?: number }> };
  };
  const parameter = body.properties?.parameter;
  const elevation = body.geometry?.coordinates?.[2];
  if (typeof elevation !== "number" || !Number.isFinite(elevation) || elevation <= -900) {
    throw new Error("elevation");
  }
  const sample: PowerSample = {
    climate: {
      T2M: annualValue(parameter, "T2M"),
      T2M_MAX: annualValue(parameter, "T2M_MAX"),
      T2M_MIN: annualValue(parameter, "T2M_MIN"),
      PRECTOTCORR: annualValue(parameter, "PRECTOTCORR"),
    },
    elevation,
  };
  rememberPowerPoint(queryLat, queryLng, sample);
  return sample;
}
