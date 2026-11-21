"use client";

import { useEffect, useState } from "react";

/**
 * Planes para clientes. El presupuesto orientativo y la comunidad son gratis; la red de profesionales
 * y el asistente IA privado van con suscripción mensual, sin permanencia.
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
    incluye: ["Presupuesto orientativo partida a partida, al momento en la app", "Acabados básico, medio o premium", "Comunidad de reformas: leer, preguntar y responder", "Una opinión del asistente IA en cada tema de la comunidad"],
  },
  {
    id: "basico",
    nombre: "Básico",
    precio: 5,
    lema: "Suscríbete y accede a nuestra red de profesionales",
    incluye: [
      "Red de reformistas homologados de tu zona, con sello y fecha de la última comprobación",
      "El presupuesto de cada reformista para tu casa, calculado con sus tarifas",
      "Elige los que más te interesen y queda con ellos para una visita, sin dar tu teléfono a nadie más",
      "Estudios de arquitectura homologados: precio de cada uno para tu proyecto, licencia o legalización",
      "Presupuesto final tras la visita y contrato estándar firmado en la app, con seguro de promotor gratis (responsabilidad civil y defensa jurídica)",
      "Seguimiento de la obra por fases, con fotos y valoraciones",
    ],
    destacado: true,
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: 30,
    lema: "Todo lo del Básico y un asistente IA especializado en obra",
    incluye: [
      "Todo lo del plan Básico",
      "Asistente IA de obra privado, sin límite razonable de preguntas",
      "Revisa presupuestos: qué falta, qué está caro y qué preguntar",
      "Legalizaciones en Madrid: licencia o declaración responsable, ICIO, comunidad",
      "Dudas técnicas: humedades, aerotermia, ventanas, plazos y garantías",
    ],
  },
];

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
