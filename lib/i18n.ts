import type { DimKey } from "./data";

export type Locale = "es" | "en";

const STORAGE_KEY = "analogfinder.idioma";

export function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {
    /* modo privado o almacenamiento bloqueado */
  }
  return "es";
}

export function writeLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* modo privado o cuota llena */
  }
}

const es = {
  language: "Idioma",
  missionControl: "Centro de control de misión",
  tagline: "¿Qué lugar de la Tierra se parece más a la Luna o a Marte… y en qué no?",
  gameButton: "¿Tierra, Luna o Marte?",
  aboutButton: "Acerca del proyecto",
  pickTarget: "1 · Elige un objetivo",
  whatToTest: "¿Qué quieres probar?",
  whatMatters: "2 · ¿Qué te importa más?",
  bestNow: "MEJOR SITIO AHORA: {name} · {score}",
  weightHint: "0 ignora la categoría · 3 la prioriza",
  onlyNew: "Solo lugares poco estudiados",
  versionNote:
    "Versión 0.1 · Frío y aridez de cada lugar se calculan con la climatología de NASA POWER. Las demás categorías (0–10) siguen siendo estimaciones del equipo a partir de la literatura. Próximo paso: calcularlas con datos abiertos de NASA (MODIS, NASADEM, Landsat, LRO LOLA/Diviner, MOLA, CRISM).",
  similarPlaces: "Lugares más parecidos",
  countOf: "{shown} de {total}",
  partialSection: "DATOS PARCIALES · solo frío y aridez (NASA POWER)",
  myCandidates: "Mis candidatos",
  delete: "Borrar",
  detail: "Detalle",
  emptyDetail: "Haz clic en un lugar del mapa o de la lista.",
  analyzePoint: "⌖ Analizar un punto",
  clickPlanet: "Da clic en cualquier lugar del planeta",
  objective: "Objetivo",
  score: "Puntaje",
  reset: "Restablecer",
  close: "Cerrar",
  backToGlobe: "Volver al globo",
  backToMap: "Volver al mapa",
  welcomeAria: "Bienvenida a AnalogFinder",
  init: "INICIALIZANDO ANALOGFINDER…",
  sitesLoaded: "{count} SITIOS ANÁLOGOS CARGADOS",
  dataSource: "FUENTE DE DATOS: NASA POWER",
  enter: "> ENTRAR",
  consulting: "CONSULTANDO NASA POWER…",
  powerFailed: "No se pudo consultar NASA POWER",
  retry: "Reintentar",
  analyzedPoint: "Punto analizado",
  raiseWeights: "Sube el peso de Frío o Aridez para comparar",
  partialPointScore: "PUNTAJE PARCIAL · 2 de 9 categorías",
  resemblesClimate: "Este lugar se parece {score}% a {name} en frío y aridez.",
  oceanWarning: "Este punto podría estar en el mar; verifica que sea tierra firme.",
  realData: "Datos reales · NASA POWER",
  tempMean: "Temperatura media anual",
  tempMax: "Temperatura máxima",
  tempMin: "Temperatura mínima",
  precip: "Precipitación",
  perDay: "mm/día",
  cellElevation: "Elevación promedio de la celda",
  climateSentence:
    "Frío {frio}/10 con la temperatura media y aridez {aridez}/10 con la precipitación. El valor anual de la máxima es el mes más cálido y el de la mínima, el mes más frío.",
  nearestKnown: "Sitio conocido más parecido cerca",
  goToSite: "Ir a este sitio",
  powerCellNote:
    "NASA POWER da promedios de una celda de 0.5° × 0.625° (unos 55 × 62 km), no del punto exacto. Solo frío y aridez vienen de datos de NASA; el perfil del objetivo (Luna/Marte) es una calificación del equipo. Esto indica un CANDIDATO, no un análogo confirmado.",
  powerSource: "Datos: NASA POWER (power.larc.nasa.gov), climatología por punto, comunidad RE",
  saveCandidate: "Guardar como candidato",
  savedCandidate: "Ya está en mis candidatos",
  candidateAria: "Candidato {coord}",
  partialScore: "PUNTAJE PARCIAL · {known} de {total} categorías",
  analogOfMars: "Análogo de Marte",
  analogOfMoon: "Análogo de Luna",
  likeTarget: "/ 100 de parecido con {name}",
  littleStudied: " · poco estudiado como análogo",
  similarityNote:
    "Este puntaje es el promedio de la similitud del expediente (terreno, suelo, clima, vida y aislamiento). Todavía no usa las 9 categorías con peso.",
  profile: "Perfil",
  resemblesIn: "Se parece en",
  noCloseCategory: "Ninguna categoría muy cercana",
  analogyFails: "Dónde falla la analogía",
  muchMore: "mucho más",
  muchLess: "mucho menos",
  thanOn: "que en {body}",
  couldTest: "Qué se podría probar aquí",
  byCategory: "Comparación por categoría",
  earth: "Tierra",
  moon: "Luna",
  mars: "Marte",
  theMoon: "la Luna",
  missing: "~ Sin dato",
  noData: "— sin dato",
  nasaData: "▲ Dato NASA",
  estimate: "~ Estimado",
  candidate: "Candidato",
  new: "Nuevo",
  logistics: "Logística de pruebas",
  access: "Acceso",
  permits: "Permisos",
  season: "Mejor temporada",
  nearestCity: "Ciudad más cercana",
  toFill: "Por llenar",
  permitsNote: "Permisos: anótalo si el lugar es un área protegida.",
  altitude: "Altitud",
  location: "Ubicación",
  terrainType: "Tipo de terreno",
  terrain: "Terreno",
  geology: "Geología",
  comparison: "Comparación",
  testsAllowed: "Pruebas que permite",
  limits: "Limitaciones",
  howToVerify: "Cómo verificarlo con datos de NASA",
  recommended: "Proyectos recomendados",
  nasaUse: "Uso de la NASA",
  sources: "Fuentes",
  otherStillEstimates: "Las demás categorías siguen siendo estimaciones.",
  otherNoData: "Las demás categorías de este lugar no tienen dato y no entran al puntaje.",
  climateExplainSite:
    "Frío {frio}/10 con la temperatura media y aridez {aridez}/10 con la precipitación. El valor anual de la máxima es el mes más cálido y el de la mínima, el mes más frío.",
  powerSourceShort: "Fuente: NASA POWER · climatología por punto, comunidad RE.",
  popupMore: "La geología, la comparación, las pruebas y las fuentes están en el panel.",
  scoreLabel: "Puntaje:",
  radarAria: "Radar de las 9 categorías: Tierra y {name}",
  limitsMoon:
    "Gravedad 1/6 de la Tierra, vacío total, sin campo magnético (radiación directa) y noches de unos 14 días.",
  limitsMars:
    "Gravedad ~38 % de la Tierra, atmósfera muy delgada de CO₂, más radiación y presión demasiado baja para agua líquida estable.",
  gameTitle: "¿Tierra, Luna o Marte?",
  round: "Ronda {n} · 10",
  correct: "Acertaste",
  missed: "Fallaste",
  itIs: "Es {place}.",
  seeOnGlobe: "Ver en el globo",
  result: "Resultado",
  next: "Siguiente",
  playAgain: "Jugar otra vez",
  scorePerfect: "Lectura perfecta. Los tres mundos ya no se te confunden.",
  scoreNear: "Casi perfecto. Un mundo se te escapó.",
  scoreMission: "Ojo de misión. El terreno ya casi no te engaña.",
  scoreHalf: "A medias. Vuelve a mirar cómo cambia el suelo.",
  scoreAgain: "Todavía se parecen demasiado. El globo te espera.",
  aboutTitle: "Acerca del proyecto",
  aboutCloseAria: "Cerrar acerca del proyecto",
  theChallenge: "El reto",
  challengeBody:
    "AnalogFinder participa en el NASA Space Apps Challenge 2026. El reto es encontrar lugares de la Tierra análogos a sitios de la Luna y de Marte: dónde se parecen, y dónde la comparación deja de servir.",
  methodHeading: "Metodología",
  methodIntro:
    "Cada lugar y cada objetivo se describen con {count} categorías, en una escala de 0 a 10: {names}.",
  methodZero: "El parecido es un puntaje de 0 a 100. Si todos los pesos están en cero, el resultado es 0. Si no, la fórmula es",
  formula: "100 × (1 − diferencia promedio ponderada / 10)",
  methodDiff:
    "La diferencia de cada categoría es el valor absoluto entre el lugar y el objetivo. El peso de esa categoría va de 0 (no cuenta) a 3 (cuenta el triple). El promedio ponderado de esas diferencias se divide entre 10, que es el máximo de la escala.",
  methodPower:
    "Frío y aridez de los lugares en la Tierra salen de NASA POWER: climatología por punto, comunidad RE, valor anual. El frío usa la temperatura media (T2M): 0 si el año promedia 25 °C o más, y 10 si promedia −15 °C o menos. La aridez usa la precipitación (PRECTOTCORR): 10 con 0.2 mm/día o menos, y 0 con 4 mm/día o más. Entre esos extremos la escala es lineal.",
  methodEstimate:
    "Las otras siete categorías, y todo el perfil del objetivo en la Luna o en Marte, siguen siendo estimaciones del equipo a partir de la literatura cuando hay un número. En la interfaz aparecen como «Estimado». Si un lugar no trae número en una categoría, esa no entra al puntaje y la ficha lo marca como puntaje parcial.",
  seeMethod: "Ver la página de metodología",
  limitsTitle: "Límites de cualquier análogo terrestre",
  limitsLead: "Ningún lugar de la Tierra puede imitar esto:",
  team: "Equipo",
  memberName: "Nombre del integrante",
  memberRole: "Rol en el equipo",
  pageMethod: "Metodología",
  pageHow: "Cómo se calcula el puntaje",
  pageHow1:
    "Cada lugar de la Tierra y cada objetivo de la Luna o de Marte se describen con {count} categorías, de 0 a 10: {names}.",
  pageHow2:
    "El parecido va de 0 a 100. Cada categoría tiene un peso de 0 a 3. El peso 0 no entra en la cuenta. Si todos los pesos están en 0, el puntaje es 0. Si falta el valor de una categoría, esa no entra al puntaje. El lugar se marca como puntaje parcial e indica cuántas categorías sí tienen dato.",
  pageHow3:
    "La diferencia de una categoría es el valor absoluto entre el lugar y el objetivo. Esas diferencias se promedian con su peso y el resultado se divide entre 10, el máximo de la escala.",
  pageHow4:
    "Los expedientes de Chihuahua que todavía no tienen este perfil de 9 categorías usan, en su lugar, el promedio de su similitud (terreno, suelo, clima, vida y aislamiento), pasada de 0–5 a 0–100.",
  pagePower: "Qué viene de NASA POWER",
  pagePowerBody:
    "Frío y aridez de los lugares en la Tierra salen de la climatología por punto de NASA POWER, comunidad RE, valor anual.",
  pageCold:
    "Frío usa la temperatura media a 2 metros (T2M): 0 si el año promedia 25 °C o más, y 10 si promedia −15 °C o menos.",
  pageDry:
    "Aridez usa la precipitación corregida (PRECTOTCORR): 10 con 0.2 mm/día o menos, y 0 con 4 mm/día o más.",
  pageLinear: "Entre esos extremos la escala es lineal y el resultado se redondea al entero.",
  pageTemps:
    "La ficha muestra también la temperatura máxima y la mínima anuales. Esas dos no entran en el puntaje. En la interfaz, frío y aridez con climatología aparecen como «Dato NASA».",
  pageEstimated: "Qué es estimado",
  pageEstimatedBody:
    "Las otras siete categorías de cada lugar, y todo el perfil del objetivo en la Luna o en Marte, son estimaciones del equipo a partir de la literatura. En la interfaz aparecen como «Estimado». Una categoría sin número aparece como «— sin dato» y no entra al puntaje.",
  pageSources: "Fuentes",
  pagePowerLink: "Climatología por punto usada para T2M, T2M_MAX, T2M_MIN y PRECTOTCORR.",
  pagePowerMethod: "Cómo se construyen los parámetros meteorológicos.",
  pagePowerMethodName: "Metodología de NASA POWER",
  pageSourcesNote: "Las fuentes de cada lugar (literatura, cartas y páginas institucionales) están en su ficha, en la sección Fuentes.",
} as const;

