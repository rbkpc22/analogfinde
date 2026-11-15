import { type DimKey, type Profile, type Site } from "./data";
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

const EMPTY_PROFILE: Profile = {
  aridez: 0,
  frio: 0,
  crateres: 0,
  volcanico: 0,
  polvo: 0,
  hielo: 0,
  subsuelo: 0,
  quimica: 0,
  vida: 0,
};

/** Perfil del lugar: frío y aridez salen de NASA POWER; el resto conserva la estimación. */
export function earthProfile(site: Site): Profile {
  if (!site.p) return EMPTY_PROFILE;
  const row = nasaRecord(site);
  if (!row) return site.p;
  return {
    ...site.p,
    frio: frioFromTemperature(row.T2M),
    aridez: aridezFromPrecipitation(row.PRECTOTCORR),
  };
}

export function categoryLabel(key: DimKey, site?: Site): "Dato NASA" | "Estimado" {
  const nasaCategory = key === "frio" || key === "aridez";
  if (!nasaCategory) return "Estimado";
  if (site && !nasaRecord(site)) return "Estimado";
  return "Dato NASA";
}

export function powerQueryUrl(site: Site): string {
  const url = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
  url.searchParams.set("parameters", "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR");
  url.searchParams.set("community", "RE");
  url.searchParams.set("longitude", String(site.lng));
  url.searchParams.set("latitude", String(site.lat));
  url.searchParams.set("format", "JSON");
  return url.toString();
}
