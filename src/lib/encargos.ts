"use client";

import { estimar } from "./estimacion";
import { avisarCambio, registrarPago } from "./nube";
import type { Estimacion, LineaEstimacion } from "./estimacion";
import { nuevoId } from "./id";
import type { FichaRed } from "./red";
import { tarifasPorDefecto, ventaUnidad } from "./tarifas";
import type { DatosReforma, TarifaReformista, Tarifas, Vivienda } from "./types";

/**
 * Recorrido del cliente con los reformistas homologados:
 * 1. Cada reformista carga sus tarifas en su área (ajuste por capítulo respecto a la referencia).
 * 2. La app calcula el presupuesto de cada reformista para la casa del cliente y los compara.
 * 3. El cliente elige los que más le interesan y les pide una visita.
 * 4. Tras la visita, el reformista mete la cifra acordada y sus tarifas definitivas.
 * 5. La app genera el contrato estándar y ambos lo firman en la app (comisión del 3 % al reformista).
 *
 * Demostración: todo se guarda en este navegador. Con la base de datos irá a Supabase.
 */

export const IVA_REFORMA = 10;

import { reservaApp, VISITAS } from "./comercializacion";
import { anonimizar, type Identidad } from "./anonimizar";
export { COMERCIALIZACION, pctReserva, reservaApp, TEXTO_RESERVA, umbralMinimo, VISITAS, TEXTO_VISITA_CLIENTE, TEXTO_VISITA_REFORMISTA, TEXTO_DESCUENTO_VISITA, AVISO_TARIFAS, LETRA_PEQUENA_TARIFAS } from "./comercializacion";

export type { TarifaReformista };

export type EstadoPago = "pendiente" | "solicitado" | "pagado";
export const NUM_HITOS = 4;

export type EstadoEncargo = "visita_pedida" | "visita_fijada" | "presupuesto_final" | "firmado_cliente" | "firmado" | "descartado";

export interface Encargo {
  id: string;
  reformistaId: string;
  codigo: string;
  /** Proyecto del cliente (id) y su enlace privado */
  proyectoId: string;
  tokenCliente: string;
  cliente: string;
  zona: string;
  vivienda: Vivienda;
  reforma: DatosReforma;
  /** Presupuesto calculado con las tarifas del reformista al pedir la visita (sin IVA) */
  baseInicial: number;
  creado: string;
  estado: EstadoEncargo;
  /** pagoReformista: fecha en que el reformista pagó la visita (150 €, simulado en la demo) */
  visita: { preferencia: string; fecha?: string; nota?: string; pagoReformista?: string };
  final?: { importe: number; capitulos: Record<string, number>; plazoSemanas: number; notas: string; fecha: string; lineas: LineaEstimacion[] };
  firmas?: { cliente?: string; reformista?: string };
  /** Estado de cada hito de pago del contrato (mismo orden que HITOS) */
  pagos?: EstadoPago[];
  /** Avances de obra que publica el reformista y ve el cliente */
  avances?: { fecha: string; texto: string }[];
  /** «app»: el cliente lo encontró en la app (reserva y fee). «invitado»: el cliente lo invitó (sin reserva ni fee, sin seguro gratis). */
  origen?: OrigenEncargo;
  /** Invitado desde la lista de proveedores sin homologar: en esta primera obra nadie paga nada: ni acceso, ni visita, ni reserva ni fee. Después entra en la red con las reglas normales. */
  desdeNoHomologado?: boolean;
  /** Chat antes de la firma (para preparar la primera visita). Los contactos se ocultan automáticamente. */
  chat?: MensajeChat[];
  /** Veces que cada parte intentó compartir datos de contacto en el chat */
  intentosContacto?: { cliente: number; reformista: number };
}

export interface MensajeChat { de: "cliente" | "reformista"; texto: string; fecha: string; ocultos?: number }

