/** Datos extraídos del prototipo (referencia/index.html). Sin valores inventados. */

import analogRecords from "../analogos.json";

export type DimKey =
  | "aridez"
  | "frio"
  | "crateres"
  | "volcanico"
  | "polvo"
  | "hielo"
  | "subsuelo"
  | "quimica"
  | "vida";

export type Profile = Partial<Record<DimKey, number>>;

export type Dimension = {
  key: DimKey;
  name: string;
};

export type Body = "luna" | "marte";

export type Target = {
  id: string;
  body: Body;
  name: string;
  nameEn?: string;
  sub: string;
  subEn?: string;
  p: Profile;
};

export type Similitud = {
  terreno: number;
  suelo: number;
  clima: number;
  vida: number;
  aislamiento: number;
};

export type Comparacion = {
  lugar: string;
  explicacion: string;
};

export type VerificacionNasa = {
  recurso: string;
  uso: string;
};

export type Fuente = string | { nombre: string; url: string };

export type Logistica = {
  acceso?: string;
  permisos?: string;
  temporada?: string;
  ciudad?: string;
};

export type Site = {
  name: string;
  /** Nombre en inglés si el español tiene partes descriptivas. Si falta, se muestra `name`. */
  nameEn?: string;
  where: string;
  whereEn?: string;
  lat: number;
  lng: number;
  nuevo: boolean;
  /** Perfil 0–10 de las 9 categorías. Los expedientes nuevos pueden no traerlo. */
  p?: Profile;
  desc: string;
  descEn?: string;
  prueba: string;
  pruebaEn?: string;
  id?: string;
  estado?: string;
  tipoAnalogo?: string;
  analogoDe?: string[];
  ubicacion?: string;
  altitud?: string;
  tipoTerreno?: string;
  geologia?: string[];
  comparacion?: Comparacion;
  pruebas?: string[];
  pruebasEn?: string[];
  limitaciones?: string[];
  verificacionNasa?: VerificacionNasa[];
  fuentes?: Fuente[];
  usoNasa?: string;
  usoNasaEn?: string;
  proyectos?: string[];
  similitud?: Similitud;
  logistica?: Logistica;
};

export const DIMS: Dimension[] = [
  { key: "aridez", name: "Aridez" },
  { key: "frio", name: "Frío extremo" },
  { key: "crateres", name: "Cráteres" },
  { key: "volcanico", name: "Volcanismo / basalto" },
  { key: "polvo", name: "Polvo, arena y dunas" },
  { key: "hielo", name: "Hielo / permafrost" },
  { key: "subsuelo", name: "Cuevas / tubos de lava" },
  { key: "quimica", name: "Minerales de agua (sales, yeso, arcillas)" },
  { key: "vida", name: "Habitabilidad / vida extrema" },
];

export const TARGETS: Target[] = [
  {
    id: "luna-sur",
    body: "luna",
    name: "Polo sur lunar (cráter Shackleton)",
    nameEn: "Lunar south pole (Shackleton crater)",
    sub: "Zona candidata para bases de Artemis",
    subEn: "Candidate zone for Artemis bases",
    p: {
      aridez: 10,
      frio: 10,
      crateres: 10,
      volcanico: 3,
      polvo: 8,
      hielo: 8,
      subsuelo: 3,
      quimica: 2,
      vida: 0,
    },
  },
  {
    id: "luna-mare",
    body: "luna",
    name: "Mares lunares (basalto)",
    nameEn: "Lunar maria (basalt)",
    sub: "Llanuras volcánicas, posibles tubos de lava",
    subEn: "Volcanic plains, possible lava tubes",
    p: {
      aridez: 10,
      frio: 6,
      crateres: 8,
      volcanico: 10,
      polvo: 8,
      hielo: 0,
      subsuelo: 7,
      quimica: 1,
      vida: 0,
    },
  },
  {
    id: "marte-jezero",
    body: "marte",
    name: "Cráter Jezero",
    nameEn: "Jezero crater",
    sub: "Antiguo delta y lago; sitio de Perseverance",
    subEn: "Ancient delta and lake; Perseverance landing site",
    p: {
      aridez: 9,
      frio: 7,
      crateres: 7,
      volcanico: 4,
      polvo: 7,
      hielo: 2,
      subsuelo: 2,
      quimica: 9,
      vida: 6,
    },
  },
  {
    id: "marte-dunas",
    body: "marte",
    name: "Dunas polares de yeso (Olympia Undae)",
    nameEn: "Polar gypsum dunes (Olympia Undae)",
    sub: "Gran campo de dunas cerca del polo norte",
    subEn: "Large dune field near the north pole",
    p: {
      aridez: 10,
      frio: 8,
      crateres: 3,
      volcanico: 2,
      polvo: 10,
      hielo: 5,
      subsuelo: 1,
      quimica: 8,
      vida: 2,
    },
  },
  {
    id: "marte-tharsis",
    body: "marte",
    name: "Tharsis / Arsia Mons",
    sub: "Volcanes gigantes y posibles entradas a cuevas",
    subEn: "Giant volcanoes and possible cave entrances",
    p: {
      aridez: 10,
      frio: 8,
      crateres: 4,
      volcanico: 10,
      polvo: 7,
      hielo: 2,
      subsuelo: 10,
      quimica: 3,
      vida: 4,
    },
  },
];