const en: { [K in keyof typeof es]: string } = {
  language: "Language",
  missionControl: "Mission control",
  tagline: "Which place on Earth is most like the Moon or Mars… and where does the comparison fail?",
  gameButton: "Earth, Moon, or Mars?",
  aboutButton: "About the project",
  pickTarget: "1 · Choose a target",
  whatToTest: "What do you want to test?",
  whatMatters: "2 · What matters more?",
  bestNow: "BEST SITE NOW: {name} · {score}",
  weightHint: "0 ignores the category · 3 prioritizes it",
  onlyNew: "Only little-studied places",
  versionNote:
    "Version 0.1 · Extreme cold and aridity for each place are calculated from NASA POWER climatology. The other categories (0–10) are still the team's estimates from the literature. Next step: calculate them from open NASA data (MODIS, NASADEM, Landsat, LRO LOLA/Diviner, MOLA, CRISM).",
  similarPlaces: "Most similar places",
  countOf: "{shown} of {total}",
  partialSection: "PARTIAL DATA · cold and aridity only (NASA POWER)",
  myCandidates: "My candidates",
  delete: "Delete",
  detail: "Detail",
  emptyDetail: "Click a place on the map or in the list.",
  analyzePoint: "⌖ Analyze a point",
  clickPlanet: "Click anywhere on the planet",
  objective: "Target",
  score: "Score",
  reset: "Reset",
  close: "Close",
  backToGlobe: "Back to the globe",
  backToMap: "Back to the map",
  welcomeAria: "Welcome to AnalogFinder",
  init: "INITIALIZING ANALOGFINDER…",
  sitesLoaded: "{count} ANALOG SITES LOADED",
  dataSource: "DATA SOURCE: NASA POWER",
  enter: "> ENTER",
  consulting: "QUERYING NASA POWER…",
  powerFailed: "Could not query NASA POWER",
  retry: "Retry",
  analyzedPoint: "Analyzed point",
  raiseWeights: "Raise the Cold or Aridity weight to compare",
  partialPointScore: "PARTIAL SCORE · 2 of 9 categories",
  resemblesClimate: "This place is {score}% like {name} in cold and aridity.",
  oceanWarning: "This point may be at sea; check that it is on land.",
  realData: "Real data · NASA POWER",
  tempMean: "Annual mean temperature",
  tempMax: "Maximum temperature",
  tempMin: "Minimum temperature",
  precip: "Precipitation",
  perDay: "mm/day",
  cellElevation: "Average elevation of the cell",
  climateSentence:
    "Cold {frio}/10 from the mean temperature and aridity {aridez}/10 from precipitation. The annual maximum is the warmest month and the annual minimum is the coldest month.",
  nearestKnown: "Nearest known site",
  goToSite: "Go to this site",
  powerCellNote:
    "NASA POWER gives averages for a 0.5° × 0.625° cell (about 55 × 62 km), not the exact point. Only cold and aridity come from NASA data; the target profile (Moon/Mars) is the team's rating. This marks a CANDIDATE, not a confirmed analog.",
  powerSource: "Data: NASA POWER (power.larc.nasa.gov), point climatology, RE community",
  saveCandidate: "Save as candidate",
  savedCandidate: "Already in my candidates",
  candidateAria: "Candidate {coord}",
  partialScore: "PARTIAL SCORE · {known} of {total} categories",
  analogOfMars: "Mars analog",
  analogOfMoon: "Moon analog",
  likeTarget: "/ 100 similarity to {name}",
  littleStudied: " · little studied as an analog",
  similarityNote:
    "This score is the average of the dossier similarity (terrain, soil, climate, life, and isolation). It does not yet use the 9 weighted categories.",
  profile: "Profile",
  resemblesIn: "Similar in",
  noCloseCategory: "No category is very close",
  analogyFails: "Where the analogy fails",
  muchMore: "much more",
  muchLess: "much less",
  thanOn: "than on {body}",
  couldTest: "What could be tested here",
  byCategory: "Comparison by category",
  earth: "Earth",
  moon: "Moon",
  mars: "Mars",
  theMoon: "the Moon",
  missing: "~ No data",
  noData: "— no data",
  nasaData: "▲ NASA data",
  estimate: "~ Estimate",
  candidate: "Candidate",
  new: "New",
  logistics: "Test logistics",
  access: "Access",
  permits: "Permits",
  season: "Best season",
  nearestCity: "Nearest city",
  toFill: "To be filled",
  permitsNote: "Permits: note it if the place is a protected area.",
  altitude: "Altitude",
  location: "Location",
  terrainType: "Terrain type",
  terrain: "Terrain",
  geology: "Geology",
  comparison: "Comparison",
  testsAllowed: "Tests it allows",
  limits: "Limitations",
  howToVerify: "How to check it with NASA data",
  recommended: "Recommended projects",
  nasaUse: "NASA use",
  sources: "Sources",
  otherStillEstimates: "The other categories are still estimates.",
  otherNoData: "The other categories for this place have no data and are left out of the score.",
  powerSourceShort: "Source: NASA POWER · point climatology, RE community.",
  climateExplainSite:
    "Cold {frio}/10 from the mean temperature and aridity {aridez}/10 from precipitation. The annual maximum is the warmest month and the annual minimum is the coldest month.",
  popupMore: "Geology, the comparison, the tests, and the sources are in the panel.",
  scoreLabel: "Score:",
  radarAria: "Radar of the 9 categories: Earth and {name}",
  limitsMoon:
    "Gravity 1/6 of Earth's, hard vacuum, no magnetic field (direct radiation), and nights of about 14 days.",
  limitsMars:
    "Gravity ~38% of Earth's, a very thin CO₂ atmosphere, more radiation, and pressure too low for stable liquid water.",
  gameTitle: "Earth, Moon, or Mars?",
  round: "Round {n} · 10",
  correct: "Correct",
  missed: "Missed",
  itIs: "It is {place}.",
  seeOnGlobe: "See on the globe",
  result: "Result",
  next: "Next",
  playAgain: "Play again",
  scorePerfect: "A perfect read. The three worlds no longer blur together.",
  scoreNear: "Almost perfect. One world got away.",
  scoreMission: "Mission eye. The terrain hardly fools you now.",
  scoreHalf: "Halfway. Look again at how the ground changes.",
  scoreAgain: "They still look too alike. The globe is waiting.",
  aboutTitle: "About the project",
  aboutCloseAria: "Close about the project",
  theChallenge: "The challenge",
  challengeBody:
    "AnalogFinder is part of the NASA Space Apps Challenge 2026. The challenge is to find places on Earth that are analogs of sites on the Moon and Mars: where they match, and where the comparison stops being useful.",
  methodHeading: "Methodology",
  methodIntro: "Each place and each target is described with {count} categories, on a scale from 0 to 10: {names}.",
  methodZero: "Similarity is a score from 0 to 100. If every weight is zero, the result is 0. Otherwise the formula is",
  formula: "100 × (1 − weighted average difference / 10)",
  methodDiff:
    "The difference for each category is the absolute value between the place and the target. That category's weight runs from 0 (it does not count) to 3 (it counts triple). The weighted average of those differences is divided by 10, the top of the scale.",
  methodPower:
    "Cold and aridity for places on Earth come from NASA POWER: point climatology, RE community, annual value. Cold uses the mean temperature (T2M): 0 if the year averages 25 °C or more, and 10 if it averages −15 °C or less. Aridity uses precipitation (PRECTOTCORR): 10 at 0.2 mm/day or less, and 0 at 4 mm/day or more. Between those ends the scale is linear.",
  methodEstimate:
    "The other seven categories, and the whole target profile on the Moon or Mars, are still the team's estimates from the literature when a number exists. In the interface they appear as “Estimate”. If a place has no number for a category, that category is left out of the score and the card marks it as a partial score.",
  seeMethod: "See the methodology page",
  limitsTitle: "Limits of any terrestrial analog",
  limitsLead: "No place on Earth can imitate this:",
  team: "Team",
  memberName: "Team member name",
  memberRole: "Role on the team",
  pageMethod: "Methodology",
  pageHow: "How the score is calculated",
  pageHow1:
    "Each place on Earth and each target on the Moon or Mars is described with {count} categories, from 0 to 10: {names}.",
  pageHow2:
    "Similarity runs from 0 to 100. Each category has a weight from 0 to 3. A weight of 0 is left out. If every weight is 0, the score is 0. If a category has no value, it is left out of the score. The place is marked as a partial score and shows how many categories do have data.",
  pageHow3:
    "The difference for a category is the absolute value between the place and the target. Those differences are averaged with their weight and the result is divided by 10, the top of the scale.",
  pageHow4:
    "Chihuahua dossiers that do not yet have this 9-category profile use, instead, the average of their similarity (terrain, soil, climate, life, and isolation), scaled from 0–5 to 0–100.",
  pagePower: "What comes from NASA POWER",
  pagePowerBody:
    "Cold and aridity for places on Earth come from NASA POWER point climatology, RE community, annual value.",
  pageCold:
    "Cold uses the mean temperature at 2 meters (T2M): 0 if the year averages 25 °C or more, and 10 if it averages −15 °C or less.",
  pageDry:
    "Aridity uses corrected precipitation (PRECTOTCORR): 10 at 0.2 mm/day or less, and 0 at 4 mm/day or more.",
  pageLinear: "Between those ends the scale is linear and the result is rounded to an integer.",
  pageTemps:
    "The card also shows the annual maximum and minimum temperature. Those two do not enter the score. In the interface, cold and aridity with climatology appear as “NASA data”.",
  pageEstimated: "What is estimated",
  pageEstimatedBody:
    "The other seven categories for each place, and the whole target profile on the Moon or Mars, are the team's estimates from the literature. In the interface they appear as “Estimate”. A category with no number appears as “— no data” and is left out of the score.",
  pageSources: "Sources",
  pagePowerLink: "Point climatology used for T2M, T2M_MAX, T2M_MIN, and PRECTOTCORR.",
  pagePowerMethod: "How the meteorological parameters are built.",
  pagePowerMethodName: "NASA POWER methodology",
  pageSourcesNote:
    "The sources for each place (literature, maps, and institutional pages) are on its card, in the Sources section.",
};

