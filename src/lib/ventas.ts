"use client";

import { OBJETIVO_RATIO } from "./comercializacion";
import { estadisticasVenta, leerEncargos, type Encargo } from "./encargos";
import { FICHAS_EJEMPLO } from "./red";

/**
 * Panel de ventas del proveedor: cuántas veces sale en las comparativas, embudo hasta la venta,
 * ratio «1 de cada N visitas», puesto en su zona y consejos para mejorar.
 */
const CLAVE_APARICIONES = "app-reformas:apariciones";

function leerApariciones(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_APARICIONES) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

/** Suma una aparición a cada reformista que ve un cliente en su comparativa. */
export function registrarApariciones(ids: string[]) {
  try {
    const a = leerApariciones();
    for (const id of ids) a[id] = (a[id] ?? 0) + 1;
    localStorage.setItem(CLAVE_APARICIONES, JSON.stringify(a));
  } catch {
    /* sin almacenamiento */
  }
}

/** En la demo, los reformistas de ejemplo parten de un histórico ficticio para que el embudo se vea completo. */
const BASE_DEMO: Record<string, number> = Object.fromEntries(FICHAS_EJEMPLO.map((f, i) => [f.id, 140 + ((i * 37) % 90)]));
export const apariciones = (id: string) => (leerApariciones()[id] ?? 0) + (BASE_DEMO[id] ?? 0);

/** 1 de cada N citas acaba en obra (null si aún no hay ventas). */
export const ratioVenta = (ventas: number, citas: number) => (ventas > 0 ? Math.max(1, Math.round(citas / ventas)) : null);
export const textoRatio = (r: number | null) => (r === null ? "—" : `1 de cada ${r}`);
export const cumpleObjetivo = (r: number | null) => r !== null && r <= OBJETIVO_RATIO;

const delMes = (e: Encargo) => {
  const f = e.visita.fecha ? new Date(e.visita.fecha) : null;
  const hoy = new Date();
  return !!f && f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
};

/** Insignia pública para el cliente: solo cuando el reformista cumple el objetivo con al menos una venta. */
export function insigniaVenta(reformistaId: string): string | null {
  const v = estadisticasVenta(leerEncargos().filter((e) => e.reformistaId === reformistaId));
  const r = ratioVenta(v.ventas, v.citas);
  return cumpleObjetivo(r) ? `Vende 1 de cada ${r} visitas` : null;
}

export function panelVentas(reformistaId: string, encargos: Encargo[]) {
  const v = estadisticasVenta(encargos);
  const app = encargos.filter((e) => e.origen !== "invitado");
  const chats = app.filter((e) => e.chat?.some((m) => m.de === "cliente")).length;
  const ratio = ratioVenta(v.ventas, v.citas);
  const citasMes = app.filter((e) => e.visita.pagoReformista && delMes(e)).length;

  // Puesto en su zona: entre los reformistas que comparten alguna zona, por ratio de venta y después por respuesta en el chat
  const todos = leerEncargos();
  const mia = FICHAS_EJEMPLO.find((f) => f.id === reformistaId);
  const cerca = FICHAS_EJEMPLO.filter((f) => !mia || f.id === mia.id || f.zonas.some((z) => mia.zonas.includes(z)));
  // Si en su zona hay muy pocos, se compara con todos los de la provincia
  const rivales = cerca.length >= 3 ? cerca : FICHAS_EJEMPLO;
  const ids = [...new Set([reformistaId, ...rivales.map((f) => f.id)])];
  const nota = (id: string) => {
    const s = estadisticasVenta(todos.filter((e) => e.reformistaId === id));
    return (s.pctVendido ?? 0) * 1000 + (s.respuestaChat ?? 0);
  };
  const orden = ids.map((id) => ({ id, n: id === reformistaId ? (v.pctVendido ?? 0) * 1000 + (v.respuestaChat ?? 0) : nota(id) })).sort((a, b) => b.n - a.n);
  const puesto = orden.findIndex((x) => x.id === reformistaId) + 1;

  const consejos: string[] = [];
  if (v.horasRespuesta !== null && v.horasRespuesta > 1) consejos.push(`Respondes en ${Math.round(v.horasRespuesta)} h de media. Los que más venden contestan en menos de 1 hora: activa los avisos de WhatsApp.`);
  if (v.respuestaChat !== null && v.respuestaChat < 100) consejos.push(`Has dejado sin responder el ${100 - v.respuestaChat} % de los chats. Cada chat sin respuesta es una visita perdida.`);
  if (v.pendientes > 0) consejos.push(`Tienes ${v.pendientes} cita${v.pendientes > 1 ? "s" : ""} sin marcar si vendiste: márcalas para que tu ratio sea real.`);
  if (ratio !== null && !cumpleObjetivo(ratio)) consejos.push(`Vendes 1 de cada ${ratio} visitas. Para llegar a 1 de cada ${OBJETIVO_RATIO}: lleva a la visita tu presupuesto ya ajustado a la app y fotos de obras parecidas.`);
  if (v.citas === 0) consejos.push("Aún no tienes citas. Completa tu ficha con fotos de tus trabajos y revisa tus tarifas: salen en las comparativas de tu zona.");
  if (cumpleObjetivo(ratio)) consejos.push(`¡Cumples el objetivo! Los clientes ven en tu ficha la insignia «Vende 1 de cada ${ratio} visitas».`);

  return {
    ...v,
    ratio,
    citasMes,
    puesto,
    rivales: ids.length,
    embudo: [
      { t: "Te vieron en comparativas", n: Math.max(apariciones(reformistaId), app.length) },
      { t: "Te escribieron o pidieron cita", n: Math.max(chats, app.length) },
      { t: "Citas hechas", n: v.citas },
      { t: "Obras vendidas", n: v.ventas },
    ],
    consejos,
  };
}

/** Ratio y rapidez de respuesta de un reformista, para ordenar la comparativa del cliente. */
export function resumenReformista(id: string) {
  const v = estadisticasVenta(leerEncargos().filter((e) => e.reformistaId === id));
  return { ratio: ratioVenta(v.ventas, v.citas), horas: v.horasRespuesta };
}

/** Presupuestos que el cliente ya tiene de fuera, para compararlos con los de la app. */
export interface PresupuestoPropio { importe: number; de: string; fecha: string }
const clavePropios = (proyectoId: string) => `app-reformas:presupuestos-propios:${proyectoId}`;
export function leerPropios(proyectoId: string): PresupuestoPropio[] {
  try {
    return JSON.parse(localStorage.getItem(clavePropios(proyectoId)) ?? "[]") as PresupuestoPropio[];
  } catch {
    return [];
  }
}
export function guardarPropio(proyectoId: string, p: Omit<PresupuestoPropio, "fecha">) {
  const lista = [...leerPropios(proyectoId), { ...p, fecha: new Date().toISOString() }];
  try {
    localStorage.setItem(clavePropios(proyectoId), JSON.stringify(lista));
  } catch {
    /* sin almacenamiento */
  }
  return lista;
}
export function borrarPropio(proyectoId: string, i: number) {
  const lista = leerPropios(proyectoId).filter((_, j) => j !== i);
  try {
    localStorage.setItem(clavePropios(proyectoId), JSON.stringify(lista));
  } catch {
    /* sin almacenamiento */
  }
  return lista;
}
