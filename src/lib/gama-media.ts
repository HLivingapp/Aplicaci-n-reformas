"use client";

import { useEffect, useState } from "react";

/**
 * Materiales de gama media: fichas con imagen y enlace que el equipo va añadiendo.
 * Los enlaces son a catálogos o fichas públicas del fabricante, nunca a tarifas de proveedor.
 * En la demo se guardan en el navegador; en producción irán a la base de datos (Supabase).
 */
export type CategoriaMedia = "cocina" | "electrodomesticos" | "encimeras" | "bano" | "sanitarios" | "griferia" | "suelos" | "azulejos" | "ventanas" | "puertas-entrada" | "puertas" | "cerramientos" | "armarios" | "aislamientos" | "molduras" | "electricidad" | "climatizacion";

export const CATEGORIAS_MEDIA: { id: CategoriaMedia; texto: string; icono: string }[] = [
  { id: "cocina", texto: "Muebles de cocina", icono: "🍳" },
  { id: "electrodomesticos", texto: "Electrodomésticos: paquetes de ejemplo", icono: "🔌" },
  { id: "encimeras", texto: "Encimeras", icono: "🪨" },
  { id: "bano", texto: "Muebles de baño, platos y mamparas", icono: "🛁" },
  { id: "sanitarios", texto: "Inodoros y lavabos", icono: "🚽" },
  { id: "griferia", texto: "Grifería", icono: "🚿" },
  { id: "suelos", texto: "Suelos y tarimas", icono: "🪵" },
  { id: "azulejos", texto: "Azulejos y revestimientos", icono: "🧱" },
  { id: "ventanas", texto: "Ventanas", icono: "🪟" },
  { id: "puertas-entrada", texto: "Puertas de entrada: blindadas y acorazadas", icono: "🔐" },
  { id: "puertas", texto: "Puertas de paso", icono: "🚪" },
  { id: "cerramientos", texto: "Cerramientos de cristal y correderas", icono: "🔲" },
  { id: "armarios", texto: "Armarios", icono: "🗄️" },
  { id: "aislamientos", texto: "Aislamientos", icono: "🧶" },
  { id: "molduras", texto: "Molduras decorativas de techo", icono: "🏛️" },
  { id: "electricidad", texto: "Mecanismos e iluminación", icono: "💡" },
  { id: "climatizacion", texto: "Climatización y agua caliente", icono: "🌡️" },
];

export type PrecioOrientativo = { texto: string; fuente: string; url?: string; fecha: string };

export type MaterialMedia = {
  id: string;
  categoria: CategoriaMedia;
  marca: string;
  nombre: string;
  detalle: string;
  /** Catálogo o ficha pública del fabricante. */
  url?: string;
  /** Foto subida (JPEG sin metadatos) o enlace https a una imagen. */
  imagen?: string;
  /** Precio orientativo público (PVP en una tienda o guía de precios), nunca tarifa de proveedor. */
  precio?: PrecioOrientativo;
  /** De dónde sale la foto. */
  credito?: string;
  /** Foto de producto recortada sobre fondo blanco: se muestra entera, sin recortar. */
  encajar?: boolean;
  /** Quién lo añadió. */
  autor: "Human Living" | string;
  fecha: string;
};

const m = (id: string, categoria: CategoriaMedia, marca: string, nombre: string, detalle: string, url?: string): MaterialMedia => ({ id, categoria, marca, nombre, detalle, url, autor: "Human Living", fecha: "2026-11-21", ...EXTRA[id] });

const HOY = "2026-11-22";
const pvp = (texto: string, fuente: string, url: string): PrecioOrientativo => ({ texto, fuente, url, fecha: HOY });
const foto = (id: string, credito: string) => ({ imagen: `/materiales/${id}.jpg`, credito });
const OBRA = "Foto: obra terminada (Human Living)";
/** Foto oficial de producto en la web del fabricante (se enlaza, no se copia). */
const web = (url: string, marca: string, encajar = true) => ({ imagen: url, credito: `Foto: web de ${marca}`, encajar });
const ALVIC_COCINA = web("https://alvic.com/wp-content/uploads/2021/10/cocinas-alvic-vanguardia.jpg", "Alvic", false);
const CAT = (marca: string) => `Foto: catálogo de ${marca}`;
const BANOIDEA = "Bañoidea";
const KASS = pvp("Frentes de ducha Kassandra desde unos 259 €", BANOIDEA, "https://banoidea.com/en/products/kassandra-siena-mampara-frente-de-ducha-fijo-puerta-corredera-negro-mate-transparente");

