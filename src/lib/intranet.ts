"use client";

/**
 * Intranet privada de cada obra: se abre cuando el reformista mete el presupuesto acordado
 * tras la visita (contrato listo para firmar) y sigue viva durante toda la obra.
 *
 * - Cada parte entra con su propio enlace privado, sin contraseña: /obra/<clave>.
 *   La clave dice quién eres (cliente o reformista) y es imposible de adivinar (128 bits).
 * - Contrato y firma: el contrato estándar de la app (ContratoEncargo).
 * - Fases de la obra: salen del plan de fases del presupuesto. El reformista las empieza y las
 *   da por terminadas; el cliente las valida o dice qué falta.
 * - En cada fase el reformista sube fotos, certificados y comentarios; el cliente lo ve todo
 *   y también puede comentar y subir fotos.
 * - Pagos: los hitos del contrato. Se pagan fuera de la app, directamente al reformista;
 *   aquí solo se registran y se confirman (el reformista lo pide, el cliente marca que ha pagado
 *   y el reformista confirma que lo ha cobrado).
 *
 * Demostración: todo se guarda en este navegador. Con la base de datos irá a Supabase (región UE)
 * y los archivos a un almacenamiento privado (ver supabase/esquema.sql, tablas obra_*).
 */

import { HITOS } from "@/components/ContratoEncargo";
import { proyectoDemo } from "./demo";
import { planificarFases } from "./fases";
import { nuevoId, nuevoToken } from "./id";
import {
  alCambiar, confirmarPago, enviarPresupuestoFinal, firmarCliente, firmarReformista, leerEncargos, pagosDe, referencia, solicitarPago, type Encargo,
} from "./encargos";

export type Parte = "cliente" | "reformista";
export type EstadoFaseObra = "pendiente" | "en_curso" | "terminada" | "validada";
export type TipoEntrada = "foto" | "certificado" | "comentario";

export interface Archivo {
  id: string;
  nombre: string;
  tipo: string;
  bytes: number;
  /** false si en la demo no cabía en el navegador y solo se guardó el nombre */
  guardado: boolean;
}

export interface EntradaFase {
  id: string;
  tipo: TipoEntrada;
  autor: Parte;
  fecha: string;
  texto: string;
  archivo?: Archivo;
}

export interface FaseObra {
  clave: string;
  nombre: string;
  explicacion: string;
  tareas: string[];
  dias: number;
  estado: EstadoFaseObra;
  empezada?: string;
  terminada?: string;
  validada?: string;
  /** Lo que el cliente pidió repasar la última vez que no validó la fase */
  repaso?: string;
  entradas: EntradaFase[];
  /** Certificados que suelen pedirse en esta fase */
  certificados: string[];
}

export interface RegistroPago {
  solicitado?: string;
  /** El cliente marca que ha pagado */
  pagado?: string;
  /** El reformista confirma que lo ha cobrado */
  cobrado?: string;
  nota?: string;
}

export interface Intranet {
  encargoId: string;
  creada: string;
  accesos: Record<Parte, string>;
  fases: FaseObra[];
  pagos: RegistroPago[];
  /** Avisos para la otra parte (lo último que ha pasado) */
  actividad: { fecha: string; autor: Parte; texto: string }[];
}

/** Certificados y documentos habituales por fase (orientativo; el reformista sube los que apliquen). */
const CERTIFICADOS: Record<string, string[]> = {
  permisos: ["Licencia o declaración responsable municipal", "Seguro de responsabilidad civil en vigor"],
  demolicion: ["Certificado de gestión de residuos (RCD)"],
  instalaciones: ["Boletín eléctrico (certificado de instalación eléctrica)", "Prueba de estanqueidad de fontanería"],
  ventanas: ["Marcado CE y ficha técnica de las ventanas"],
  remates: ["Certificado de instalación térmica (si hay climatización o caldera)"],
  entrega: ["Garantías de equipos y electrodomésticos", "Acta de entrega firmada", "Manual de uso y mantenimiento"],
};

/** Fase cuya validación da paso a cada hito de pago (mismo orden que HITOS). */
const FASES_HITO: (string[] | null)[] = [null, ["instalaciones", "demolicion"], ["carpinteria", "suelo", "alicatado", "pintura"], ["entrega"]];