export type OrigenEncargo = "app" | "invitado";
export const ORIGEN_ENCARGO: Record<OrigenEncargo, { texto: string; cls: string }> = {
  app: { texto: "Cliente de la app", cls: "bg-teal-50 text-teal-800 ring-1 ring-teal-200" },
  invitado: { texto: "Cliente tuyo (te invitó)", cls: "bg-violet-50 text-violet-800 ring-1 ring-violet-200" },
};
/** Reserva de esta obra: 0 si el reformista viene invitado por el cliente. */
export const reservaEncargo = (e: Pick<Encargo, "origen">, importeSinIva: number) => (e.origen === "invitado" ? 0 : reservaApp(importeSinIva));
export const esInvitado = (e: Pick<Encargo, "origen">) => e.origen === "invitado";

export const CAPITULOS = [...new Set(tarifasPorDefecto().precios.map((p) => p.capitulo))];

/** Partidas de ejemplo de cada capítulo, con el precio de venta de referencia por unidad. */
export function partidasCapitulo(capitulo: string, t: Tarifas = tarifasPorDefecto()) {
  return t.precios.filter((p) => p.capitulo === capitulo).map((p) => ({ id: p.id, descripcion: p.descripcion, unidad: p.unidad, precio: ventaUnidad(t, p) }));
}

let cacheRef: Record<string, number> | null = null;
/** Precio de venta de referencia por unidad de cada partida */
const precioReferencia = () => {
  if (!cacheRef) {
    const t = tarifasPorDefecto();
    cacheRef = Object.fromEntries(t.precios.map((p) => [p.id, ventaUnidad(t, p)]));
  }
  return cacheRef;
};

export const tarifaVacia = (): TarifaReformista => ({ general: 0, capitulos: {}, actualizado: new Date().toISOString() });

const factor = (t: Pick<TarifaReformista, "general" | "capitulos">, capitulo: string) => 1 + (t.capitulos[capitulo] ?? t.general) / 100;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Presupuesto de un reformista: la referencia partida a partida con sus precios. */
export function aplicarTarifa(e: Estimacion, t: Pick<TarifaReformista, "general" | "capitulos" | "partidas">): Estimacion {
  // En las partidas que salen de sus presupuestos, su precio frente al de referencia (respeta la calidad y las mediciones);
  // en el resto, su % por capítulo
  const ref = t.partidas ? precioReferencia() : {};
  const lineas = e.lineas.map((l) => {
    const propio = t.partidas?.[l.tarifaId];
    const k = propio && ref[l.tarifaId] ? propio / ref[l.tarifaId] : factor(t, l.capitulo);
    return { ...l, precio: r2(l.precio * k) };
  });
  const base = r2(lineas.reduce((s, l) => s + l.cantidad * l.precio, 0));
  return { ...e, lineas, base, minimo: base, maximo: base };
}

/** Ajusta las partidas para que sumen exactamente la cifra acordada tras la visita. */
export function cuadrarImporte(lineas: LineaEstimacion[], importe: number): LineaEstimacion[] {
  const suma = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  if (!suma || !importe) return lineas;
  const k = importe / suma;
  return lineas.map((l) => ({ ...l, precio: r2(l.precio * k) }));
}

export const referencia = (v: Vivienda, r: DatosReforma) => estimar(v, r, tarifasPorDefecto());

export interface OfertaRed {
  ficha: FichaRed;
  e: Estimacion;
}

/** Presupuesto de cada reformista con tarifas para esta casa, del más barato al más caro. */
export function ofertas(v: Vivienda, r: DatosReforma, fichas: FichaRed[]): OfertaRed[] {
  const ref = referencia(v, r);
  return fichas
    .map((f) => ({ f, t: tarifaDe(f) }))
    .filter((x): x is { f: FichaRed; t: TarifaReformista } => !!x.t)
    .map(({ f, t }) => ({ ficha: f, e: aplicarTarifa(ref, t) }))
    .sort((a, b) => a.e.base - b.e.base);
}

// ---------- Almacenamiento (demostración) ----------

const CLAVE_TARIFAS = "app-reformas:tarifas-red";
const CLAVE_ENCARGOS = "app-reformas:encargos";

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
    window.dispatchEvent(new Event("encargos"));
    avisarCambio(clave);
  } catch {
    /* sin almacenamiento */
  }
}