const CORE_SITES: Site[] = [
  {
    name: "Médanos de Samalayuca",
    nameEn: "Samalayuca Dunes",
    where: "Chihuahua, México",
    whereEn: "Chihuahua, Mexico",
    lat: 31.35,
    lng: -106.48,
    nuevo: true,
    p: {
      aridez: 8,
      frio: 3,
      crateres: 0,
      volcanico: 1,
      polvo: 10,
      hielo: 0,
      subsuelo: 0,
      quimica: 2,
      vida: 2,
    },
    desc: "Campo de dunas de arena de cuarzo en el desierto chihuahuense, a unos 50 km de Ciudad Juárez.",
    descEn: "A field of quartz sand dunes in the Chihuahuan Desert, about 50 km from Ciudad Juárez.",
    prueba: "Movilidad de rovers en arena suelta, erosión por viento en equipos, formación de dunas.",
    pruebaEn: "Rover mobility on loose sand, wind erosion of equipment, and dune formation.",
  },
  {
    name: "Cueva de los Cristales, Naica",
    nameEn: "Cave of the Crystals, Naica",
    where: "Chihuahua, México",
    whereEn: "Chihuahua, Mexico",
    lat: 27.85,
    lng: -105.5,
    nuevo: true,
    p: {
      aridez: 1,
      frio: 0,
      crateres: 0,
      volcanico: 2,
      polvo: 0,
      hielo: 0,
      subsuelo: 10,
      quimica: 8,
      vida: 9,
    },
    desc: "Cueva con cristales gigantes de yeso, a unos 300 m de profundidad. Se reportaron microorganismos dentro de los cristales.",
    descEn: "A cave with giant gypsum crystals, about 300 m underground. Microorganisms were reported inside the crystals.",
    prueba: "Búsqueda de vida en minerales, robots para cuevas, operación en ambientes hostiles.",
    pruebaEn: "Searching for life in minerals, robots for caves, and operations in hostile environments.",
  },
  {
    name: "El Pinacate (cráter El Elegante)",
    nameEn: "El Pinacate (El Elegante crater)",
    where: "Sonora, México",
    whereEn: "Sonora, Mexico",
    lat: 31.84,
    lng: -113.42,
    nuevo: true,
    p: {
      aridez: 9,
      frio: 2,
      crateres: 6,
      volcanico: 10,
      polvo: 7,
      hielo: 0,
      subsuelo: 5,
      quimica: 3,
      vida: 3,
    },
    desc: "Campo volcánico con grandes cráteres tipo maar y lava basáltica. Astronautas del programa Apolo entrenaron aquí.",
    descEn: "A volcanic field with large maar craters and basaltic lava. Apollo program astronauts trained here.",
    prueba: "Geología de campo para astronautas, navegación en terreno volcánico, muestreo de basalto.",
    pruebaEn: "Field geology for astronauts, navigation on volcanic terrain, and basalt sampling.",
  },
  {
    name: "Gran Desierto de Altar",
    nameEn: "Great Altar Desert",
    where: "Sonora, México",
    whereEn: "Sonora, Mexico",
    lat: 32.0,
    lng: -114.2,
    nuevo: true,
    p: {
      aridez: 10,
      frio: 2,
      crateres: 0,
      volcanico: 3,
      polvo: 10,
      hielo: 0,
      subsuelo: 0,
      quimica: 2,
      vida: 2,
    },
    desc: "Uno de los campos de dunas activas más grandes de Norteamérica, con dunas en forma de estrella.",
    descEn: "One of the largest active dune fields in North America, with star-shaped dunes.",
    prueba: "Comparar formas de dunas con imágenes de Marte y estudiar el movimiento del polvo.",
    pruebaEn: "Compare dune shapes with images of Mars and study how the dust moves.",
  },
  {
    name: "Cuatro Ciénegas",
    where: "Coahuila, México",
    whereEn: "Coahuila, Mexico",
    lat: 26.99,
    lng: -102.07,
    nuevo: false,
    p: {
      aridez: 7,
      frio: 2,
      crateres: 0,
      volcanico: 0,
      polvo: 6,
      hielo: 0,
      subsuelo: 2,
      quimica: 8,
      vida: 10,
    },
    desc: "Pozas en el desierto con tapetes microbianos y estromatolitos, parecidos a la vida temprana de la Tierra.",
    descEn: "Desert pools with microbial mats and stromatolites, similar to early life on Earth.",
    prueba: "Reconocer biofirmas y entender cómo pudo haber vida en lagos antiguos de Marte.",
    pruebaEn: "Recognize biosignatures and understand how life could have existed in ancient lakes on Mars.",
  },
  {
    name: "White Sands",
    where: "Nuevo México, EE. UU.",
    whereEn: "New Mexico, USA",
    lat: 32.88,
    lng: -106.33,
    nuevo: false,
    p: {
      aridez: 8,
      frio: 3,
      crateres: 0,
      volcanico: 1,
      polvo: 10,
      hielo: 0,
      subsuelo: 0,
      quimica: 9,
      vida: 2,
    },
    desc: "Dunas de yeso blanco, uno de los pocos lugares de la Tierra con dunas de este mineral.",
    descEn: "White gypsum dunes, one of the few places on Earth with dunes of this mineral.",
    prueba: "Comparación directa con las dunas de yeso del polo norte de Marte.",
    pruebaEn: "Direct comparison with the gypsum dunes at the north pole of Mars.",
  },
  {
    name: "Meteor Crater",
    where: "Arizona, EE. UU.",
    whereEn: "Arizona, USA",
    lat: 35.03,
    lng: -111.02,
    nuevo: false,
    p: {
      aridez: 8,
      frio: 3,
      crateres: 10,
      volcanico: 1,
      polvo: 5,
      hielo: 0,
      subsuelo: 0,
      quimica: 2,
      vida: 1,
    },
    desc: "Cráter de impacto joven y bien conservado, de cerca de 1.2 km de diámetro.",
    descEn: "A young, well-preserved impact crater, about 1.2 km across.",
    prueba: "Entender la forma de los cráteres de impacto y entrenar geología de campo.",
    pruebaEn: "Understand the shape of impact craters and train field geology.",
  },
  {
    name: "Death Valley",
    where: "California, EE. UU.",
    whereEn: "California, USA",
    lat: 36.25,
    lng: -116.82,
    nuevo: false,
    p: {
      aridez: 10,
      frio: 1,
      crateres: 2,
      volcanico: 4,
      polvo: 7,
      hielo: 0,
      subsuelo: 1,
      quimica: 8,
      vida: 3,
    },
    desc: "Uno de los lugares más calientes y secos del planeta, con salares y un cráter volcánico (Ubehebe).",
    descEn: "One of the hottest and driest places on the planet, with salt flats and a volcanic crater (Ubehebe).",
    prueba: "Evaporitas y sales como pistas de agua antigua, pruebas térmicas de equipo.",
    pruebaEn: "Evaporites and salts as clues to ancient water, and thermal tests of equipment.",
  },
  {
    name: "Desierto de Atacama",
    nameEn: "Atacama Desert",
    where: "Chile",
    lat: -24.5,
    lng: -69.25,
    nuevo: false,
    p: {
      aridez: 10,
      frio: 5,
      crateres: 1,
      volcanico: 6,
      polvo: 6,
      hielo: 0,
      subsuelo: 1,
      quimica: 8,
      vida: 5,
    },
    desc: "El desierto no polar más seco del mundo, con suelos ricos en sales y percloratos.",
    descEn: "The driest non-polar desert in the world, with soils rich in salts and perchlorates.",
    prueba: "Límites de la vida en sequía extrema, pruebas de taladros y rovers.",
    pruebaEn: "Limits of life in extreme drought, and tests of drills and rovers.",
  },
  {
    name: "Cráter Haughton (isla Devon)",
    nameEn: "Haughton Crater (Devon Island)",
    where: "Nunavut, Canadá",
    whereEn: "Nunavut, Canada",
    lat: 75.38,
    lng: -89.67,
    nuevo: false,
    p: {
      aridez: 8,
      frio: 9,
      crateres: 10,
      volcanico: 0,
      polvo: 4,
      hielo: 8,
      subsuelo: 1,
      quimica: 5,
      vida: 4,
    },
    desc: "Cráter de impacto en un desierto polar. Sede de proyectos de NASA para simular misiones.",
    descEn: "An impact crater in a polar desert. Home to NASA projects that simulate missions.",
    prueba: "Operaciones de exploración completas, trajes y vehículos en frío y aislamiento.",
    pruebaEn: "Full exploration operations, suits, and vehicles in cold and isolation.",
  },
  {
    name: "Valles Secos de McMurdo",
    nameEn: "McMurdo Dry Valleys",
    where: "Antártida",
    whereEn: "Antarctica",
    lat: -77.5,
    lng: 162.0,
    nuevo: false,
    p: {
      aridez: 10,
      frio: 10,
      crateres: 0,
      volcanico: 3,
      polvo: 6,
      hielo: 10,
      subsuelo: 2,
      quimica: 6,
      vida: 6,
    },
    desc: "Valles sin nieve, con frío extremo y vientos secos. Hay microbios viviendo dentro de las rocas.",
    descEn: "Snow-free valleys with extreme cold and dry winds. Microbes live inside the rocks.",
    prueba: "Vida en frío extremo, permafrost y hielo enterrado como en Marte.",
    pruebaEn: "Life in extreme cold, and permafrost and buried ice as on Mars.",
  },
  {
    name: "Mauna Kea",
    where: "Hawái, EE. UU.",
    whereEn: "Hawaii, USA",
    lat: 19.82,
    lng: -155.47,
    nuevo: false,
    p: {
      aridez: 6,
      frio: 5,
      crateres: 4,
      volcanico: 10,
      polvo: 7,
      hielo: 2,
      subsuelo: 6,
      quimica: 3,
      vida: 2,
    },
    desc: "Volcán con ceniza y suelos basálticos muy parecidos al regolito lunar.",
    descEn: "A volcano with ash and basaltic soils very similar to lunar regolith.",
    prueba: "Usar recursos locales (fabricar materiales con el suelo), pruebas de rovers lunares.",
    pruebaEn: "Use local resources (make materials from the soil) and test lunar rovers.",
  },
  {
    name: "Holuhraun",
    where: "Islandia",
    whereEn: "Iceland",
    lat: 64.85,
    lng: -16.83,
    nuevo: false,
    p: {
      aridez: 4,
      frio: 7,
      crateres: 1,
      volcanico: 10,
      polvo: 6,
      hielo: 6,
      subsuelo: 3,
      quimica: 4,
      vida: 3,
    },
    desc: "Campo de lava muy reciente (2014–2015) rodeado de arena volcánica negra.",
    descEn: "A very recent lava field (2014–2015) surrounded by black volcanic sand.",
    prueba: "Pruebas de rovers en lava fresca y estudio de cómo el agua y la lava interactúan.",
    pruebaEn: "Rover tests on fresh lava, and study of how water and lava interact.",
  },
  {
    name: "Río Tinto",
    where: "Huelva, España",
    whereEn: "Huelva, Spain",
    lat: 37.7,
    lng: -6.6,
    nuevo: false,
    p: {
      aridez: 4,
      frio: 1,
      crateres: 0,
      volcanico: 1,
      polvo: 2,
      hielo: 0,
      subsuelo: 4,
      quimica: 10,
      vida: 9,
    },
    desc: "Río ácido y rojo, rico en hierro y sulfatos, con microbios que viven en esas condiciones.",
    descEn: "An acidic red river, rich in iron and sulfates, with microbes that live in those conditions.",
    prueba: "Química parecida a la que encontraron rovers en Meridiani Planum, en Marte.",
    pruebaEn: "Chemistry similar to what rovers found at Meridiani Planum, on Mars.",
  },
  {
    name: "Lava Beds",
    where: "California, EE. UU.",
    whereEn: "California, USA",
    lat: 41.71,
    lng: -121.51,
    nuevo: false,
    p: {
      aridez: 6,
      frio: 5,
      crateres: 1,
      volcanico: 9,
      polvo: 3,
      hielo: 5,
      subsuelo: 10,
      quimica: 2,
      vida: 5,
    },
    desc: "Cientos de tubos de lava, algunos con hielo dentro.",
    descEn: "Hundreds of lava tubes, some with ice inside.",
    prueba: "Robots que exploran y mapean cuevas, refugios contra la radiación.",
    pruebaEn: "Robots that explore and map caves, and shelters against radiation.",
  },
  {
    name: "Cráter Lonar",
    nameEn: "Lonar Crater",
    where: "Maharashtra, India",
    lat: 19.98,
    lng: 76.51,
    nuevo: true,
    p: {
      aridez: 4,
      frio: 1,
      crateres: 10,
      volcanico: 9,
      polvo: 3,
      hielo: 0,
      subsuelo: 0,
      quimica: 5,
      vida: 5,
    },
    desc: "Cráter de impacto formado en roca basáltica, algo poco común en la Tierra.",
    descEn: "An impact crater formed in basaltic rock, something uncommon on Earth.",
    prueba: "Impactos sobre basalto, como en los mares lunares.",
    pruebaEn: "Impacts on basalt, as in the lunar maria.",
  },
  {
    name: "Pilbara",
    where: "Australia Occidental",
    whereEn: "Western Australia",
    lat: -21.2,
    lng: 119.4,
    nuevo: false,
    p: {
      aridez: 8,
      frio: 1,
      crateres: 1,
      volcanico: 5,
      polvo: 6,
      hielo: 0,
      subsuelo: 1,
      quimica: 6,
      vida: 10,
    },
    desc: "Rocas con algunas de las señales de vida más antiguas de la Tierra (estromatolitos de unos 3,500 millones de años).",
    descEn: "Rocks with some of the oldest signs of life on Earth (stromatolites about 3.5 billion years old).",
    prueba: "Entrenar a ojos y algoritmos para reconocer biofirmas antiguas en rocas.",
    pruebaEn: "Train eyes and algorithms to recognize ancient biosignatures in rocks.",
  },
  {
    name: "Bockfjorden, Svalbard",
    where: "Noruega",
    whereEn: "Norway",
    lat: 79.4,
    lng: 13.3,
    nuevo: true,
    p: {
      aridez: 6,
      frio: 9,
      crateres: 0,
      volcanico: 8,
      polvo: 3,
      hielo: 9,
      subsuelo: 2,
      quimica: 7,
      vida: 5,
    },
    desc: "Volcanes y manantiales tibios en el Ártico, con carbonatos parecidos a los de un meteorito marciano.",
    descEn: "Volcanoes and warm springs in the Arctic, with carbonates similar to those in a Martian meteorite.",
    prueba: "Volcanismo + hielo + química del agua juntos, como en Marte antiguo.",
    pruebaEn: "Volcanism, ice, and water chemistry together, as on ancient Mars.",
  },
  {
    name: "Craters of the Moon",
    where: "Idaho, EE. UU.",
    whereEn: "Idaho, USA",
    lat: 43.42,
    lng: -113.52,
    nuevo: false,
    p: {
      aridez: 7,
      frio: 6,
      crateres: 3,
      volcanico: 10,
      polvo: 6,
      hielo: 3,
      subsuelo: 8,
      quimica: 2,
      vida: 2,
    },
    desc: "Gran campo de lava basáltica con conos y tubos de lava.",
    descEn: "A large field of basaltic lava with cones and lava tubes.",
    prueba: "Caminatas de exploración, comunicaciones y geología volcánica.",
    pruebaEn: "Exploration traverses, communications, and volcanic geology.",
  },
];

