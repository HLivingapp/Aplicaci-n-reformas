import { reformaVacia, viviendaVacia } from "../proyecto";
import type { ContactoCliente } from "../publico";
import type { DatosReforma, Vivienda } from "../types";

const texto = (x: unknown, max: number) => (typeof x === "string" ? x.slice(0, max) : "");

/** Comprueba y limpia lo que llega del formulario público (no se confía en el navegador). */
export function validarProyecto(b: unknown): { vivienda: Vivienda; reforma: DatosReforma } | null {
  const body = b as { vivienda?: Partial<Vivienda>; reforma?: Partial<DatosReforma> } | null;
  if (!body?.vivienda || !body.reforma || typeof body.vivienda !== "object" || typeof body.reforma !== "object") return null;
  const v = { ...viviendaVacia(), ...body.vivienda } as Vivienda;
  const r = { ...reformaVacia(), ...body.reforma } as DatosReforma;
  if (typeof v.m2 !== "number" || v.m2 <= 0 || v.m2 > 5000) return null;
  const n = (x: unknown, min: number, max: number) => typeof x === "number" && x >= min && x <= max;
  if (!n(v.dormitorios, 0, 20) || !n(v.banos, 0, 10) || !n(r.dormitoriosDeseados, 0, 20) || !n(r.banosDeseados, 0, 10)) return null;
  if (!Array.isArray(v.terrazas) || v.terrazas.length > 10 || !Array.isArray(r.estancias) || r.estancias.length > 30) return null;
  r.comentarios = texto(r.comentarios, 4000);
  return { vivienda: v, reforma: r };
}

export function validarContacto(b: unknown): ContactoCliente | null {
  const c = b as Partial<ContactoCliente> | null;
  const nombre = texto(c?.nombre, 120).trim();
  const telefono = texto(c?.telefono, 40).trim();
  const email = texto(c?.email, 120).trim();
  if (!nombre || (!telefono && !email)) return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { nombre, telefono, email };
}
