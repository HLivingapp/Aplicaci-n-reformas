"use client";

import { useEffect, useState } from "react";
import { CATALOGO_BASICO, CATALOGO_MEDIO_EXTRA, CATALOGO_PREMIUM } from "./catalogo-materiales";
import { MATERIALES_MEDIA_INICIALES, type CategoriaMedia, type MaterialMedia } from "./gama-media";
import { avisarCambio } from "./nube";

/**
 * Materiales que el cliente elige en el catálogo («Añadir a mi reforma»).
 * Se guardan solo en su navegador (en producción irán a su ficha en la base de datos).
 * No usa IA: el moodboard y el presupuesto se montan con código y las fotos del catálogo.
 */
const CLAVE = "rm-mi-seleccion";
const EVENTO = "rm-mi-seleccion";

const TODOS: MaterialMedia[] = [...CATALOGO_BASICO, ...MATERIALES_MEDIA_INICIALES, ...CATALOGO_MEDIO_EXTRA, ...CATALOGO_PREMIUM];
export const materialPorId = (id: string) => TODOS.find((x) => x.id === id);

/** Capítulo del presupuesto en el que entra cada categoría del catálogo. */
export const CAPITULO_DE: Record<CategoriaMedia, string> = {
  cocina: "Cocina",
  electrodomesticos: "Cocina",
  encimeras: "Cocina",
  bano: "Fontanería",
  sanitarios: "Fontanería",
  griferia: "Fontanería",
  azulejos: "Revestimientos y suelos",
  suelos: "Revestimientos y suelos",
  ventanas: "Carpintería exterior",
  "puertas-entrada": "Carpintería interior",
  puertas: "Carpintería interior",
  cerramientos: "Carpintería interior",
  armarios: "Carpintería interior",
  aislamientos: "Pladur",
  molduras: "Pintura",
  electricidad: "Electricidad",
  climatizacion: "Climatización",
};

export const leerSeleccion = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

export const guardarSeleccion = (ids: string[]) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...new Set(ids)]));
  } catch {}
  avisarCambio(CLAVE);
  window.dispatchEvent(new Event(EVENTO));
};

export function useMiSeleccion() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const leer = () => setIds(leerSeleccion());
    leer();
    window.addEventListener(EVENTO, leer);
    window.addEventListener("storage", leer);
    return () => {
      window.removeEventListener(EVENTO, leer);
      window.removeEventListener("storage", leer);
    };
  }, []);
  const tiene = (id: string) => ids.includes(id);
  const alternar = (id: string) => guardarSeleccion(tiene(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const materiales = ids.map(materialPorId).filter((x): x is MaterialMedia => x != null);
  return { ids, materiales, tiene, alternar, vaciar: () => guardarSeleccion([]), poner: guardarSeleccion };
}