/** Tarifas de ejemplo de los reformistas ficticios de la demo. */
const TARIFAS_EJEMPLO: Record<string, TarifaReformista> = {
  "ej-r1": { general: 4, capitulos: { "Climatización": -6, "Calefacción y agua caliente": -8, "Pladur": -3 }, actualizado: "2026-11-15" },
  "ej-r2": { general: -5, capitulos: { "Alicatado": -10, "Cocina": -8, "Carpintería exterior": 3 }, actualizado: "2026-11-12" },
  "ej-r3": { general: 2, capitulos: { "Electricidad": -12, "Fontanería": -10 }, actualizado: "2026-11-02" },
  "ej-r4": { general: 1, capitulos: { "Pintura": -8, "Carpintería interior": -5 }, actualizado: "2026-11-18" },
  "ej-r5": { general: -7, capitulos: { "Alicatado": -6 }, actualizado: "2026-11-10" },
};

export function tarifaDe(f: Pick<FichaRed, "id"> & { tarifa?: TarifaReformista }): TarifaReformista | undefined {
  return leer<Record<string, TarifaReformista>>(CLAVE_TARIFAS, {})[f.id] ?? f.tarifa ?? TARIFAS_EJEMPLO[f.id];
}

export function guardarTarifa(reformistaId: string, t: TarifaReformista) {
  const todas = leer<Record<string, TarifaReformista>>(CLAVE_TARIFAS, {});
  escribir(CLAVE_TARIFAS, { ...todas, [reformistaId]: { ...t, actualizado: new Date().toISOString() } });
}

export const leerEncargos = (): Encargo[] => leer<Encargo[]>(CLAVE_ENCARGOS, []);

function guardarEncargo(e: Encargo) {
  escribir(CLAVE_ENCARGOS, [e, ...leerEncargos().filter((x) => x.id !== e.id)]);
}

export function pedirVisitas(
  elegidos: OfertaRed[],
  datos: Pick<Encargo, "proyectoId" | "tokenCliente" | "cliente" | "zona" | "vivienda" | "reforma">,
  preferencia: string,
) {
  const ya = new Set(leerEncargos().filter((e) => e.proyectoId === datos.proyectoId).map((e) => e.reformistaId));
  for (const o of elegidos) {
    if (ya.has(o.ficha.id)) continue;
    guardarEncargo({
      ...datos,
      id: nuevoId(),
      reformistaId: o.ficha.id,
      codigo: o.ficha.codigo,
      baseInicial: o.e.base,
      creado: new Date().toISOString(),
      estado: "visita_pedida",
      visita: { preferencia },
      origen: "app",
    });
  }
}

export function actualizarEncargo(id: string, cambio: (e: Encargo) => Encargo) {
  const e = leerEncargos().find((x) => x.id === id);
  if (e) guardarEncargo(cambio(e));
}

/** El reformista confirma la visita y paga los 150 € de la visita (simulado en la demo). */
export const fijarVisita = (id: string, fecha: string, nota: string) => {
  const e = leerEncargos().find((x) => x.id === id);
  if (e && !e.visita.pagoReformista && !e.desdeNoHomologado && e.origen !== "invitado") registrarPago("visita_profesional", VISITAS.reformista, id);
  actualizarEncargo(id, (e) => ({ ...e, estado: "visita_fijada", visita: { ...e.visita, fecha, nota, pagoReformista: e.visita.pagoReformista ?? new Date().toISOString() } }));
};

const CLAVE_PAGO_VISITAS = "app-reformas:pago-visitas";
/** Fecha en que el cliente pagó las visitas de este proyecto (150 €, una sola vez), o undefined. */
export const visitasPagadas = (proyectoId: string) => leer<Record<string, string>>(CLAVE_PAGO_VISITAS, {})[proyectoId];
/** Pago simulado del cliente antes de pedir las visitas. */
export function pagarVisitasCliente(proyectoId: string) {
  if (!visitasPagadas(proyectoId)) registrarPago("visitas_cliente", VISITAS.cliente, proyectoId);
  escribir(CLAVE_PAGO_VISITAS, { ...leer<Record<string, string>>(CLAVE_PAGO_VISITAS, {}), [proyectoId]: new Date().toISOString() });
}

