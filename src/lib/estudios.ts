"use client";
import { TITULAR } from "./legal";

import { nuevoId } from "./id";
import { avisarCambio } from "./nube";

/**
 * Estudios de arquitectura y arquitectos autónomos: alta, tarifas por servicio, encargos de
 * clientes, propuesta y contrato en la app. Mismo modelo de reserva que con los reformistas.
 * Demostración: todo se guarda en este navegador.
 */

export const SERVICIOS = [
  { id: "proyecto", texto: "Proyecto de reforma y licencia", detalle: "Proyecto técnico, planos y tramitación de la licencia en el Ayuntamiento." },
  { id: "declaracion", texto: "Declaración responsable", detalle: "Documentación técnica y presentación de la declaración responsable de obras." },
  { id: "legalizacion", texto: "Legalización de obras hechas", detalle: "Levantamiento, documentación y tramitación para regularizar obras ya ejecutadas." },
  { id: "direccion", texto: "Dirección de obra", detalle: "Visitas y control técnico de la obra, certificado final." },
  { id: "certificado", texto: "Certificado energético", detalle: "Visita, cálculo y registro del certificado de eficiencia energética." },
] as const;
export type Servicio = (typeof SERVICIOS)[number]["id"];

/** Precio de cada servicio: una parte fija y otra por m² de vivienda (sin IVA). */
export type TarifaEstudio = Partial<Record<Servicio, { fijo: number; porM2: number }>>;

export interface Estudio {
  id: string;
  codigo: string;
  tipo: "estudio" | "autonomo";
  nombre: string;
  colegio: string;
  numeroColegiado: string;
  seguroRC: string;
  zonas: string[];
  presentacion: string;
  tarifa: TarifaEstudio;
  creado: string;
  declaracion: string;
  valoracion?: { media: number; n: number };
  encargosEnApp: number;
}

export type EstadoEncargoEstudio = "solicitado" | "propuesta" | "firmado" | "descartado";

export interface EncargoEstudio {
  id: string;
  estudioId: string;
  codigo: string;
  servicio: Servicio;
  proyectoId: string;
  cliente: string;
  zona: string;
  m2: number;
  precioCalculado: number;
  creado: string;
  estado: EstadoEncargoEstudio;
  nota: string;
  propuesta?: { importe: number; plazoSemanas: number; alcance: string; fecha: string };
  firmas?: { cliente?: string; estudio?: string };
  /** «invitado»: cliente propio del estudio, que le invitó a la app. Sin reserva ni fee. */
  origen?: "app" | "invitado";
}

export const precioServicio = (t: TarifaEstudio, s: Servicio, m2: number) => {
  const x = t[s];
  return x ? Math.round(x.fijo + x.porM2 * m2) : null;
};

const codigo = (id: string) => {
  let h = 7;
  for (const c of id) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return `A-${(h % 9000) + 1000}`;
};

/** Estudios de ejemplo (ficticios) para que la demo muestre cómo funciona. */
export const ESTUDIOS_EJEMPLO: Estudio[] = [
  {
    id: "ej-a1", codigo: "A-3172", tipo: "estudio", nombre: "", colegio: "COAM", numeroColegiado: "", seguroRC: "", zonas: ["Madrid centro", "Chamberí", "Salamanca"],
    presentacion: "Estudio especializado en rehabilitación de viviendas en edificios antiguos y protegidos del centro.",
    tarifa: { proyecto: { fijo: 1200, porM2: 22 }, declaracion: { fijo: 450, porM2: 4 }, legalizacion: { fijo: 900, porM2: 12 }, direccion: { fijo: 800, porM2: 10 }, certificado: { fijo: 120, porM2: 0.8 } },
    creado: "2026-10-01", declaracion: "", valoracion: { media: 4.8, n: 14 }, encargosEnApp: 9,
  },
  {
    id: "ej-a2", codigo: "A-6604", tipo: "autonomo", nombre: "", colegio: "COAM", numeroColegiado: "", seguroRC: "", zonas: ["Madrid capital", "Getafe", "Leganés"],
    presentacion: "Arquitecta autónoma. Declaraciones responsables y licencias de reformas de pisos en plazos cortos.",
    tarifa: { proyecto: { fijo: 900, porM2: 18 }, declaracion: { fijo: 350, porM2: 3 }, legalizacion: { fijo: 700, porM2: 10 }, certificado: { fijo: 95, porM2: 0.6 } },
    creado: "2026-10-12", declaracion: "", valoracion: { media: 4.6, n: 6 }, encargosEnApp: 4,
  },
  {
    id: "ej-a3", codigo: "A-8127", tipo: "estudio", nombre: "", colegio: "COAM", numeroColegiado: "", seguroRC: "", zonas: ["Madrid norte", "Alcobendas", "Pozuelo"],
    presentacion: "Proyecto y dirección de obra de reformas integrales, con diseño de interiores.",
    tarifa: { proyecto: { fijo: 1500, porM2: 26 }, declaracion: { fijo: 500, porM2: 4 }, direccion: { fijo: 1000, porM2: 12 }, certificado: { fijo: 150, porM2: 1 } },
    creado: "2026-09-20", declaracion: "", valoracion: { media: 4.9, n: 11 }, encargosEnApp: 7,
  },
];

// ---------- Almacenamiento (demostración) ----------

const CLAVE_ESTUDIOS = "app-reformas:estudios";
const CLAVE_ENCARGOS = "app-reformas:encargos-estudio";
const CLAVE_TARIFAS = "app-reformas:tarifas-estudios";

