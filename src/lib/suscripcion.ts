"use client";

import { useEffect, useState } from "react";
import { avisarCambio, registrarPago } from "./nube";
import { guardarPlanNube } from "./ia-nube";
import { conNube } from "./modo";

/**
 * Planes para clientes (precios del titular, 25/11/2026): suscripción mensual a los servicios de la app, sin permanencia.
 * Es aparte de la cuota única de acceso a los proveedores (29,90 €, o 19,90 € con suscripción): ver comercializacion.ts.
 * El cobro (Stripe, tarjeta) todavía no está conectado: en la demo la suscripción se simula en el navegador.
 */
export type Plan = "gratis" | "basico" | "pro";

export interface InfoPlan {
  id: Plan;
  nombre: string;
  precio: number;
  lema: string;
  incluye: string[];
  destacado?: boolean;
}

export const PLANES: InfoPlan[] = [
  {
    id: "gratis",
    nombre: "Gratis",
    precio: 0,
    lema: "Para saber cuánto cuesta tu reforma",
    incluye: ["Presupuesto orientativo partida a partida, al momento en la app", "Cuántos reformistas hay en tu zona y el presupuesto medio", "Acabados básico, medio o premium", "Foro de reformas: leer, preguntar y responder"],
  },
  {
    id: "basico",
    nombre: "Básico",
    precio: 4.95,
    lema: "Acceso a los servicios de la app para tu reforma",
    incluye: [
      "Reforma en tu hipoteca: comparativa de entidades para financiar la obra",
      "Ayudas y subvenciones para tu vivienda, con avisos",
      "Seguimiento de la obra por fases, con fotos, avances y pagos por hitos",
      "Contrato estándar de reforma listo para firmar con tu reformista",
      "Tasación y seguro de promotor contratables online",
      "Acceso a los proveedores de tu zona a 19,90 € en vez de 29,90 €",
    ],
    destacado: true,
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: 29.95,
    lema: "Todo lo del Básico y un asistente IA especializado en obra",
    incluye: [
      "Todo lo del plan Básico",
      "Asistente IA de obra privado, sin límite razonable de preguntas",
      "Revisa presupuestos: qué falta, qué está caro y qué preguntar",
      "Legalizaciones en Madrid: licencia o declaración responsable, ICIO, comunidad de vecinos",
      "Dudas técnicas: humedades, aerotermia, ventanas, plazos y garantías",
    ],
  },
];

/** 4,95 € */
export const precioPlan = (p: Pick<InfoPlan, "precio">) => `${p.precio.toFixed(p.precio % 1 ? 2 : 0).replace(".", ",")} €`;

const CLAVE = "app-reformas:suscripcion";

export interface Suscripcion {
  plan: Plan;
  desde?: string;
}

export function leerSuscripcion(): Suscripcion {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as Suscripcion | null;
    if (s && PLANES.some((p) => p.id === s.plan)) return s;
  } catch {
    /* sin almacenamiento */
  }
  return { plan: "gratis" };
}

export function guardarSuscripcion(plan: Plan) {
  const s: Suscripcion = { plan, desde: plan === "gratis" ? undefined : new Date().toISOString() };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(s));
    avisarCambio(CLAVE);
    const info = PLANES.find((p) => p.id === plan);
    if (info?.precio) registrarPago("suscripcion", info.precio, plan);
    if (conNube) void guardarPlanNube(plan).catch(() => undefined);
  } catch {
    /* sin almacenamiento */
  }
  window.dispatchEvent(new Event("suscripcion"));
  return s;
}

const nivel: Record<Plan, number> = { gratis: 0, basico: 1, pro: 2 };
export const incluye = (tiene: Plan, necesita: Plan) => nivel[tiene] >= nivel[necesita];

export function useSuscripcion() {
  const [s, setS] = useState<Suscripcion | null>(null);
  useEffect(() => {
    const leer = () => setS(leerSuscripcion());
    leer();
    window.addEventListener("suscripcion", leer);
    window.addEventListener("storage", leer);
    return () => {
      window.removeEventListener("suscripcion", leer);
      window.removeEventListener("storage", leer);
    };
  }, []);
  return s;
}