export function enviarPresupuestoFinal(id: string, f: { importe: number; capitulos: Record<string, number>; plazoSemanas: number; notas: string }) {
  actualizarEncargo(id, (e) => {
    const tarifa = aplicarTarifa(referencia(e.vivienda, e.reforma), { general: 0, capitulos: f.capitulos });
    return { ...e, estado: "presupuesto_final", firmas: undefined, final: { ...f, fecha: new Date().toISOString(), lineas: cuadrarImporte(tarifa.lineas, f.importe) } };
  });
}

/** Firma del cliente: el resto de presupuestos de ese proyecto quedan descartados. */
export function firmarCliente(id: string) {
  const ahora = new Date().toISOString();
  const e = leerEncargos().find((x) => x.id === id);
  if (!e) return;
  const reserva = reservaEncargo(e, e.final?.importe ?? e.baseInicial);
  if (reserva > 0 && !e.desdeNoHomologado) registrarPago("reserva", reserva, e.id);
  escribir(
    CLAVE_ENCARGOS,
    leerEncargos().map((x) =>
      x.id === id ? { ...x, estado: "firmado_cliente" as const, firmas: { cliente: ahora } } : x.proyectoId === e.proyectoId && x.estado !== "firmado" ? { ...x, estado: "descartado" as const } : x,
    ),
  );
  // Si pagó las visitas y al final firma en la app con un proveedor que trae él, se le devuelven los 150 € (simulado)
  if (e.origen === "invitado" && visitasPagadas(e.proyectoId) && !visitasDevueltas(e.proyectoId)) {
    escribir(CLAVE_DEVOLUCION, { ...leer<Record<string, string>>(CLAVE_DEVOLUCION, {}), [e.proyectoId]: ahora });
    registrarPago("devolucion_visitas", VISITAS.cliente, e.proyectoId);
  }
}

const CLAVE_DEVOLUCION = "app-reformas:devolucion-visitas";
/** Fecha en que se devolvieron al cliente los 150 € de las visitas (firmó con un proveedor que trajo él). */
export const visitasDevueltas = (proyectoId: string) => leer<Record<string, string>>(CLAVE_DEVOLUCION, {})[proyectoId];

export const firmarReformista = (id: string) =>
  actualizarEncargo(id, (e) => ({ ...e, estado: "firmado", firmas: { ...e.firmas, reformista: new Date().toISOString() } }));

const pagosDe = (e: Encargo): EstadoPago[] => e.pagos ?? Array.from({ length: NUM_HITOS }, () => "pendiente" as EstadoPago);
export const solicitarPago = (id: string, i: number) =>
  actualizarEncargo(id, (e) => ({ ...e, pagos: pagosDe(e).map((p, j) => (j === i && p === "pendiente" ? "solicitado" : p)) }));
export const confirmarPago = (id: string, i: number) =>
  actualizarEncargo(id, (e) => ({ ...e, pagos: pagosDe(e).map((p, j) => (j === i ? "pagado" : p)) }));
export const publicarAvance = (id: string, texto: string) =>
  actualizarEncargo(id, (e) => ({ ...e, avances: [{ fecha: new Date().toISOString(), texto }, ...(e.avances ?? [])] }));
export { pagosDe };

// ---------- Invita a tu proveedor ----------

const CLAVE_INVITACIONES = "app-reformas:invitaciones";

export interface Invitacion {
  codigo: string;
  datos: Pick<Encargo, "proyectoId" | "tokenCliente" | "cliente" | "zona" | "vivienda" | "reforma">;
  /** Nombre o empresa del proveedor, tal como lo escribe el cliente */
  proveedor: string;
  creado: string;
  /** Encargo creado cuando el proveedor acepta */
  encargoId?: string;
  /** Si se invitó desde la lista de proveedores sin homologar: su ficha pública */
  publicoId?: string;
}

export const leerInvitaciones = (): Invitacion[] => leer<Invitacion[]>(CLAVE_INVITACIONES, []);
export const invitacionDe = (codigo: string) => leerInvitaciones().find((i) => i.codigo === codigo);

