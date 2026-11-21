/**
 * Selección de productos de Human Living: las marcas y gamas que usamos en nuestras obras,
 * con el vídeo del equipo que lo explica y el enlace al catálogo público del fabricante.
 * Sin precios ni tarifas de proveedor (los enlaces son catálogos, no listas de precios).
 */
export type MarcaSeleccion = { marca: string; que: string; url?: string };
export type VideoSeleccion = { src: string; poster: string; titulo: string; duracion: string };
export type CategoriaSeleccion = {
  id: string;
  titulo: string;
  icono: string;
  /** Grupos de acabados (ver materiales.ts) a los que corresponde. */
  grupos: string[];
  resumen: string;
  video?: VideoSeleccion;
  marcas: MarcaSeleccion[];
  consejo?: string;
};

const video = (f: string, titulo: string, duracion: string): VideoSeleccion => ({ src: `/videos/${f}.mp4`, poster: `/videos/${f}.jpg`, titulo, duracion });

export const GUIA_AUDIO = { src: "/videos/guia-reforma.m4a", titulo: "Guía de la reforma para clientes", duracion: "17 min" };

export const SELECCION: CategoriaSeleccion[] = [
  {
    id: "cocina",
    titulo: "Cocina",
    icono: "🍳",
    grupos: ["cocina", "electrodomesticos", "revest_cocina"],
    resumen: "Frentes y encimera los eliges en el showroom; los electrodomésticos, online.",
    video: video("cocina", "Así elegimos una cocina", "1 min"),
    marcas: [
      { marca: "Alvic", que: "Frentes de cocina Luxe, Zenit y Syncron", url: "https://alvic.com/es/descargas/" },
      { marca: "Alvic Center (Hermosilla 75, Madrid)", que: "Showroom donde eliges puertas y encimera", url: "https://alviccenter.es/centros-distribucion/madrid-hermosilla/" },
      { marca: "Compac", que: "Encimeras de cuarzo", url: "https://www.compac.es/wp-content/uploads/novedades/COMPAC%C2%A9COMPAC_Catalogo.pdf" },
      { marca: "Balay", que: "Electrodomésticos", url: "https://media3.bsh-group.com/Documents/28659371_Catalogo_interactivo_Balay_0526_280426.pdf" },
      { marca: "Teka", que: "Electrodomésticos", url: "https://www.teka.com/es-es/wp-content/uploads/sites/2/2022/03/CATALOGO-TEKA-MAYO2025.pdf" },
      { marca: "Imex", que: "Grifería de cocina, negra o cromada", url: "https://imexproducts.es/descarga-catalogos/" },
    ],
  },
  {
    id: "bano",
    titulo: "Baño",
    icono: "🛁",
    grupos: ["equip_bano", "revest_bano"],
    resumen: "Mueble, sanitarios, grifería y mampara se eligen online; los azulejos, en el showroom.",
    marcas: [
      { marca: "Salgar", que: "Muebles de baño: Noja, Silane, Attila, Vima, Luva, Domus, Uniq, Biba, Inara (35 cm de fondo) y Marville (22 cm, para baños estrechos)", url: "https://www.salgar.net/salgar-catalogues-uk" },
      { marca: "Roca", que: "Sanitarios: inodoro Gap y bañera Contessa", url: "https://www.roca.es/productos/descargas" },
      { marca: "Imex", que: "Grifería negra o cromada, vista o empotrada", url: "https://imexproducts.es/descarga-catalogos/" },
      { marca: "Kassandra", que: "Mamparas Delta, Luna, Sugar, Glasé, Angular y Siena", url: "https://kassandra.net/" },
    ],
    consejo: "Desaconsejamos el panel fijo sin puerta: salpica fuera de la ducha.",
  },
  {
    id: "suelos",
    titulo: "Suelos y azulejos",
    icono: "🪵",
    grupos: ["suelo_laminado", "suelo_porcelanico", "revest_bano", "revest_cocina"],
    resumen: "Primero eliges azulejos (color de junta, orientación y cantoneras) y después el suelo y el color del rodapié.",
    marcas: [
      { marca: "Meister", que: "Laminado LC150 / LD150, nuestra opción estándar" },
      { marca: "Finfloor", que: "Laminado Original, Style y Supreme", url: "https://www.finsa.com/documents/d/guest/finfloor-catalogo.pdf" },
      { marca: "Parador", que: "Laminado y parquet", url: "https://parador.de/es/pcms/downloads/downloadfile/file_id/47/" },
      { marca: "NAIS (Castelló 9) y Azulejos Peña", que: "Showrooms de azulejos y porcelánico, de varias marcas" },
    ],
  },
  {
    id: "ventanas",
    titulo: "Ventanas",
    icono: "🪟",
    grupos: ["ventanas"],
    resumen: "Perfilería con rotura de puente térmico y vidrio Climalit, en aluminio o PVC.",
    video: video("ventanas", "Cómo elegir las ventanas", "1 min"),
    marcas: [
      { marca: "Cortizo", que: "Ventanas de aluminio con rotura de puente térmico", url: "https://www.cortizo.com/ficheros/descargas/es/275.familiases112025.pdf" },
      { marca: "Kömmerling", que: "Ventanas de PVC", url: "https://www.kommerling.es/sites/default/files/document/un-marco-incomparable-2025.pdf" },
    ],
  },
  {
    id: "puertas",
    titulo: "Puertas",
    icono: "🚪",
    grupos: ["puertas"],
    resumen: "Puerta de entrada e interiores: qué opciones hay y cómo quedan.",
    video: video("puertas", "Puerta de entrada y puertas interiores", "30 s"),
    marcas: [],
  },
  {
    id: "armarios",
    titulo: "Armarios empotrados",
    icono: "🗄️",
    grupos: ["puertas"],
    resumen: "Armarios modulares a medida del hueco, con interiores a tu gusto.",
    video: video("armarios", "Armarios empotrados modulares", "45 s"),
    marcas: [{ marca: "IKEA", que: "Módulos de 50, 75, 100 y 111 cm, puertas Forsand y tiradores Billsbro" }],
  },
  {
    id: "electricidad",
    titulo: "Electricidad e iluminación",
    icono: "💡",
    grupos: [],
    resumen: "Dónde van enchufes, interruptores y luces, y qué luminarias ponemos.",
    video: video("electricidad", "Electricidad e iluminación", "40 s"),
    marcas: [
      { marca: "Simon 27", que: "Mecanismos (enchufes e interruptores); también trabajamos con Legrand y Schneider", url: "https://www.simonelectric.com/" },
      { marca: "Iluminación LED", que: "Downlights empotrados de Ø8 cm, plafones extraplanos de Ø22/30 cm y tira LED bajo los muebles de cocina" },
    ],
  },
  {
    id: "climatizacion",
    titulo: "Calefacción, aire y agua caliente",
    icono: "🌡️",
    grupos: [],
    resumen: "Calefacción, aire acondicionado y termo: cómo se reparten y dónde se esconden.",
    video: video("climatizacion", "Climatización y agua caliente", "1,5 min"),
    marcas: [{ marca: "Daikin, Panasonic, Saunier Duval, Ferroli y Ariston", que: "Equipos de aire, calderas y termos con marca, modelo y potencia en tu presupuesto" }],
  },
];

const toca = (c: CategoriaSeleccion, grupos: string[]) => c.grupos.some((g) => grupos.includes(g));

/** Categorías que tocan a unos grupos de acabados (o todas), quitando las de `excluir`. */
export const seleccionPara = (grupos?: string[], excluir?: string[]) =>
  SELECCION.filter((c) => (!grupos || toca(c, grupos)) && !(excluir && toca(c, excluir)));