function leer<T>(clave: string, vacio: T): T {
  try {
    return JSON.parse(localStorage.getItem(clave) ?? "null") ?? vacio;
  } catch {
    return vacio;
  }
}
function escribir(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    avisarCambio(clave);
    window.dispatchEvent(new Event("encargos"));
  } catch {
    /* sin almacenamiento */
  }
}

export function leerEstudios(): Estudio[] {
  const tarifas = leer<Record<string, TarifaEstudio>>(CLAVE_TARIFAS, {});
  return [...leer<Estudio[]>(CLAVE_ESTUDIOS, []), ...ESTUDIOS_EJEMPLO].map((e) => ({ ...e, tarifa: tarifas[e.id] ?? e.tarifa }));
}

export function altaEstudio(d: Omit<Estudio, "id" | "codigo" | "creado" | "encargosEnApp">): string {
  const id = nuevoId();
  escribir(CLAVE_ESTUDIOS, [{ ...d, id, codigo: codigo(id), creado: new Date().toISOString(), encargosEnApp: 0 }, ...leer<Estudio[]>(CLAVE_ESTUDIOS, [])]);
  return id;
}

export function guardarTarifaEstudio(id: string, t: TarifaEstudio) {
  escribir(CLAVE_TARIFAS, { ...leer<Record<string, TarifaEstudio>>(CLAVE_TARIFAS, {}), [id]: t });
}

export const leerEncargosEstudio = (): EncargoEstudio[] => leer<EncargoEstudio[]>(CLAVE_ENCARGOS, []);
function guardar(e: EncargoEstudio) {
  escribir(CLAVE_ENCARGOS, [e, ...leerEncargosEstudio().filter((x) => x.id !== e.id)]);
}
function cambiar(id: string, f: (e: EncargoEstudio) => EncargoEstudio) {
  const e = leerEncargosEstudio().find((x) => x.id === id);
  if (e) guardar(f(e));
}

export function solicitarEstudio(est: Estudio, d: Pick<EncargoEstudio, "servicio" | "proyectoId" | "cliente" | "zona" | "m2" | "nota">) {
  const ya = leerEncargosEstudio().some((x) => x.estudioId === est.id && x.proyectoId === d.proyectoId && x.servicio === d.servicio && x.estado !== "descartado");
  if (ya) return;
  guardar({ ...d, id: nuevoId(), estudioId: est.id, codigo: est.codigo, precioCalculado: precioServicio(est.tarifa, d.servicio, d.m2) ?? 0, creado: new Date().toISOString(), estado: "solicitado" });
}

/** Encargo de un cliente que ha invitado el propio estudio: sin reserva ni fee. */
export function encargoInvitadoEstudio(d: Pick<EncargoEstudio, "estudioId" | "codigo" | "servicio" | "proyectoId" | "cliente" | "zona" | "m2" | "precioCalculado" | "nota">) {
  if (leerEncargosEstudio().some((x) => x.estudioId === d.estudioId && x.proyectoId === d.proyectoId)) return;
  guardar({ ...d, id: nuevoId(), creado: new Date().toISOString(), estado: "solicitado", origen: "invitado" });
}

export const enviarPropuesta = (id: string, p: { importe: number; plazoSemanas: number; alcance: string }) =>
  cambiar(id, (e) => ({ ...e, estado: "propuesta", firmas: undefined, propuesta: { ...p, fecha: new Date().toISOString() } }));

/** El cliente acepta y firma: el resto de solicitudes del mismo servicio quedan descartadas. */
export function firmarPropuestaCliente(id: string) {
  const e = leerEncargosEstudio().find((x) => x.id === id);
  if (!e) return;
  const ahora = new Date().toISOString();
  escribir(
    CLAVE_ENCARGOS,
    leerEncargosEstudio().map((x) =>
      x.id === id ? { ...x, firmas: { cliente: ahora } } : x.proyectoId === e.proyectoId && x.servicio === e.servicio && !x.firmas?.estudio && x.estado !== "descartado" ? { ...x, estado: "descartado" as const } : x,
    ),
  );
}
export const firmarPropuestaEstudio = (id: string) => cambiar(id, (e) => ({ ...e, estado: "firmado", firmas: { ...e.firmas, estudio: new Date().toISOString() } }));
export const descartarEncargoEstudio = (id: string) => cambiar(id, (e) => ({ ...e, estado: "descartado" }));

export const ESTADO_ESTUDIO: Record<EstadoEncargoEstudio, { texto: string; cls: string }> = {
  solicitado: { texto: "Solicitado", cls: "bg-amber-100 text-amber-900" },
  propuesta: { texto: "Propuesta recibida", cls: "bg-teal-100 text-teal-900" },
  firmado: { texto: "Contrato firmado", cls: "bg-emerald-100 text-emerald-800" },
  descartado: { texto: "Descartado", cls: "bg-stone-200 text-stone-600" },
};

/** Compromiso de declarar las ventas que llegan por la app (mismo texto que para reformistas). Pendiente de revisión legal. */
export const TEXTO_COMPROMISO_ESTUDIO =
  `Me comprometo a declarar íntegramente en la app todos los encargos, ampliaciones y trabajos adicionales con clientes que haya conocido a través de la app, aunque se cierren o cobren fuera de ella. Si no lo hago, ${TITULAR} podrá reclamarme judicialmente tres veces el fee de comercialización eludido y vetarme en la app.`;