export const ESTADO_FASE: Record<EstadoFaseObra, { texto: string; cls: string }> = {
  pendiente: { texto: "Pendiente", cls: "bg-stone-100 text-stone-600" },
  en_curso: { texto: "En curso", cls: "bg-sky-100 text-sky-900" },
  terminada: { texto: "Terminada · falta validar", cls: "bg-amber-100 text-amber-900" },
  validada: { texto: "✓ Validada", cls: "bg-emerald-100 text-emerald-800" },
};

// ---------- Almacenamiento (demostración) ----------

const CLAVE = "app-reformas:intranet";
const CLAVE_ARCHIVO = "app-reformas:intranet-archivo:";
const EVENTO = "intranet";

function leerTodas(): Record<string, Intranet> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? "null") ?? {};
  } catch {
    return {};
  }
}
function guardarTodas(v: Record<string, Intranet>) {
  localStorage.setItem(CLAVE, JSON.stringify(v));
  window.dispatchEvent(new Event(EVENTO));
}

export function alCambiarIntranet(fn: () => void) {
  window.addEventListener(EVENTO, fn);
  const quitar = alCambiar(fn);
  return () => {
    window.removeEventListener(EVENTO, fn);
    quitar();
  };
}

/** Fases de la obra a partir del presupuesto acordado. */
function fasesDe(e: Encargo): FaseObra[] {
  const ref = referencia(e.vivienda, e.reforma);
  const est = e.final ? { ...ref, lineas: e.final.lineas } : ref;
  const vistas = new Set<string>();
  return planificarFases(est, e.vivienda, e.reforma).fases
    .filter((f) => f.clave !== "diseno")
    .map((f) => {
      let clave = f.clave;
      for (let i = 2; vistas.has(clave); i++) clave = `${f.clave}-${i}`;
      vistas.add(clave);
      return { clave, nombre: f.nombre, explicacion: f.explicacion, tareas: f.tareas, dias: f.dias, estado: "pendiente" as const, entradas: [], certificados: CERTIFICADOS[f.clave] ?? [] };
    });
}

/** Intranet de un encargo con contrato. La crea la primera vez (con los enlaces de las dos partes). */
export function asegurarIntranet(encargoId: string): Intranet | undefined {
  const todas = leerTodas();
  if (todas[encargoId]) return todas[encargoId];
  const e = leerEncargos().find((x) => x.id === encargoId);
  if (!e?.final) return undefined;
  const i: Intranet = {
    encargoId,
    creada: new Date().toISOString(),
    accesos: { cliente: nuevoToken(), reformista: nuevoToken() },
    fases: fasesDe(e),
    pagos: HITOS.map(() => ({})),
    actividad: [],
  };
  try {
    guardarTodas({ ...todas, [encargoId]: i });
  } catch {
    /* sin almacenamiento */
  }
  return i;
}

/** Busca la obra y la parte a partir de la clave del enlace privado. */
export function abrirConClave(clave: string): { intranet: Intranet; encargo: Encargo; parte: Parte } | null {
  if (!clave || clave.length < 20) return null;
  for (const i of Object.values(leerTodas())) {
    const parte = (Object.keys(i.accesos) as Parte[]).find((p) => i.accesos[p] === clave);
    if (!parte) continue;
    const encargo = leerEncargos().find((x) => x.id === i.encargoId);
    return encargo ? { intranet: i, encargo, parte } : null;
  }
  return null;
}

/** Ruta privada de la intranet para una parte. En la versión estática, not-found la lleva a /obra/_/#/obra/<clave>. */
export function rutaIntranet(encargoId: string, parte: Parte) {
  const i = asegurarIntranet(encargoId);
  if (!i) return null;
  return `/obra/${i.accesos[parte]}`;
}

/** Cambia una obra. Devuelve false si el navegador no tiene sitio (demo). */
function cambiar(encargoId: string, autor: Parte, aviso: string, fn: (i: Intranet) => Intranet): boolean {
  const todas = leerTodas();
  const i = todas[encargoId];
  if (!i) return false;
  const nueva = fn(i);
  nueva.actividad = [{ fecha: new Date().toISOString(), autor, texto: aviso }, ...i.actividad].slice(0, 60);
  try {
    guardarTodas({ ...todas, [encargoId]: nueva });
    return true;
  } catch {
    return false;
  }
}