export type MessageKey = keyof typeof es;

export const messages: Record<Locale, { [K in MessageKey]: string }> = { es, en };

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  let text = messages[locale][key];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
}

const dimEs: Record<DimKey, string> = {
  aridez: "Aridez",
  frio: "Frío extremo",
  crateres: "Cráteres",
  volcanico: "Volcanismo / basalto",
  polvo: "Polvo, arena y dunas",
  hielo: "Hielo / permafrost",
  subsuelo: "Cuevas / tubos de lava",
  quimica: "Minerales de agua (sales, yeso, arcillas)",
  vida: "Habitabilidad / vida extrema",
};

const dimEn: Record<DimKey, string> = {
  aridez: "Aridity",
  frio: "Extreme cold",
  crateres: "Craters",
  volcanico: "Volcanism / basalt",
  polvo: "Dust, sand, and dunes",
  hielo: "Ice / permafrost",
  subsuelo: "Caves / lava tubes",
  quimica: "Water minerals (salts, gypsum, clays)",
  vida: "Habitability / extreme life",
};

const shortEs: Record<DimKey, string> = {
  aridez: "Aridez",
  frio: "Frío",
  crateres: "Cráteres",
  volcanico: "Volcán",
  polvo: "Polvo",
  hielo: "Hielo",
  subsuelo: "Cuevas",
  quimica: "Minerales",
  vida: "Vida",
};

