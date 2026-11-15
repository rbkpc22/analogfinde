import { DIMS, type DimKey, type Site, type Target } from "./data";
import { categoryKnown, earthProfile } from "./nasa";

export type Weights = Record<DimKey, number>;

export type DimDiff = {
  key: DimKey;
  name: string;
  earth: number;
  target: number;
  diff: number;
  missing: boolean;
};

export function initialWeights(): Weights {
  return Object.fromEntries(DIMS.map((d) => [d.key, 1])) as Weights;
}

/** Promedio de la similitud del expediente (0–5) pasado a 0–100. */
export function similitudScore(site: Site): number | null {
  if (!site.similitud) return null;
  const values = Object.values(site.similitud);
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 20);
}

function axisValue(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Cuántas de las 9 categorías tienen número. Null si el sitio no usa ese perfil. */
export function coveredCategories(site: Site): { known: number; total: number } | null {
  if (!site.p) return null;
  const known = DIMS.filter((dim) => categoryKnown(site, dim.key)).length;
  if (known >= DIMS.length) return null;
  return { known, total: DIMS.length };
}

export function partialScoreLabel(site: Site): string | null {
  const covered = coveredCategories(site);
  if (!covered) return null;
  return `PUNTAJE PARCIAL · ${covered.known} de ${covered.total} categorías`;
}

/** Similitud = 100 × (1 − diferencia promedio ponderada / 10). Solo entran las categorías con dato. */
export function scoreSite(site: Site, target: Target, weights: Weights): number {
  if (!site.p) return similitudScore(site) ?? 0;
  const earth = earthProfile(site);
  let sumW = 0;
  let sumD = 0;
  for (const d of DIMS) {
    if (!categoryKnown(site, d.key)) continue;
    const w = axisValue(weights[d.key]);
    if (w <= 0) continue;
    sumW += w;
    sumD += w * Math.abs(axisValue(earth[d.key]) - axisValue(target.p[d.key]));
  }
  return sumW === 0 ? 0 : Math.round(100 * (1 - sumD / (10 * sumW)));
}

/**
 * Parecido de un punto usando solo frío y aridez.
 * 100 × (1 − Σ(w·|tierra − objetivo|) / (10·Σ w)). Null si ambos pesos son 0.
 */
export function scorePoint(frio: number, aridez: number, target: Target, weights: Weights): number | null {
  const axes: Array<[DimKey, number]> = [
    ["frio", frio],
    ["aridez", aridez],
  ];
  let sumW = 0;
  let sumD = 0;
  for (const [key, earth] of axes) {
    const weight = axisValue(weights[key]);
    if (weight <= 0) continue;
    sumW += weight;
    sumD += weight * Math.abs(earth - axisValue(target.p[key]));
  }
  if (sumW === 0) return null;
  return Math.round(100 * (1 - sumD / (10 * sumW)));
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#5fdc8f";
  if (score >= 65) return "#e9f542";
  if (score >= 50) return "#f5a142";
  return "#ff6b6b";
}

export function dimensionDiffs(site: Site, target: Target, weights: Weights): DimDiff[] {
  if (!site.p) return [];
  const earth = earthProfile(site);
  return DIMS.filter((d) => axisValue(weights[d.key]) > 0).map((d) => {
    const earthValue = axisValue(earth[d.key]);
    const targetValue = axisValue(target.p[d.key]);
    return {
      key: d.key,
      name: d.name,
      earth: earthValue,
      target: targetValue,
      diff: Math.abs(earthValue - targetValue),
      missing: !categoryKnown(site, d.key),
    };
  });
}

export function analogyLists(diffs: DimDiff[]): { parecidos: DimDiff[]; fallas: DimDiff[] } {
  const parecidos = [...diffs]
    .sort((a, b) => a.diff - b.diff)
    .filter((x) => x.diff <= 2)
    .slice(0, 3);
  const fallas = [...diffs]
    .sort((a, b) => b.diff - a.diff)
    .filter((x) => x.diff >= 4)
    .slice(0, 3);
  return { parecidos, fallas };
}