/** Foto y precio orientativo de la selección inicial. Precios con IVA de tiendas públicas; fotos oficiales enlazadas desde la web de cada fabricante (o de su catálogo). */
const EXTRA: Record<string, Partial<MaterialMedia>> = {
  "alvic-luxe": web("https://alvic.com/wp-content/uploads/2022/06/118-dsc0927-alvic-1200x1680.jpg", "Alvic", false),
  "alvic-zenit": ALVIC_COCINA,
  "alvic-syncron": web("https://alvic.com/wp-content/uploads/2021/11/syncron-laminates-alvic-1200x912.jpg", "Alvic", false),
  ascale: { ...web("https://almacendecocinas.com/wp-content/uploads/2025/01/ascale-croma-white-menu.jpg", "Almacén de Cocinas", false), precio: pvp("Unos 199 € el metro lineal (12 mm)", "Almacén de Cocinas", "https://almacendecocinas.com/producto/ascale-porcelanico-croma-white-1-metro-lineal-60-de-fondo/") },
  finfloor: web("https://finfloor.com/uploads/images/Portada-69f35ca047a946.43281349.jpg", "Finfloor", false),
  "imex-cocina": web("https://imexproducts.es/wp-content/uploads/2022/06/GCZ044-NG-scaled.jpg", "Imex"),
  "salgar-noja": { ...foto("salgar-noja", CAT("Salgar")), precio: pvp("Mueble desde unos 173 €", BANOIDEA, "https://banoidea.com/en/products/salgar-noja-mueble-de-bano-con-tapa-encimera-2-puertas-color-natural") },
  "salgar-attila": { ...foto("salgar-attila", CAT("Salgar")), precio: pvp("Conjunto con lavabo y espejo, unos 404 €", BANOIDEA, "https://banoidea.com/en/products/salgar-attila-conjunto-mueble-de-bano-completo-verde-mate") },
  "salgar-uniq": { ...web("https://www.salgar.net/cdnassets/categoria-mueble-bano-uniiq-sol-600-spirit.jpg", "Salgar", false), precio: pvp("Mueble de 60 cm, unos 385 €", BANOIDEA, "https://banoidea.com/en/products/mue-uniiq-60-2c-nata") },
  "salgar-marville": { ...foto("salgar-marville", CAT("Salgar")), precio: pvp("Conjunto de 40 cm con lavabo, unos 269 €", BANOIDEA, "https://banoidea.com/en/products/salgar-106312-marville-conjunto-completo-mueble-de-bano-mini-con-lavabo-1-puerta-color-roble-africa") },
  "roca-gap": { ...web("https://www.roca.es/RocaResourceServlet/resources/getTransformation?idObject=%7B040DF0D6-D27C-4DD0-9E80-C5FCA7BBE74F%7D&trName=TF_Web_Big", "Roca"), precio: pvp("Conjunto con cisterna y tapa, unos 311 €", "Obramat", "https://www.obramat.es/productos/pack-wc-inodoro-con-salida-vertical-cisterna-inferior-y-tapa-gap-25150626.html") },
  "roca-contessa": { ...web("https://www.roca.es/RocaResourceServlet/resources/getTransformation?idObject=%7B89951A1F-ACC7-474A-9A17-EB941ABFEEB3%7D&trName=TF_Web_Big", "Roca"), precio: pvp("160 × 70 cm, unos 145 € (sin faldón)", "Obramat", "https://www.obramat.es/productos/banera-chapa-de-acero-roca-contesa-160x70cm-10097290.html") },
  "imex-bano": web("https://imexproducts.es/wp-content/uploads/2022/06/BDZ044-4NG-scaled.jpg", "Imex"),
  "kassandra-delta": { ...web("https://kassandra.net/637-superlarge_default/frente-de-ducha-delta-de102.jpg", "Kassandra"), precio: KASS },
  "kassandra-luna": { ...foto("kassandra-luna", OBRA), precio: KASS },
  "kassandra-sugar": { ...foto("kassandra-sugar", OBRA), precio: KASS },
  "meister-lc150": { ...web("https://www.meister.com/_Resources/Persistent/0/c/0/f/0c0f1443aafb0c7630c41bda6e07db7ea2f2488c/462_laminate_LC150_Perspektive.jpg", "Meister", false), precio: pvp("Unos 24,90 €/m²", "Leroy Merlin", "https://www.leroymerlin.es/productos/suelo-laminado-8mm-roble-muscat-efecto-madera-natural-ac4-lc-150-meister-72437885.html") },
  parador: web("https://parador.de/media/catalog/product/cache/2ab59e795355d47654a6e98d116935c7/p/a/parador_1748185_b_side_hkmjosncmjh8zizx.jpg", "Parador", false),
  cortizo: { ...web("https://www.cortizo.com/ficheros/sistemasinline/MTc4OTczMzA4M18xNjRfY29yXzcwX2V2b2x1dGlvbl9ycHRfZXM,/images/evolution.jpg", "Cortizo"), precio: pvp("Instalada, unos 230–370 €/m²", "guía de precios de Habitissimo", "https://www.habitissimo.es/presupuestos/ventanas-puente-termico") },
  kommerling: web("https://www.kommerling.es/sites/default/files/styles/image_360_360/public/system/K%C3%96MMERLING76-md-xtrem_0.png.webp?itok=O7AANYA_", "Kömmerling"),
  "ikea-pax": { ...web("https://www.ikea.com/es/en/images/products/pax-wardrobe-white__1193392_pe901437_s5.jpg", "IKEA"), precio: pvp("Armario de 175 cm de ancho, unos 403 €", "IKEA", "https://www.ikea.com/es/en/p/pax-wardrobe-s69502631/") },
  "simon-27": web("https://cdn.pimber.ly/public/asset/raw/61e53326b02781001c06e002/9e19aa0d/6482da79ace8bd0012b19ddb/aaf320d8/27472-65-main.jpg", "Simon"),
};