const enFase = (i: Intranet, clave: string, fn: (f: FaseObra) => FaseObra): Intranet => ({ ...i, fases: i.fases.map((f) => (f.clave === clave ? fn(f) : f)) });
const ahora = () => new Date().toISOString();

// ---------- Fases ----------

export const empezarFase = (id: string, clave: string, nombre: string) =>
  cambiar(id, "reformista", `Empieza la fase «${nombre}»`, (i) => enFase(i, clave, (f) => ({ ...f, estado: "en_curso", empezada: f.empezada ?? ahora() })));

export const terminarFase = (id: string, clave: string, nombre: string) =>
  cambiar(id, "reformista", `Fase «${nombre}» terminada: falta que la valide el cliente`, (i) => enFase(i, clave, (f) => ({ ...f, estado: "terminada", terminada: ahora(), empezada: f.empezada ?? ahora() })));

export const validarFase = (id: string, clave: string, nombre: string) =>
  cambiar(id, "cliente", `El cliente valida la fase «${nombre}»`, (i) => enFase(i, clave, (f) => ({ ...f, estado: "validada", validada: ahora(), repaso: undefined })));

/** El cliente no valida todavía: la fase vuelve a «en curso» con lo que hay que repasar. */
export const pedirRepaso = (id: string, clave: string, nombre: string, texto: string) =>
  cambiar(id, "cliente", `El cliente pide repasar la fase «${nombre}»`, (i) =>
    enFase(i, clave, (f) => ({ ...f, estado: "en_curso", repaso: texto, entradas: [...f.entradas, { id: nuevoId(), tipo: "comentario", autor: "cliente", fecha: ahora(), texto: `Para validar falta: ${texto}` }] })),
  );

/** Hito de pago que se desbloquea al validar esta fase (índice en HITOS), o null. */
export function hitoDeFase(i: Intranet, clave: string): number | null {
  for (let h = 1; h < FASES_HITO.length; h++) {
    const candidatas = FASES_HITO[h]!;
    const ultima = [...i.fases].reverse().find((f) => candidatas.some((c) => f.clave === c || f.clave.startsWith(`${c}-`)));
    if (ultima?.clave === clave) return h;
  }
  return null;
}

/** Fase que hay que validar para poder pedir este hito. */
export const faseDeHito = (i: Intranet, h: number) => i.fases.find((f) => hitoDeFase(i, f.clave) === h);

/** ¿Se puede pedir ya este hito? El primero, al firmar; el resto, al validar su fase. */
export function hitoListo(i: Intranet, e: Encargo, h: number) {
  if (e.estado !== "firmado") return false;
  if (h === 0) return true;
  const fase = faseDeHito(i, h);
  return fase ? fase.estado === "validada" : i.fases.every((f) => f.estado === "validada");
}

// ---------- Fotos, certificados y comentarios ----------

/** Límite de un archivo en la demo (el navegador guarda unos 5 MB en total). */
export const MAX_ARCHIVO_DEMO = 900 * 1024;

export function anadirEntrada(id: string, clave: string, nombreFase: string, autor: Parte, tipo: TipoEntrada, texto: string, archivo?: { nombre: string; tipo: string; datos: string; bytes: number }): boolean {
  let adj: Archivo | undefined;
  if (archivo) {
    adj = { id: nuevoId(), nombre: archivo.nombre, tipo: archivo.tipo, bytes: archivo.bytes, guardado: false };
    if (archivo.datos.length <= MAX_ARCHIVO_DEMO * 1.4) {
      try {
        localStorage.setItem(CLAVE_ARCHIVO + adj.id, archivo.datos);
        adj.guardado = true;
      } catch {
        /* no cabe: se guarda solo el nombre */
      }
    }
  }
  const quien = autor === "cliente" ? "El cliente" : "El reformista";
  const que = tipo === "foto" ? "sube una foto" : tipo === "certificado" ? `sube «${archivo?.nombre ?? texto}»` : "comenta";
  return cambiar(id, autor, `${quien} ${que} en «${nombreFase}»`, (i) =>
    enFase(i, clave, (f) => ({ ...f, entradas: [...f.entradas, { id: nuevoId(), tipo, autor, fecha: ahora(), texto, ...(adj && { archivo: adj }) }] })),
  );
}

export function datosArchivo(a: Archivo): string | null {
  try {
    return a.guardado ? localStorage.getItem(CLAVE_ARCHIVO + a.id) : null;
  } catch {
    return null;
  }
}