const shortEn: Record<DimKey, string> = {
  aridez: "Aridity",
  frio: "Cold",
  crateres: "Craters",
  volcanico: "Volcano",
  polvo: "Dust",
  hielo: "Ice",
  subsuelo: "Caves",
  quimica: "Minerals",
  vida: "Life",
};

export function dimName(locale: Locale, key: DimKey): string {
  return (locale === "en" ? dimEn : dimEs)[key];
}

export function dimShort(locale: Locale, key: DimKey): string {
  return (locale === "en" ? shortEn : shortEs)[key];
}

export function dimList(locale: Locale): string {
  return (Object.keys(dimEs) as DimKey[]).map((key) => dimName(locale, key)).join(", ");
}

const targetEs: Record<string, { name: string; sub: string }> = {
  "luna-sur": { name: "Polo sur lunar (cráter Shackleton)", sub: "Zona candidata para bases de Artemis" },
  "luna-mare": { name: "Mares lunares (basalto)", sub: "Llanuras volcánicas, posibles tubos de lava" },
  "marte-jezero": { name: "Cráter Jezero", sub: "Antiguo delta y lago; sitio de Perseverance" },
  "marte-dunas": { name: "Dunas polares de yeso (Olympia Undae)", sub: "Gran campo de dunas cerca del polo norte" },
  "marte-tharsis": { name: "Tharsis / Arsia Mons", sub: "Volcanes gigantes y posibles entradas a cuevas" },
};