const IMEX = "https://imexproducts.es/descarga-catalogos/";
const SALGAR = "https://www.salgar.net/salgar-catalogues-uk";
const ROCA = "https://www.roca.es/productos/descargas";
const KASSANDRA = "https://kassandra.net/";

/** Selección inicial aportada por Human Living (carpeta 10 PRODUCTO), solo con enlaces a catálogos. */
export const MATERIALES_MEDIA_INICIALES: MaterialMedia[] = [
  m("alvic-luxe", "cocina", "Alvic", "Frentes Luxe", "Puertas de cocina de la colección Luxe", "https://alvic.com/es/descargas/"),
  m("alvic-zenit", "cocina", "Alvic", "Frentes Zenit", "Puertas de cocina de la colección Zenit", "https://alvic.com/es/descargas/"),
  m("alvic-syncron", "cocina", "Alvic", "Frentes Syncron", "Puertas de cocina de la colección Syncron", "https://alvic.com/es/descargas/"),
  m("ascale", "encimeras", "Ascale", "Encimera porcelánica", "La encimera más usada: resiste calor, rayas y manchas; se elige en el showroom con los frentes", "https://www.ascale.es/"),
  m("imex-cocina", "griferia", "Imex", "Grifo de cocina", "Negro o cromado", IMEX),
  m("salgar-noja", "bano", "Salgar", "Mueble de baño Noja", "35 cm de fondo, con lavabo", SALGAR),
  m("salgar-attila", "bano", "Salgar", "Mueble de baño Attila", "35 cm de fondo, con lavabo", SALGAR),
  m("salgar-uniq", "bano", "Salgar", "Mueble de baño Uniq", "35 cm de fondo, con lavabo", SALGAR),
  m("salgar-marville", "bano", "Salgar", "Mueble de baño Marville", "22 cm de fondo, para baños estrechos", SALGAR),
  m("roca-gap", "sanitarios", "Roca", "Inodoro Gap", "Inodoro de la selección recomendada", ROCA),
  m("roca-contessa", "bano", "Roca", "Bañera Contessa", "Bañera de la selección recomendada", ROCA),
  m("imex-bano", "griferia", "Imex", "Grifería de baño", "Negra o cromada, vista o empotrada", IMEX),
  m("kassandra-delta", "bano", "Kassandra", "Mampara Delta", "Mampara de ducha", KASSANDRA),
  m("kassandra-luna", "bano", "Kassandra", "Mampara Luna", "Mampara de ducha", KASSANDRA),
  m("kassandra-sugar", "bano", "Kassandra", "Mampara Sugar", "Mampara de ducha", KASSANDRA),
  m("meister-lc150", "suelos", "Meister", "Laminado LC150 / LD150", "Nuestra opción estándar de suelo laminado"),
  m("finfloor", "suelos", "Finfloor", "Laminado Original / Style / Supreme", "Alternativa en laminado, varias gamas", "https://www.finsa.com/documents/d/guest/finfloor-catalogo.pdf"),
  m("parador", "suelos", "Parador", "Laminado y parquet", "Para quien busca madera o más acabados", "https://parador.de/es/pcms/downloads/downloadfile/file_id/47/"),
  m("cortizo", "ventanas", "Cortizo", "Ventana de aluminio RPT", "Con rotura de puente térmico y vidrio Climalit", "https://www.cortizo.com/ficheros/descargas/es/275.familiases112025.pdf"),
  m("kommerling", "ventanas", "Kömmerling", "Ventana de PVC", "Buen aislamiento térmico y acústico", "https://www.kommerling.es/sites/default/files/document/un-marco-incomparable-2025.pdf"),
  m("ikea-pax", "armarios", "IKEA", "Armario modular", "Módulos de 50, 75, 100 y 111 cm, puertas Forsand y tiradores Billsbro"),
  m("simon-27", "electricidad", "Simon", "Mecanismos Simon 27", "Enchufes e interruptores", "https://www.simonelectric.com/"),
];

