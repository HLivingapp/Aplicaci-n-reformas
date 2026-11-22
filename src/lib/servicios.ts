"use client";

import { useEffect, useState } from "react";
import { alCambiar } from "./encargos";
import { avisarCambio } from "./nube";

/**
 * Servicios que el cliente puede contratar online desde la app.
 * Pendiente de cerrar: acuerdos y precios con Aesval (tasación) y MAPFRE (seguro de promotor).
 * Demostración: la contratación es simulada y se guarda en este navegador.
 */
export const SERVICIOS_CLIENTE = [
  {
    id: "tasacion",
    i: "🏠",
    t: "Tasación de tu vivienda con Aesval",
    d: "Tasación oficial de una sociedad de tasación inscrita en el Banco de España, la que pide el banco para la hipoteca o para financiar la reforma. La pides aquí y el tasador te llama para la visita.",
    pendiente: "Precio y acuerdo con Aesval pendientes de cerrar.",
  },
  {
    id: "seguro",
    i: "🛡️",
    t: "Seguro de promotor MAPFRE",
    d: "Responsabilidad civil como promotor (daños a vecinos, a la comunidad de vecinos o a terceros) y defensa jurídica mientras dura la obra. Gratis si contratas la obra con un reformista de la app; si no, puedes contratarlo aquí con coste.",
    pendiente: "Coberturas y precio según la póliza, pendientes de cerrar con MAPFRE.",
  },
] as const;
export type ServicioCliente = (typeof SERVICIOS_CLIENTE)[number]["id"];

const CLAVE = "app-reformas:servicios-cliente";
type Contratados = Record<string, Partial<Record<ServicioCliente, string>>>;

function leer(): Contratados {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export function contratarServicio(proyectoId: string, s: ServicioCliente) {
  const d = leer();
  d[proyectoId] = { ...d[proyectoId], [s]: new Date().toISOString() };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(d));
    avisarCambio(CLAVE);
    window.dispatchEvent(new Event("encargos"));
  } catch {
    /* sin almacenamiento */
  }
}

export function useServiciosContratados(proyectoId: string) {
  const [c, setC] = useState<Partial<Record<ServicioCliente, string>>>({});
  useEffect(() => {
    const f = () => setC(leer()[proyectoId] ?? {});
    f();
    return alCambiar(f);
  }, [proyectoId]);
  return c;
}
