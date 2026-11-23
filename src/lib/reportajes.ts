import { tarifasPorDefecto } from "@/lib/tarifas";

/**
 * Reportajes de reformas terminadas para la portada. Solo interiores autorizados, sin nada que
 * permita reconocer la dirección (ni fachadas, ni portal, ni vistas a la calle) y sin datos de clientes.
 * Las carpetas tienen nombres neutros; el €/m² es el de referencia de la app para esa gama, no lo que costó la obra.
 */
export type Gama = "basica" | "media" | "alta";
export type Reportaje = {
  id: string;
  titulo: string;
  tipo: string;
  gama: Gama;
  resumen: string;
  destacados: string[];
  carpeta: string;
  fotos: { f: string; t: string }[];
};

export const NOMBRE_GAMA: Record<Gama, string> = { basica: "Gama básica", media: "Gama media", alta: "Gama alta" };
export const eurosM2Referencia = (g: Gama) => tarifasPorDefecto().precioM2Referencia![g];

const n = (carpeta: string, textos: string[]) => textos.map((t, i) => ({ f: `/fotos/reportajes/${carpeta}/${i + 1}.webp`, t }));

export const REPORTAJES: Reportaje[] = [
  {
    id: "espiga",
    titulo: "Piso con suelo en espiga y vestidor",
    tipo: "Reforma integral",
    gama: "media",
    resumen: "Cocina en L, suelo en espiga, baño completo con azulejo verde y vestidor a medida.",
    destacados: ["Suelo en espiga", "Vestidor a medida", "Ducha a ras de suelo"],
    carpeta: "obra",
    fotos: [
      { f: "/fotos/obra/salon.webp", t: "Salón luminoso con suelo en espiga" },
      { f: "/fotos/obra/cocina.webp", t: "Cocina en L con columnas de horno y microondas" },
      { f: "/fotos/obra/bano.webp", t: "Baño con azulejo verde y mueble de madera" },
      { f: "/fotos/obra/ducha.webp", t: "Ducha a ras de suelo con mampara negra" },
      { f: "/fotos/obra/vestidor.webp", t: "Vestidor a medida" },
      { f: "/fotos/obra/pasillo.webp", t: "Pasillo con armarios empotrados" },
    ],
  },
  {
    id: "cocina-peninsula",
    titulo: "Cocina abierta con península",
    tipo: "Reforma integral",
    gama: "media",
    resumen: "Se abrió la cocina al salón con una península en blanco y se rehízo el baño con plato de ducha y mampara negra.",
    destacados: ["Cocina abierta", "Península con barra", "Baño nuevo"],
    carpeta: "cocina-peninsula",
    fotos: n("cocina-peninsula", [
      "Cocina blanca en L abierta al salón",
      "Pasillo con suelo laminado nuevo",
      "Península con barra para desayunar",
      "Columna de frigorífico y horno",
      "Baño con mueble de madera",
      "Ducha con mampara negra",
    ]),
  },
  {
    id: "piso-luminoso",
    titulo: "Piso luminoso listo para entrar a vivir",
    tipo: "Reforma integral",
    gama: "basica",
    resumen: "Suelo laminado en toda la casa, puertas lacadas en blanco, pintura, instalaciones y baño renovados.",
    destacados: ["Suelo laminado", "Puertas lacadas", "Baño renovado"],
    carpeta: "piso-luminoso",
    fotos: n("piso-luminoso", [
      "Salón exterior con mucha luz",
      "Salón con puertas vidrieras",
      "Pasillo con puertas nuevas",
      "Dormitorio con armario empotrado",
      "Ducha con alicatado blanco",
      "Estancia con suelo laminado",
    ]),
  },
  {
    id: "cocina-madera",
    titulo: "Cocina en blanco y madera abierta al salón",
    tipo: "Reforma integral",
    gama: "media",
    resumen: "Cocina integrada en el salón-comedor, climatización por splits y baño con azulejo verde artesanal.",
    destacados: ["Cocina integrada", "Aire acondicionado", "Azulejo verde"],
    carpeta: "cocina-madera",
    fotos: n("cocina-madera", [
      "Cocina con muebles altos en madera",
      "Comedor junto a la cocina",
      "Salón-cocina en un solo espacio",
      "Dormitorio con split",
      "Baño con mueble de madera y espejo redondo",
      "Ducha con azulejo verde y toallero",
    ]),
  },
  {
    id: "piso-nordico",
    titulo: "Piso de estilo nórdico con dos baños",
    tipo: "Reforma integral",
    gama: "media",
    resumen: "Distribución abierta, cocina blanca con encimera de madera, dos dormitorios y dos baños con espejo orgánico.",
    destacados: ["Dos baños", "Distribución abierta", "Encimera de madera"],
    carpeta: "piso-nordico",
    fotos: n("piso-nordico", [
      "Salón-comedor abierto",
      "Salón con zona de comedor",
      "Cocina blanca con encimera de madera",
      "Dormitorio principal",
      "Segundo dormitorio",
      "Baño con mueble de madera",
      "Segundo baño con espejo iluminado",
    ]),
  },
  {
    id: "suelo-hidraulico",
    titulo: "Piso antiguo con suelo hidráulico",
    tipo: "Rehabilitación",
    gama: "media",
    resumen: "Se conservó el carácter del piso: suelo hidráulico en cocina y baño, tarima de madera y paredes con azulejo de patrón.",
    destacados: ["Suelo hidráulico", "Tarima de madera", "Ducha de obra"],
    carpeta: "suelo-hidraulico",
    fotos: n("suelo-hidraulico", [
      "Pasillo con tarima de madera",
      "Cocina en U con suelo hidráulico",
      "Cocina con encimera de madera",
      "Baño abierto con azulejo de patrón",
      "Ducha de obra con rociador negro",
      "Estancia con zócalo de azulejo",
    ]),
  },
  {
    id: "suelo-madera",
    titulo: "Piso diáfano con suelo de madera",
    tipo: "Reforma integral",
    gama: "basica",
    resumen: "Tabiques fuera para ganar luz, suelo vinílico en madera oscura, cocina nueva y calentador renovado.",
    destacados: ["Espacios diáfanos", "Suelo vinílico", "Cocina nueva"],
    carpeta: "suelo-madera",
    fotos: n("suelo-madera", [
      "Salón con acceso al baño",
      "Salón amplio y luminoso",
      "Estancias abiertas a la cocina",
      "Cocina lineal junto a la entrada",
      "Cocina con calentador nuevo",
      "Dormitorio con suelo de madera",
    ]),
  },
];