const targetEn: Record<string, { name: string; sub: string }> = {
  "luna-sur": { name: "Lunar south pole (Shackleton crater)", sub: "Candidate zone for Artemis bases" },
  "luna-mare": { name: "Lunar maria (basalt)", sub: "Volcanic plains, possible lava tubes" },
  "marte-jezero": { name: "Jezero crater", sub: "Ancient delta and lake; Perseverance landing site" },
  "marte-dunas": { name: "Polar gypsum dunes (Olympia Undae)", sub: "Large dune field near the north pole" },
  "marte-tharsis": { name: "Tharsis / Arsia Mons", sub: "Giant volcanoes and possible cave entrances" },
};

export function targetText(locale: Locale, id: string, fallback: { name: string; sub: string }) {
  return (locale === "en" ? targetEn : targetEs)[id] ?? fallback;
}

const missionEs: Record<string, string> = {
  rover: "Rover",
  habitat: "Hábitat/base",
  taladro: "Taladro/recursos",
  trajes: "Trajes/caminatas",
  comunicaciones: "Comunicaciones",
};

const missionEn: Record<string, string> = {
  rover: "Rover",
  habitat: "Habitat/base",
  taladro: "Drill/resources",
  trajes: "Suits/traverses",
  comunicaciones: "Communications",
};

