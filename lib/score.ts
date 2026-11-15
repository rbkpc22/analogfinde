import { DIMS, type DimKey, type Site, type Target } from "./data";
import { earthProfile } from "./nasa";

export type Weights = Record<DimKey, number>;

export type DimDiff = {
  key: DimKey;
  name: string;
  earth: number;
  target: number;
  diff: number;
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

/** Similitud = 100 × (1 − diferencia promedio ponderada / 10). */
export function scoreSite(site: Site, target: Target, weights: Weights): number {
  if (!site.p) return similitudScore(site) ?? 0;
  const earth = earthProfile(site);
  let sumW = 0;
  let sumD = 0;
  for (const d of DIMS) {
    const w = weights[d.key];
    sumW += w;
    sumD += w * Math.abs(earth[d.key] - target.p[d.key]);
  }
  return sumW === 0 ? 0 : Math.round(100 * (1 - sumD / (10 * sumW)));
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
  return DIMS.filter((d) => weights[d.key] > 0).map((d) => ({
    key: d.key,
    name: d.name,
    earth: earth[d.key],
    target: target.p[d.key],
    diff: Math.abs(earth[d.key] - target.p[d.key]),
  }));
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