type AnalogRecord = {
  id: string;
  nombre: string;
  nombre_en?: string;
  pais: string;
  pais_en?: string;
  region: string;
  region_en?: string;
  lat: number;
  lon: number;
  analogo_de?: string[];
  estado?: string;
  tipo_analogo?: string;
  ubicacion?: string;
  altitud?: string;
  tipo_terreno?: string;
  descripcion?: string;
  descripcion_en?: string;
  geologia?: string[];
  comparacion?: { lugar: string; explicacion: string };
  pruebas?: string[];
  pruebas_en?: string[];
  limitaciones?: string[];
  verificacion_nasa?: { recurso: string; uso: string }[];
  similitud?: Similitud;
  proyectos_recomendados?: string[];
  fuentes?: Fuente[];
  uso_nasa?: string;
  uso_nasa_en?: string;
  perfil?: Partial<Record<DimKey, number | null>>;
  logistica?: Logistica;
};

function profileFromRecord(perfil: AnalogRecord["perfil"]): Profile | undefined {
  if (!perfil) return undefined;
  const entries = Object.entries(perfil).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]),
  );
  return Object.fromEntries(entries);
}

function analogToSite(record: AnalogRecord): Site {
  const perfil = profileFromRecord(record.perfil);
  return {
    id: record.id,
    name: record.nombre,
    nameEn: record.nombre_en,
    where: `${record.region}, ${record.pais}`,
    whereEn:
      record.region_en || record.pais_en
        ? `${record.region_en ?? record.region}, ${record.pais_en ?? record.pais}`
        : undefined,
    lat: record.lat,
    lng: record.lon,
    nuevo: record.estado === "candidato",
    p: record.perfil ? (perfil ?? {}) : undefined,
    desc: record.descripcion ?? "",
    descEn: record.descripcion_en,
    prueba: record.pruebas?.join(" ") ?? "",
    pruebaEn: record.pruebas_en?.join(" "),
    estado: record.estado,
    tipoAnalogo: record.tipo_analogo,
    analogoDe: record.analogo_de,
    ubicacion: record.ubicacion,
    altitud: record.altitud,
    tipoTerreno: record.tipo_terreno,
    geologia: record.geologia,
    comparacion: record.comparacion,
    pruebas: record.pruebas,
    pruebasEn: record.pruebas_en,
    limitaciones: record.limitaciones,
    verificacionNasa: record.verificacion_nasa,
    fuentes: record.fuentes,
    usoNasa: record.uso_nasa,
    usoNasaEn: record.uso_nasa_en,
    proyectos: record.proyectos_recomendados,
    similitud: record.similitud,
    logistica: record.logistica,
  };
}

function withAnalogs(sites: Site[], records: AnalogRecord[]): Site[] {
  const extras = records.map(analogToSite);
  const replaced = sites.map((site) => {
    const match = extras.find((item) => item.id === site.id || item.name === site.name);
    return match ? { ...site, ...match, p: match.p ?? site.p } : site;
  });
  const known = new Set(sites.map((site) => site.name));
  return [...replaced, ...extras.filter((site) => !known.has(site.name))];
}

export const SITES: Site[] = withAnalogs(CORE_SITES, analogRecords as AnalogRecord[]);

export const LIMITES: Record<Body, string> = {
  luna: "Gravedad 1/6 de la Tierra, vacío total, sin campo magnético (radiación directa) y noches de unos 14 días.",
  marte:
    "Gravedad ~38 % de la Tierra, atmósfera muy delgada de CO₂, más radiación y presión demasiado baja para agua líquida estable.",
};
