"use client";

import { useEffect, useState } from "react";

/**
 * Materiales de gama media: fichas con imagen y enlace que el equipo va añadiendo.
 * Los enlaces son a catálogos o fichas públicas del fabricante, nunca a tarifas de proveedor.
 * En la demo se guardan en el navegador; en producción irán a la base de datos (Supabase).
 */
export type CategoriaMedia = "cocina" | "bano" | "suelos" | "ventanas" | "puertas" | "armarios" | "electricidad" | "climatizacion";

export const CATEGORIAS_MEDIA: { id: CategoriaMedia; texto: string; icono: string }[] = [
  { id: "cocina", texto: "Cocina", icono: "🍳" },
  { id: "bano", texto: "Baño", icono: "🛁" },
  { id: "suelos", texto: "Suelos y azulejos", icono: "🪵" },
  { id: "ventanas", texto: "Ventanas", icono: "🪟" },
  { id: "puertas", texto: "Puertas", icono: "🚪" },
  { id: "armarios", texto: "Armarios", icono: "🗄️" },
  { id: "electricidad", texto: "Electricidad e iluminación", icono: "💡" },
  { id: "climatizacion", texto: "Climatización y agua caliente", icono: "🌡️" },
];

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
  /** Quién lo añadió. */
  autor: "Human Living" | string;
  fecha: string;
};

const m = (id: string, categoria: CategoriaMedia, marca: string, nombre: string, detalle: string, url?: string): MaterialMedia => ({ id, categoria, marca, nombre, detalle, url, autor: "Human Living", fecha: "2026-11-21" });

const IMEX = "https://imexproducts.es/descarga-catalogos/";
const SALGAR = "https://www.salgar.net/salgar-catalogues-uk";
const ROCA = "https://www.roca.es/productos/descargas";
const KASSANDRA = "https://kassandra.net/";

/** Selección inicial aportada por Human Living (carpeta 10 PRODUCTO), solo con enlaces a catálogos. */
export const MATERIALES_MEDIA_INICIALES: MaterialMedia[] = [
  m("alvic-luxe", "cocina", "Alvic", "Frentes Luxe", "Puertas de cocina de la colección Luxe", "https://alvic.com/es/descargas/"),
  m("alvic-zenit", "cocina", "Alvic", "Frentes Zenit", "Puertas de cocina de la colección Zenit", "https://alvic.com/es/descargas/"),
  m("alvic-syncron", "cocina", "Alvic", "Frentes Syncron", "Puertas de cocina de la colección Syncron", "https://alvic.com/es/descargas/"),
  m("compac", "cocina", "Compac", "Encimera de cuarzo", "Encimera de cuarzo; se elige en el showroom con los frentes", "https://www.compac.es/wp-content/uploads/novedades/COMPAC%C2%A9COMPAC_Catalogo.pdf"),
  m("balay", "cocina", "Balay", "Electrodomésticos", "Horno, placa, campana, frigorífico y lavavajillas", "https://media3.bsh-group.com/Documents/28659371_Catalogo_interactivo_Balay_0526_280426.pdf"),
  m("teka", "cocina", "Teka", "Electrodomésticos", "Alternativa a Balay para el equipamiento de cocina", "https://www.teka.com/es-es/wp-content/uploads/sites/2/2022/03/CATALOGO-TEKA-MAYO2025.pdf"),
  m("imex-cocina", "cocina", "Imex", "Grifo de cocina", "Negro o cromado", IMEX),
  m("salgar-noja", "bano", "Salgar", "Mueble de baño Noja", "35 cm de fondo, con lavabo", SALGAR),
  m("salgar-attila", "bano", "Salgar", "Mueble de baño Attila", "35 cm de fondo, con lavabo", SALGAR),
  m("salgar-uniq", "bano", "Salgar", "Mueble de baño Uniq", "35 cm de fondo, con lavabo", SALGAR),
  m("salgar-marville", "bano", "Salgar", "Mueble de baño Marville", "22 cm de fondo, para baños estrechos", SALGAR),
  m("roca-gap", "bano", "Roca", "Inodoro Gap", "Inodoro de la selección recomendada", ROCA),
  m("roca-contessa", "bano", "Roca", "Bañera Contessa", "Bañera de la selección recomendada", ROCA),
  m("imex-bano", "bano", "Imex", "Grifería de baño", "Negra o cromada, vista o empotrada", IMEX),
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
    return Array.isArray(x) ? x : MATERIALES_MEDIA_INICIALES;
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
