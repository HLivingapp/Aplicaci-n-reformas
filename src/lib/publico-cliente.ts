"use client";

import type { Estimacion } from "./estimacion";
import { conBaseDeDatos } from "./modo";
import { estimacionPublica, registrarProyecto, responderPresupuesto, vistaPortal, type ContactoCliente, type DatosPortal } from "./publico";
import { escribirLocal, leerLocal } from "./store";
import type { DatosReforma, Vivienda } from "./types";

async function api<T>(url: string, body?: unknown): Promise<T> {
  const r = await fetch(url, body === undefined ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.mensaje ?? "Error de conexión");
  return r.json();
}

export async function pedirEstimacion(v: Vivienda, r: DatosReforma): Promise<Estimacion> {
  if (!conBaseDeDatos) return estimacionPublica(v, r, leerLocal().tarifas);
  return api("/api/estimacion", { vivienda: v, reforma: r });
}

export async function enviarProyecto(v: Vivienda, r: DatosReforma, c: ContactoCliente, acepto: boolean): Promise<string> {
  if (!conBaseDeDatos) {
    const d = leerLocal();
    const token = registrarProyecto(d, v, r, c);
    escribirLocal(d);
    return token;
  }
  const res = await api<{ token: string }>("/api/proyectos", { vivienda: v, reforma: r, contacto: c, acepto });
  return res.token;
}

export async function cargarPortal(token: string): Promise<DatosPortal | null> {
  if (!conBaseDeDatos) return vistaPortal(leerLocal(), token);
  try {
    return await api<DatosPortal>(`/api/portal/${encodeURIComponent(token)}`);
  } catch {
    return null;
  }
}

export async function enviarRespuesta(token: string, presupuestoId: string, acepta: boolean, comentario: string): Promise<boolean> {
  if (!conBaseDeDatos) {
    const d = leerLocal();
    const ok = responderPresupuesto(d, token, presupuestoId, acepta, comentario);
    if (ok) escribirLocal(d);
    return ok;
  }
  const res = await api<{ ok: boolean }>(`/api/portal/${encodeURIComponent(token)}/respuesta`, { presupuestoId, acepta, comentario });
  return res.ok;
}
