import type { Weights } from "./score";

export type Mission = {
  id: string;
  name: string;
  weights: Weights;
};

const base = {
  aridez: 0,
  frio: 0,
  crateres: 0,
  volcanico: 0,
  polvo: 0,
  hielo: 0,
  subsuelo: 0,
  quimica: 0,
  vida: 0,
} satisfies Weights;

/** Pesos de las 9 categorías. Aislamiento no es una de ellas: el hábitat sube frío y aridez. */
export const MISSIONS: Mission[] = [
  {
    id: "rover",
    name: "Rover",
    weights: { ...base, crateres: 3, polvo: 3, subsuelo: 1 },
  },
  {
    id: "habitat",
    name: "Hábitat/base",
    weights: { ...base, frio: 3, aridez: 3 },
  },
  {
    id: "taladro",
    name: "Taladro/recursos",
    weights: { ...base, hielo: 3, quimica: 3 },
  },
  {
    id: "trajes",
    name: "Trajes/caminatas",
    weights: { ...base, frio: 3, polvo: 3, crateres: 2, aridez: 2 },
  },
  {
    id: "comunicaciones",
    name: "Comunicaciones",
    weights: { ...base, crateres: 3, polvo: 2, volcanico: 2, subsuelo: 1 },
  },
];

export function sameWeights(a: Weights, b: Weights): boolean {
  return (Object.keys(a) as (keyof Weights)[]).every((key) => a[key] === b[key]);
}