const CLAVE = "app-reformas:materiales-media";
const EVENTO = "materiales-media";

export function leerMaterialesMedia(): MaterialMedia[] {
  try {
    const x = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    if (!Array.isArray(x)) return MATERIALES_MEDIA_INICIALES;
    // Fichas retiradas de la selección (p. ej. la encimera de cuarzo, sustituida por porcelánica)
    const RETIRADAS = ["compac", "balay", "teka"];
    // Las fichas iniciales guardadas antes de tener foto y precio los toman de la selección actual
    return (x as MaterialMedia[]).filter((y) => !RETIRADAS.includes(y.id)).map((y) => {
      const s = MATERIALES_MEDIA_INICIALES.find((z) => z.id === y.id);
      // Las fotos enlazadas de la selección inicial se toman siempre de la versión actual (las subidas por el equipo se respetan)
      const subida = y.imagen?.startsWith("data:");
      return s ? { ...y, imagen: subida ? y.imagen : s.imagen, credito: subida ? y.credito : s.credito, encajar: subida ? y.encajar : s.encajar, precio: y.precio ?? s.precio } : y;
    });
  } catch {
    return MATERIALES_MEDIA_INICIALES;
  }
}

export function guardarMaterialesMedia(lista: MaterialMedia[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    throw new Error("No cabe en el navegador. Prueba con una foto más pequeña o un enlace a la imagen.");
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Solo admitimos enlaces https (catálogos e imágenes). */
export const enlaceValido = (u?: string) => !u || /^https:\/\/[^\s]+$/i.test(u.trim());

export function useMaterialesMedia() {
  const [lista, setLista] = useState<MaterialMedia[]>(MATERIALES_MEDIA_INICIALES);
  useEffect(() => {
    const cargar = () => setLista(leerMaterialesMedia());
    cargar();
    window.addEventListener(EVENTO, cargar);
    window.addEventListener("storage", cargar);
    return () => {
      window.removeEventListener(EVENTO, cargar);
      window.removeEventListener("storage", cargar);
    };
  }, []);
  return lista;
}
