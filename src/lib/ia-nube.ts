"use client";

import { supabaseNavegador } from "./supabase/navegador";
import { tarifasPorDefecto, ventaUnidad } from "./tarifas";
import type { RespuestaIA } from "./foro";
import type { TarifaReformista } from "./types";

/**
 * IA a través de la Edge Function «asistente» de Supabase. La clave de Anthropic está solo allí,
 * como secreto; la función comprueba el plan de cada persona y su límite del mes.
 */

async function llamar<T>(cuerpo: object): Promise<T> {
  const s = supabaseNavegador();
  const { data: sesion } = await s.auth.getSession();
  if (!sesion.session) throw new Error("Entra con tu email (en «Mi cuenta») para usar el asistente.");
  const { data, error } = await s.functions.invoke("asistente", { body: cuerpo });
  if (error) {
    // El mensaje de la función viene en el cuerpo de la respuesta
    const ctx = (error as { context?: Response }).context;
    const j = ctx && typeof ctx.json === "function" ? await ctx.json().catch(() => null) : null;
    throw new Error(j?.error ?? "El asistente no está disponible ahora. Inténtalo más tarde.");
  }
  return data as T;
}

export type TurnoIA = { rol: "usuario" | "asistente"; texto: string };

/** Asistente de obra (plan Pro). */
export const preguntarAsistenteNube = (historial: TurnoIA[]) =>
  llamar<{ respuesta: RespuestaIA; restantes: number }>({ modo: "asistente", historial });

/** El plan elegido en la app (pago simulado hasta Stripe) se guarda también en Supabase para la función. */
export async function guardarPlanNube(plan: "gratis" | "basico" | "pro") {
  const s = supabaseNavegador();
  const { data: sesion } = await s.auth.getSession();
  if (sesion.session) await s.rpc("elegir_plan_simulado", { p: plan });
}

const aBase64 = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = () => rej(new Error("No se ha podido leer el archivo."));
    r.readAsDataURL(f);
  });

/** Lee un presupuesto en PDF del profesional y propone sus tarifas por capítulo respecto a la referencia. */
export async function leerPresupuestoParaTarifa(f: File): Promise<{ tarifa: Pick<TarifaReformista, "general" | "capitulos">; notas: string; restantes: number }> {
  if (f.type !== "application/pdf") throw new Error("Sube el presupuesto en PDF.");
  if (f.size > 8 * 1024 * 1024) throw new Error("El PDF pesa más de 8 MB.");
  const t = tarifasPorDefecto();
  const referencia = t.precios.map((p) => ({ capitulo: p.capitulo, partida: p.descripcion, unidad: p.unidad, precio: ventaUnidad(t, p) }));
  return llamar({ modo: "tarifa", pdf: await aBase64(f), referencia });
}
