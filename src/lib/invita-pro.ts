"use client";

import { guardarEncargoInvitado, referencia } from "./encargos";
import { leerEstudios, precioServicio, encargoInvitadoEstudio, SERVICIOS, type Servicio } from "./estudios";
import type { DatosReforma, Vivienda } from "./types";

/**
 * «Invita a tus clientes»: el reformista o arquitecto comparte un enlace con sus propios clientes.
 * Las obras de esos clientes no pagan reserva ni fee. El enlace lleva al asistente del presupuesto.
 */
export interface InvitacionPro {
  tipo: "reformista" | "estudio";
  id: string;
  codigo: string;
  servicio?: Servicio;
}

export const rutaInvitacionPro = (i: InvitacionPro) => `/nuevo/?pro=${[i.tipo === "reformista" ? "r" : "a", i.id, i.codigo, i.servicio ?? ""].map(encodeURIComponent).join("~")}`;

const CLAVE = "app-reformas:invitacion-pro";

/** La invitación del enlace; se recuerda en este navegador por si el cliente se registra antes de seguir. */
export function leerInvitacionPro(): InvitacionPro | null {
  let v = new URLSearchParams(window.location.search).get("pro");
  try {
    if (v) localStorage.setItem(CLAVE, v);
    else v = localStorage.getItem(CLAVE);
  } catch {
    /* sin almacenamiento */
  }
  if (!v) return null;
  const [t, id, codigo, servicio] = v.split("~").map(decodeURIComponent);
  if (!id || !codigo || (t !== "r" && t !== "a")) return null;
  const s = SERVICIOS.find((x) => x.id === servicio)?.id;
  return { tipo: t === "r" ? "reformista" : "estudio", id, codigo, servicio: t === "a" ? (s ?? "proyecto") : undefined };
}

/** Tras crear el proyecto del cliente invitado: su obra queda unida al profesional que le invitó. */
export function olvidarInvitacionPro() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento */
  }
}

export function aplicarInvitacionPro(i: InvitacionPro, d: { proyectoId: string; tokenCliente: string; cliente: string; vivienda: Vivienda; reforma: DatosReforma }) {
  const zona = d.vivienda.direccion.municipio || "Madrid";
  if (i.tipo === "reformista") {
    guardarEncargoInvitado({ ...d, zona, reformistaId: i.id, codigo: i.codigo, baseInicial: referencia(d.vivienda, d.reforma).base, visita: { preferencia: "Cliente tuyo: lo invitaste tú" } });
    return;
  }
  const est = leerEstudios().find((e) => e.id === i.id);
  const m2 = d.vivienda.m2 ?? 0;
  encargoInvitadoEstudio({
    estudioId: i.id,
    codigo: i.codigo,
    servicio: i.servicio ?? "proyecto",
    proyectoId: d.proyectoId,
    cliente: d.cliente,
    zona,
    m2,
    precioCalculado: (est && precioServicio(est.tarifa, i.servicio ?? "proyecto", m2)) ?? 0,
    nota: "Cliente tuyo: lo invitaste tú",
  });
}
