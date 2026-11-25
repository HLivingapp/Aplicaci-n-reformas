"use client";
import { TITULAR } from "./legal";

import { nuevoId } from "./id";
import { avisarCambio, registrarPago } from "./nube";
import { anonimizar } from "./anonimizar";
import { COBRO } from "./comercializacion";

/**
 * Estudios de arquitectura y arquitectos autónomos: alta y tarifas por servicio. El cliente (con el acceso único)
 * ve la ficha y el precio de cada uno y chatea con ellos. Cuando el arquitecto pide el contacto del cliente paga 99 €,
 * acabe o no en encargo; desde ahí la relación es directa. Sin comisión sobre los honorarios (25/11/2026).
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

export type EstadoEncargoEstudio = "solicitado" | "contacto" | "propuesta" | "firmado" | "descartado";
export interface MensajeEstudio { de: "cliente" | "estudio"; texto: string; fecha: string; ocultos?: number }

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
  /** Chat cliente–arquitecto. Los contactos se ocultan hasta que el arquitecto pide (y paga) el contacto del cliente. */
  chat?: MensajeEstudio[];
  /** El arquitecto pidió el contacto del cliente y pagó 99 € (simulado en la demo) */
  contacto?: string;
  /** Aviso al arquitecto de la conversación nueva (email y WhatsApp; simulado) */
  aviso?: string;
  /** «invitado»: cliente propio del estudio, que le invitó a la app. Sin coste. */
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
  const ahora = new Date().toISOString();
  guardar({
    ...d, id: nuevoId(), estudioId: est.id, codigo: est.codigo, precioCalculado: precioServicio(est.tarifa, d.servicio, d.m2) ?? 0, creado: ahora, estado: "solicitado", aviso: ahora,
    chat: d.nota.trim() ? [{ de: "cliente", texto: anonimizar(d.nota).texto, fecha: ahora }] : [],
  });
}

/** Mensaje en el chat. Hasta que el arquitecto pide el contacto, teléfonos, emails y webs se ocultan. */
export function mensajeEstudio(id: string, de: MensajeEstudio["de"], texto: string): number {
  const e = leerEncargosEstudio().find((x) => x.id === id);
  if (!e) return 0;
  const { texto: limpio, ocultos } = e.contacto || e.origen === "invitado" ? { texto: texto.trim(), ocultos: 0 } : anonimizar(texto);
  if (!limpio) return 0;
  cambiar(id, (x) => ({ ...x, chat: [...(x.chat ?? []), { de, texto: limpio, fecha: new Date().toISOString(), ...(ocultos && { ocultos }) }] }));
  return ocultos;
}

/** El arquitecto pide el contacto del cliente: paga 99 € (simulado), acabe o no en encargo. Desde aquí, relación directa. */
export function pedirContactoCliente(id: string) {
  const e = leerEncargosEstudio().find((x) => x.id === id);
  if (!e || e.contacto) return;
  if (e.origen !== "invitado") registrarPago("contacto_arquitecto", COBRO.contactoArquitecto, id);
  cambiar(id, (x) => ({ ...x, estado: x.estado === "solicitado" ? "contacto" : x.estado, contacto: new Date().toISOString() }));
}

/** Encargo de un cliente que ha invitado el propio estudio: sin coste. */
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
  solicitado: { texto: "Conversación abierta", cls: "bg-amber-100 text-amber-900" },
  contacto: { texto: "Contacto compartido", cls: "bg-sky-100 text-sky-900" },
  propuesta: { texto: "Propuesta recibida", cls: "bg-teal-100 text-teal-900" },
  firmado: { texto: "Contrato firmado", cls: "bg-emerald-100 text-emerald-800" },
  descartado: { texto: "Descartado", cls: "bg-stone-200 text-stone-600" },
};

/** Compromiso del estudio con los clientes que llegan por la app. Pendiente de revisión legal. */
export const TEXTO_COMPROMISO_ESTUDIO =
  `Pagaré 99 € cada vez que pida el contacto de un cliente que me llegue por la app, acabe o no en encargo. Me comprometo a responder en el chat a los clientes que me escriban. ${TITULAR} no cobra comisión sobre mis honorarios y, una vez compartido el contacto, la relación con el cliente es directa.`;