export function missionName(locale: Locale, id: string, fallback: string): string {
  return (locale === "en" ? missionEn : missionEs)[id] ?? fallback;
}

const placeEs: Record<string, string> = {
  "luna-sur": "Cráter Shackleton, polo sur lunar",
  "luna-mare": "Mare Tranquillitatis",
  "marte-jezero": "Cráter Jezero",
  "marte-dunas": "Olympia Undae",
  "marte-tharsis": "Arsia Mons",
};

const placeEn: Record<string, string> = {
  "luna-sur": "Shackleton crater, lunar south pole",
  "luna-mare": "Mare Tranquillitatis",
  "marte-jezero": "Jezero crater",
  "marte-dunas": "Olympia Undae",
  "marte-tharsis": "Arsia Mons",
};

export function gamePlace(locale: Locale, targetId: string | undefined, fallback: string): string {
  if (!targetId) return fallback;
  return (locale === "en" ? placeEn : placeEs)[targetId] ?? fallback;
}

export function scoreMessage(locale: Locale, score: number): string {
  if (score >= 10) return translate(locale, "scorePerfect");
  if (score >= 9) return translate(locale, "scoreNear");
  if (score >= 7) return translate(locale, "scoreMission");
  if (score >= 4) return translate(locale, "scoreHalf");
  return translate(locale, "scoreAgain");
}