export function invitarProveedor(datos: Invitacion["datos"], proveedor: string, publicoId?: string): Invitacion {
  const inv: Invitacion = { codigo: nuevoId().replace(/-/g, "").slice(0, 10), datos, proveedor, creado: new Date().toISOString(), ...(publicoId && { publicoId }) };
  escribir(CLAVE_INVITACIONES, [inv, ...leerInvitaciones()]);
  return inv;
}

/** Obra de un cliente que ha invitado el propio reformista: sin reserva ni fee. */
export function guardarEncargoInvitado(d: Omit<Encargo, "id" | "creado" | "estado" | "origen">) {
  if (leerEncargos().some((e) => e.proyectoId === d.proyectoId && e.reformistaId === d.reformistaId)) return;
  guardarEncargo({ ...d, id: nuevoId(), creado: new Date().toISOString(), estado: "visita_fijada", origen: "invitado" });
}

/** El proveedor invitado se ha dado de alta: se crea su obra con el cliente, sin reserva ni fee. */
export function aceptarInvitacion(codigo: string, reformista: { id: string; codigo: string }) {
  const inv = invitacionDe(codigo);
  if (!inv || inv.encargoId) return;
  const id = nuevoId();
  guardarEncargo({
    ...inv.datos,
    id,
    reformistaId: reformista.id,
    codigo: reformista.codigo,
    baseInicial: referencia(inv.datos.vivienda, inv.datos.reforma).base,
    creado: new Date().toISOString(),
    estado: "visita_fijada",
    visita: { preferencia: "Te ha invitado el cliente" },
    origen: "invitado",
    ...(inv.publicoId && { desdeNoHomologado: true }),
  });
  escribir(CLAVE_INVITACIONES, leerInvitaciones().map((i) => (i.codigo === codigo ? { ...i, encargoId: id } : i)));
}

export const descartarEncargo = (id: string) => actualizarEncargo(id, (e) => ({ ...e, estado: "descartado" }));

export const ESTADO_ENCARGO: Record<EstadoEncargo, { texto: string; cls: string }> = {
  visita_pedida: { texto: "Visita pedida", cls: "bg-amber-100 text-amber-900" },
  visita_fijada: { texto: "Visita fijada", cls: "bg-sky-100 text-sky-900" },
  presupuesto_final: { texto: "Presupuesto tras la visita", cls: "bg-teal-100 text-teal-900" },
  firmado_cliente: { texto: "Firmado por el cliente", cls: "bg-indigo-100 text-indigo-900" },
  firmado: { texto: "Contrato firmado", cls: "bg-emerald-100 text-emerald-800" },
  descartado: { texto: "Descartado", cls: "bg-stone-200 text-stone-600" },
};

/** Escucha los cambios de encargos y tarifas (también desde otra pestaña). */
export function alCambiar(fn: () => void) {
  window.addEventListener("encargos", fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener("encargos", fn);
    window.removeEventListener("storage", fn);
  };
}

/** Envía un mensaje al chat del encargo ocultando contactos. Devuelve cuántos datos se han ocultado. */
export function enviarMensaje(id: string, de: MensajeChat["de"], texto: string, identidad?: Identidad): number {
  const { texto: limpio, ocultos } = anonimizar(texto, identidad);
  if (!limpio) return 0;
  actualizarEncargo(id, (e) => {
    const intentos = e.intentosContacto ?? { cliente: 0, reformista: 0 };
    return {
      ...e,
      chat: [...(e.chat ?? []), { de, texto: limpio, fecha: new Date().toISOString(), ocultos: ocultos || undefined }],
      intentosContacto: ocultos ? { ...intentos, [de]: intentos[de] + 1 } : e.intentosContacto,
    };
  });
  return ocultos;
}

/** Intentos del reformista de compartir contactos en todos sus chats (restan puntos de visibilidad). */
export const intentosReformista = (reformistaId: string) =>
  leerEncargos().filter((e) => e.reformistaId === reformistaId).reduce((s, e) => s + (e.intentosContacto?.reformista ?? 0), 0);
