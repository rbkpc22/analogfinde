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

export type Profile = Record<DimKey, number>;

export type Dimension = {
  key: DimKey;
  name: string;
};

export type Body = "luna" | "marte";

export type Target = {
  id: string;
  body: Body;
  name: string;
  sub: string;
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

export type Site = {
  name: string;
  where: string;
  lat: number;
  lng: number;
  nuevo: boolean;
  /** Perfil 0–10 de las 9 categorías. Los expedientes nuevos pueden no traerlo. */
  p?: Profile;
  desc: string;
  prueba: string;
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
  limitaciones?: string[];
  verificacionNasa?: VerificacionNasa[];
  fuentes?: string[];
  proyectos?: string[];
  similitud?: Similitud;
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
    sub: "Zona candidata para bases de Artemis",
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
    sub: "Llanuras volcánicas, posibles tubos de lava",
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
    sub: "Antiguo delta y lago; sitio de Perseverance",
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
    sub: "Gran campo de dunas cerca del polo norte",
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
    where: "Chihuahua, México",
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
    prueba: "Movilidad de rovers en arena suelta, erosión por viento en equipos, formación de dunas.",
  },
  {
    name: "Cueva de los Cristales, Naica",
    where: "Chihuahua, México",
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
    prueba: "Búsqueda de vida en minerales, robots para cuevas, operación en ambientes hostiles.",
  },
  {
    name: "El Pinacate (cráter El Elegante)",
    where: "Sonora, México",
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
    prueba: "Geología de campo para astronautas, navegación en terreno volcánico, muestreo de basalto.",
  },
  {
    name: "Gran Desierto de Altar",
    where: "Sonora, México",
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
    prueba: "Comparar formas de dunas con imágenes de Marte y estudiar el movimiento del polvo.",
  },
  {
    name: "Cuatro Ciénegas",
    where: "Coahuila, México",
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
    prueba: "Reconocer biofirmas y entender cómo pudo haber vida en lagos antiguos de Marte.",
  },
  {
    name: "White Sands",
    where: "Nuevo México, EE. UU.",
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
    prueba: "Comparación directa con las dunas de yeso del polo norte de Marte.",
  },
  {
    name: "Meteor Crater",
    where: "Arizona, EE. UU.",
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
    prueba: "Entender la forma de los cráteres de impacto y entrenar geología de campo.",
  },
  {
    name: "Death Valley",
    where: "California, EE. UU.",
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
    prueba: "Evaporitas y sales como pistas de agua antigua, pruebas térmicas de equipo.",
  },
  {
    name: "Desierto de Atacama",
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
    prueba: "Límites de la vida en sequía extrema, pruebas de taladros y rovers.",
  },
  {
    name: "Cráter Haughton (isla Devon)",
    where: "Nunavut, Canadá",
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
    prueba: "Operaciones de exploración completas, trajes y vehículos en frío y aislamiento.",
  },
  {
    name: "Valles Secos de McMurdo",
    where: "Antártida",
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
    prueba: "Vida en frío extremo, permafrost y hielo enterrado como en Marte.",
  },
  {
    name: "Mauna Kea",
    where: "Hawái, EE. UU.",
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
    prueba: "Usar recursos locales (fabricar materiales con el suelo), pruebas de rovers lunares.",
  },
  {
    name: "Holuhraun",
    where: "Islandia",
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
    prueba: "Pruebas de rovers en lava fresca y estudio de cómo el agua y la lava interactúan.",
  },
  {
    name: "Río Tinto",
    where: "Huelva, España",
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
    prueba: "Química parecida a la que encontraron rovers en Meridiani Planum, en Marte.",
  },
  {
    name: "Lava Beds",
    where: "California, EE. UU.",
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
    prueba: "Robots que exploran y mapean cuevas, refugios contra la radiación.",
  },
  {
    name: "Cráter Lonar",
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
    prueba: "Impactos sobre basalto, como en los mares lunares.",
  },
  {
    name: "Pilbara",
    where: "Australia Occidental",
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
    prueba: "Entrenar a ojos y algoritmos para reconocer biofirmas antiguas en rocas.",
  },
  {
    name: "Bockfjorden, Svalbard",
    where: "Noruega",
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
    prueba: "Volcanismo + hielo + química del agua juntos, como en Marte antiguo.",
  },
  {
    name: "Craters of the Moon",
    where: "Idaho, EE. UU.",
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
    prueba: "Caminatas de exploración, comunicaciones y geología volcánica.",
  },
];

type AnalogRecord = {
  id: string;
  nombre: string;
  pais: string;
  region: string;
  lat: number;
  lon: number;
  analogo_de?: string[];
  estado?: string;
  tipo_analogo?: string;
  ubicacion?: string;
  altitud?: string;
  tipo_terreno?: string;
  descripcion?: string;
  geologia?: string[];
  comparacion?: { lugar: string; explicacion: string };
  pruebas?: string[];
  limitaciones?: string[];
  verificacion_nasa?: { recurso: string; uso: string }[];
  similitud?: Similitud;
  proyectos_recomendados?: string[];
  fuentes?: string[];
};

function analogToSite(record: AnalogRecord): Site {
  return {
    id: record.id,
    name: record.nombre,
    where: `${record.region}, ${record.pais}`,
    lat: record.lat,
    lng: record.lon,
    nuevo: record.estado === "candidato",
    desc: record.descripcion ?? "",
    prueba: record.pruebas?.join(" ") ?? "",
    estado: record.estado,
    tipoAnalogo: record.tipo_analogo,
    analogoDe: record.analogo_de,
    ubicacion: record.ubicacion,
    altitud: record.altitud,
    tipoTerreno: record.tipo_terreno,
    geologia: record.geologia,
    comparacion: record.comparacion,
    pruebas: record.pruebas,
    limitaciones: record.limitaciones,
    verificacionNasa: record.verificacion_nasa,
    fuentes: record.fuentes,
    proyectos: record.proyectos_recomendados,
    similitud: record.similitud,
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
