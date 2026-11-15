import { SITES } from "./data";

export type Planet = "tierra" | "luna" | "marte";

export type Round = {
  planet: Planet;
  place: string;
  image: string;
  siteName?: string;
  targetId?: string;
};

/**
 * Tiles comprobados contra el WMTS de Trek (trek.nasa.gov).
 * Plantilla: https://trek.nasa.gov/tiles/{cuerpo}/{proyección}/{capa}/1.0.0/default/default028mm/{z}/{fila}/{columna}
 * Luna polar: Moon/SP/LRO_NAC_AvgMosaic_SPole855_1mp (PNG, estereográfica).
 * Luna global: Moon/EQ/LRO_WAC_Mosaic_Global_303ppd (JPEG).
 * Marte global: Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m (JPEG).
 * Marte polar: Mars/NP/Mars_Viking_MDIM21_ClrMosaic_global_232m_np (PNG).
 * Tierra: Esri World Imagery, Web Mercator, zoom 12–14.
 */
const WORLDS: Round[] = [
  {
    planet: "luna",
    place: "Cráter Shackleton, polo sur lunar",
    targetId: "luna-sur",
    image:
      "https://trek.nasa.gov/tiles/Moon/SP/LRO_NAC_AvgMosaic_SPole855_1mp/1.0.0/default/default028mm/7/64/64.png",
  },
  {
    planet: "luna",
    place: "Mare Tranquillitatis",
    targetId: "luna-mare",
    image:
      "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd/1.0.0/default/default028mm/7/57/150.jpg",
  },
  {
    planet: "marte",
    place: "Cráter Jezero",
    targetId: "marte-jezero",
    image:
      "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/7/50/183.jpg",
  },
  {
    planet: "marte",
    place: "Olympia Undae",
    targetId: "marte-dunas",
    image:
      "https://trek.nasa.gov/tiles/Mars/NP/Mars_Viking_MDIM21_ClrMosaic_global_232m_np/1.0.0/default/default028mm/5/11/16.png",
  },
  {
    planet: "marte",
    place: "Arsia Mons",
    targetId: "marte-tharsis",
    image:
      "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/7/69/42.jpg",
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

export function earthTile(lat: number, lng: number, zoom: number): string {
  const size = 2 ** zoom;
  const x = clamp(Math.floor(((lng + 180) / 360) * size), 0, size - 1);
  const radians = (lat * Math.PI) / 180;
  const y = clamp(
    Math.floor(((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * size),
    0,
    size - 1,
  );
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
}

export function buildDeck(): Round[] {
  const earth = shuffle(SITES)
    .slice(0, 5)
    .map((site) => ({
      planet: "tierra" as const,
      place: site.name,
      siteName: site.name,
      image: earthTile(site.lat, site.lng, 12 + Math.floor(Math.random() * 3)),
    }));
  return shuffle([...WORLDS, ...earth]);
}

export function scoreMessage(score: number): string {
  if (score >= 10) return "Lectura perfecta. Los tres mundos ya no se te confunden.";
  if (score >= 9) return "Casi perfecto. Un mundo se te escapó.";
  if (score >= 7) return "Ojo de misión. El terreno ya casi no te engaña.";
  if (score >= 4) return "A medias. Vuelve a mirar cómo cambia el suelo.";
  return "Todavía se parecen demasiado. El globo te espera.";
}