// ---------- Pagos (fuera de la app: aquí solo se registran) ----------

function marcarPago(id: string, autor: Parte, h: number, aviso: string, cambio: Partial<RegistroPago>) {
  return cambiar(id, autor, aviso, (i) => ({ ...i, pagos: HITOS.map((_, j) => (j === h ? { ...(i.pagos[j] ?? {}), ...cambio } : (i.pagos[j] ?? {}))) }));
}

export function pedirPago(id: string, h: number) {
  solicitarPago(id, h);
  return marcarPago(id, "reformista", h, `El reformista pide el pago «${HITOS[h].texto}»`, { solicitado: ahora() });
}
export function marcarPagado(id: string, h: number, nota: string) {
  confirmarPago(id, h);
  return marcarPago(id, "cliente", h, `El cliente indica que ha pagado «${HITOS[h].texto}»`, { pagado: ahora(), ...(nota && { nota }) });
}
export const confirmarCobro = (id: string, h: number) => marcarPago(id, "reformista", h, `El reformista confirma el cobro de «${HITOS[h].texto}»`, { cobrado: ahora() });

export { pagosDe };

// ---------- Obra de ejemplo para probar la demo ----------

/** Crea una obra ficticia ya firmada, con algunas fases hechas, y devuelve el enlace del cliente o del reformista. */
export function crearObraEjemplo(parte: Parte): string | null {
  const existente = leerEncargos().find((e) => e.proyectoId === "pr-intranet-demo");
  let id = existente?.id;
  if (!id) {
    const p = proyectoDemo("cl-intranet-demo", new Date().toISOString().slice(0, 10));
    id = nuevoId();
    const e: Encargo = {
      id,
      reformistaId: "ej-r2",
      codigo: "R-204",
      proyectoId: "pr-intranet-demo",
      tokenCliente: "demo",
      cliente: "Cliente de ejemplo",
      zona: "Getafe",
      vivienda: p.vivienda,
      reforma: p.reforma,
      baseInicial: referencia(p.vivienda, p.reforma).base,
      creado: ahora(),
      estado: "visita_fijada",
      visita: { preferencia: "Tardes", fecha: ahora() },
      origen: "app",
    };
    try {
      localStorage.setItem("app-reformas:encargos", JSON.stringify([e, ...leerEncargos()]));
    } catch {
      return null;
    }
    const base = referencia(p.vivienda, p.reforma).base;
    enviarPresupuestoFinal(id, { importe: Math.round(base / 100) * 100, capitulos: {}, plazoSemanas: 10, notas: "" });
    firmarCliente(id);
    firmarReformista(id);
    const i = asegurarIntranet(id);
    if (i) {
      const [f1, f2, f3] = i.fases;
      if (f1) {
        empezarFase(id, f1.clave, f1.nombre);
        anadirEntrada(id, f1.clave, f1.nombre, "reformista", "comentario", "Solicitada la declaración responsable en el ayuntamiento. Pedidos de ventanas y cocina hechos.");
        terminarFase(id, f1.clave, f1.nombre);
        validarFase(id, f1.clave, f1.nombre);
      }
      if (f2) {
        empezarFase(id, f2.clave, f2.nombre);
        anadirEntrada(id, f2.clave, f2.nombre, "reformista", "comentario", "Protegidas zonas comunes y ascensor. Demolición de cocina y baño terminada; mañana empezamos tabiques.");
        terminarFase(id, f2.clave, f2.nombre);
      }
      if (f3) empezarFase(id, f3.clave, f3.nombre);
      pedirPago(id, 0);
      marcarPagado(id, 0, "Transferencia");
      confirmarCobro(id, 0);
    }
  }
  return rutaIntranet(id, parte);
}

/** Intranet de un encargo, si ya existe. */
export const intranetDe = (encargoId: string) => leerTodas()[encargoId];

/** Resumen para la cabecera: avance por fases y pagos. */
export function resumen(i: Intranet, e: Encargo) {
  const validadas = i.fases.filter((f) => f.estado === "validada").length;
  const enCurso = i.fases.find((f) => f.estado === "en_curso" || f.estado === "terminada");
  const pagos = pagosDe(e);
  return { validadas, total: i.fases.length, pct: i.fases.length ? Math.round((validadas / i.fases.length) * 100) : 0, enCurso, pagosPagados: pagos.filter((p) => p === "pagado").length };
}

