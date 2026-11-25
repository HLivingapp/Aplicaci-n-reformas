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
 * 3. Gratis, el cliente ve cuántos hay en su zona y el presupuesto medio. Con el acceso único (29,90 €) ve cada ficha,
 *    sus tarifas y su presupuesto, chatea y pide cita. Al reformista le llega aviso por email y WhatsApp.
 * 4. El reformista acepta la cita presencial y paga 150 € (venda o no). Después marca si vendió (estadísticas).
 * 5. Opcional: tras la visita mete la cifra acordada y la app genera un contrato estándar que pueden firmar.
 *    La app no cobra nada sobre la obra.
 *
 * Demostración: todo se guarda en este navegador. Con la base de datos irá a Supabase.
 */

export const IVA_REFORMA = 10;

import { COBRO, type MetodoPago } from "./comercializacion";
import { anonimizar, type Identidad } from "./anonimizar";
export * from "./comercializacion";

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
  /** pagoReformista: fecha en que el reformista aceptó la cita y pagó los 150 € (simulado en la demo); conCredito: la pagó con un crédito por cliente que no se presentó */
  visita: { preferencia: string; fecha?: string; nota?: string; pagoReformista?: string; conCredito?: boolean };
  /** El reformista marca que el cliente no se presentó. Si el cliente no lo desmiente en 48 h, el reformista recibe un crédito de una cita y el cliente pierde su acceso. */
  noPresento?: { fecha: string; desmentido?: string };
  /** El cliente marca que el reformista no vino. Si no lo desmiente en 48 h, es una falta del reformista. */
  reformistaNoVino?: { fecha: string; desmentido?: string };
  /** Cancelaciones avisadas, con motivo (sin penalización) */
  cancelaCliente?: { fecha: string; motivo: string };
  cancelaReformista?: { fecha: string; motivo: string };
  final?: { importe: number; capitulos: Record<string, number>; plazoSemanas: number; notas: string; fecha: string; lineas: LineaEstimacion[] };
  firmas?: { cliente?: string; reformista?: string };
  /** Estado de cada hito de pago del contrato (mismo orden que HITOS) */
  pagos?: EstadoPago[];
  /** Avances de obra que publica el reformista y ve el cliente */
  avances?: { fecha: string; texto: string }[];
  /** «app»: el cliente lo encontró en la app (cita de 150 € al aceptarla). «invitado»: el cliente lo invitó (sin coste). */
  origen?: OrigenEncargo;
  /** Invitado desde la lista de proveedores sin homologar: en esta primera obra nadie paga nada: ni acceso ni cita. Después entra en la red con las reglas normales. */
  desdeNoHomologado?: boolean;
  /** Chat antes de la firma (para preparar la primera visita). Los contactos se ocultan automáticamente. */
  chat?: MensajeChat[];
  /** Aviso al reformista de la nueva solicitud (email y WhatsApp; simulado en la demo) */
  aviso?: { email: string; whatsapp: string };
  /** Resultado que marca el reformista tras la cita: si vendió (y por cuánto, sin IVA) o no */
  resultado?: { vendido: boolean; importe?: number; fecha: string };
  /** Veces que cada parte intentó compartir datos de contacto en el chat */
  intentosContacto?: { cliente: number; reformista: number };
}

export interface MensajeChat { de: "cliente" | "reformista"; texto: string; fecha: string; ocultos?: number }

export type OrigenEncargo = "app" | "invitado";
export const ORIGEN_ENCARGO: Record<OrigenEncargo, { texto: string; cls: string }> = {
  app: { texto: "Cliente de la app", cls: "bg-teal-50 text-teal-800 ring-1 ring-teal-200" },
  invitado: { texto: "Cliente tuyo (te invitó)", cls: "bg-violet-50 text-violet-800 ring-1 ring-violet-200" },
};
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
      aviso: { email: new Date().toISOString(), whatsapp: new Date().toISOString() },
    });
  }
}

export function actualizarEncargo(id: string, cambio: (e: Encargo) => Encargo) {
  const e = leerEncargos().find((x) => x.id === id);
  if (e) guardarEncargo(cambio(e));
}

/** El reformista acepta la cita presencial y paga los 150 € (simulado en la demo), o gasta un crédito si tiene. */
export const fijarVisita = (id: string, fecha: string, nota: string) => {
  const e = leerEncargos().find((x) => x.id === id);
  const paga = !!e && !e.visita.pagoReformista && !e.desdeNoHomologado && e.origen !== "invitado";
  const conCredito = paga && creditosCita(e.reformistaId) > 0;
  if (paga && !conCredito) registrarPago("cita_proveedor", COBRO.citaProveedor, id);
  actualizarEncargo(id, (e) => ({ ...e, estado: "visita_fijada", visita: { ...e.visita, fecha, nota, pagoReformista: e.visita.pagoReformista ?? new Date().toISOString(), ...(conCredito && { conCredito: true }) } }));
};

// ---------- Faltas a la cita (reglas del titular, 25/11/2026) ----------
// Cliente que no va y no avisa: pierde el acceso y tiene que volver a pagar la cuota para pedir citas. El reformista recupera la cita como crédito.
// Reformista que no va y no avisa: pierde los 150 € (sin crédito), aviso en su ficha durante 90 días y resta puntos;
// con 2 faltas en 90 días, 30 días sin recibir clientes nuevos.
// Quien avisa con antelación y da el motivo no tiene penalización.
export const HORAS_DESMENTIR = 48;
export const FALTAS = { diasAviso: 90, faltasSuspension: 2, diasSuspension: 30 };
export const REGLA_FALTA_CLIENTE = `Si no vas a la cita y no avisas antes con el motivo, perderás tu acceso y tendrás que volver a pagar la cuota para pedir más citas.`;
export const REGLA_FALTA_REFORMISTA = `Si no vas a la cita y no avisas antes al cliente con el motivo, pierdes los 150 € sin crédito, sale un aviso en tu ficha durante ${FALTAS.diasAviso} días y restas puntos. Con ${FALTAS.faltasSuspension} faltas en ${FALTAS.diasAviso} días, ${FALTAS.diasSuspension} días sin recibir clientes nuevos.`;
const pasado = (iso: string, horas: number) => Date.now() - new Date(iso).getTime() >= horas * 36e5;
type Marca = { fecha: string; desmentido?: string } | undefined;
const estadoMarca = (m: Marca): "pendiente" | "confirmada" | "desmentido" | null => (!m ? null : m.desmentido ? "desmentido" : pasado(m.fecha, HORAS_DESMENTIR) ? "confirmada" : "pendiente");

/** El reformista marca que el cliente no se presentó a la cita. */
export const marcarNoPresento = (id: string) => actualizarEncargo(id, (e) => ({ ...e, noPresento: { fecha: new Date().toISOString() }, resultado: undefined }));
/** El cliente desmiente que no se presentó (dentro de las 48 h). */
export const desmentirNoPresento = (id: string) => actualizarEncargo(id, (e) => (e.noPresento ? { ...e, noPresento: { ...e.noPresento, desmentido: new Date().toISOString() } } : e));
/** Estado del aviso de «no se presentó»: pendiente (dentro de plazo), crédito concedido o desmentido. */
export const estadoNoPresento = (e: Pick<Encargo, "noPresento">): "pendiente" | "credito" | "desmentido" | null => {
  const m = estadoMarca(e.noPresento);
  return m === "confirmada" ? "credito" : m;
};
/** El cliente marca que el reformista no vino; el reformista puede desmentirlo en 48 h. */
export const marcarReformistaNoVino = (id: string) => actualizarEncargo(id, (e) => ({ ...e, reformistaNoVino: { fecha: new Date().toISOString() } }));
export const desmentirReformistaNoVino = (id: string) =>
  actualizarEncargo(id, (e) => (e.reformistaNoVino ? { ...e, reformistaNoVino: { ...e.reformistaNoVino, desmentido: new Date().toISOString() } } : e));
export const estadoReformistaNoVino = (e: Pick<Encargo, "reformistaNoVino">) => estadoMarca(e.reformistaNoVino);

/** Cancelación avisada por el cliente: sin penalización; el reformista recupera la cita como crédito. */
export const cancelarCitaCliente = (id: string, motivo: string) =>
  actualizarEncargo(id, (e) => ({ ...e, estado: "descartado", cancelaCliente: { fecha: new Date().toISOString(), motivo } }));
/** Cancelación avisada por el reformista: sin penalización; vuelve a quedar pendiente de fijar otra fecha (sin volver a pagar). */
export const cancelarCitaReformista = (id: string, motivo: string) =>
  actualizarEncargo(id, (e) => ({ ...e, estado: "visita_pedida", visita: { ...e.visita, fecha: undefined }, cancelaReformista: { fecha: new Date().toISOString(), motivo } }));

/** Citas que el reformista puede aceptar sin pagar: créditos por clientes que no se presentaron o cancelaron, menos los ya usados. */
export const creditosCita = (reformistaId: string) => {
  const suyos = leerEncargos().filter((e) => e.reformistaId === reformistaId);
  const ganados = suyos.filter((e) => e.visita.pagoReformista && !e.visita.conCredito && (estadoNoPresento(e) === "credito" || e.cancelaCliente)).length;
  return Math.max(0, ganados - suyos.filter((e) => e.visita.conCredito).length);
};

/** Faltas sin avisar del reformista en los últimos 90 días (confirmadas) y si está suspendido. */
export function faltasReformista(reformistaId: string) {
  const desde = Date.now() - FALTAS.diasAviso * 864e5;
  const faltas = leerEncargos()
    .filter((e) => e.reformistaId === reformistaId && estadoReformistaNoVino(e) === "confirmada" && new Date(e.reformistaNoVino!.fecha).getTime() >= desde)
    .map((e) => new Date(e.reformistaNoVino!.fecha).getTime())
    .sort((a, b) => a - b);
  const finSuspension = faltas.length >= FALTAS.faltasSuspension ? faltas[FALTAS.faltasSuspension - 1] + HORAS_DESMENTIR * 36e5 + FALTAS.diasSuspension * 864e5 : 0;
  return { faltas: faltas.length, suspendidoHasta: finSuspension > Date.now() ? new Date(finSuspension).toISOString() : undefined };
}

/** El cliente faltó sin avisar después de pagar el acceso: tiene que volver a pagar. */
export function clientePenalizado(desdeIso?: string) {
  if (!desdeIso) return false;
  const desde = new Date(desdeIso).getTime();
  return leerEncargos().some((e) => estadoNoPresento(e) === "credito" && new Date(e.noPresento!.fecha).getTime() >= desde);
}

const CLAVE_ACCESO = "app-reformas:acceso-cliente";
export interface AccesoCliente { fecha: string; metodo: MetodoPago; importe: number; devuelto?: string }
/** Acceso del cliente a la red (pago único de 29,90 €, o 19,90 € con suscripción), o undefined. Sin acceso si se le devolvió por la garantía o si faltó a una cita sin avisar. */
export const accesoPagado = () => {
  const a = leer<AccesoCliente | null>(CLAVE_ACCESO, null);
  return a && !a.devuelto && !clientePenalizado(a.fecha) ? a : undefined;
};
/** El cliente perdió su acceso por faltar a una cita sin avisar. */
export const accesoPerdidoPorFalta = () => {
  const a = leer<AccesoCliente | null>(CLAVE_ACCESO, null);
  return !!a && !a.devuelto && clientePenalizado(a.fecha);
};
/** Pago simulado del acceso del cliente (tarjeta o Bizum). */
export function pagarAcceso(metodo: MetodoPago, importe: number) {
  if (accesoPagado()) return;
  registrarPago("acceso_cliente", importe, metodo);
  escribir(CLAVE_ACCESO, { fecha: new Date().toISOString(), metodo, importe });
}

/**
 * Garantía de al menos una cita: si en 30 días desde el pago ningún proveedor ha aceptado una cita con el cliente,
 * se le devuelve la cuota (simulado en la demo; en real, devolución automática por la pasarela).
 */
export function garantiaAcceso(): { estado: "en_plazo"; dias: number } | { estado: "cumplida" } | { estado: "devuelta"; importe: number } | null {
  const a = leer<AccesoCliente | null>(CLAVE_ACCESO, null);
  if (!a) return null;
  if (a.devuelto) return { estado: "devuelta", importe: a.importe };
  if (clientePenalizado(a.fecha)) return null;
  const desde = new Date(a.fecha).getTime();
  if (leerEncargos().some((e) => e.origen !== "invitado" && citaAceptada(e) && new Date(e.visita.pagoReformista ?? e.creado).getTime() >= desde)) return { estado: "cumplida" };
  const dias = COBRO.diasGarantia - Math.floor((Date.now() - desde) / 864e5);
  if (dias > 0) return { estado: "en_plazo", dias };
  registrarPago("devolucion_acceso", a.importe, a.metodo);
  escribir(CLAVE_ACCESO, { ...a, devuelto: new Date().toISOString() });
  return { estado: "devuelta", importe: a.importe };
}

/** ¿Se vendió la obra? Lo marca el reformista tras la cita, o se da por hecho si firmaron el contrato en la app. */
export const vendido = (e: Encargo) => (e.resultado ? e.resultado.vendido : e.estado === "firmado" || e.estado === "firmado_cliente");
export const importeVendido = (e: Encargo) => (vendido(e) ? (e.resultado?.importe ?? e.final?.importe ?? e.baseInicial) : 0);

/** Estadísticas de venta del reformista con los clientes que le llegan por la app. */
export function estadisticasVenta(encargos: Encargo[]) {
  const app = encargos.filter((e) => e.origen !== "invitado");
  const conMensajeCliente = app.filter((e) => e.chat?.some((m) => m.de === "cliente"));
  const respondidas = conMensajeCliente.filter((e) => e.chat?.some((m) => m.de === "reformista"));
  // Primera respuesta del reformista desde que llegó la solicitud
  const horas = app
    .map((e) => e.chat?.find((m) => m.de === "reformista"))
    .map((m, i) => (m ? (new Date(m.fecha).getTime() - new Date(app[i].creado).getTime()) / 36e5 : null))
    .filter((h): h is number => h !== null && h >= 0);
  const aceptadas = app.filter((e) => e.visita.pagoReformista && !e.desdeNoHomologado);
  const noShow = aceptadas.filter((e) => estadoNoPresento(e) === "credito" || estadoNoPresento(e) === "pendiente");
  // Citas que sí se hicieron (las de clientes que no se presentaron no cuentan para el % vendido)
  const citas = aceptadas.filter((e) => !noShow.includes(e));
  const ventas = citas.filter(vendido);
  const pendientes = citas.filter((e) => !e.resultado && !vendido(e));
  const gastado = Math.max(0, aceptadas.filter((e) => !e.visita.conCredito).length - noShow.filter((e) => estadoNoPresento(e) === "credito").length) * COBRO.citaProveedor;
  const facturado = ventas.reduce((t, e) => t + importeVendido(e), 0);
  return {
    solicitudes: app.length,
    respuestaChat: conMensajeCliente.length ? Math.round((respondidas.length / conMensajeCliente.length) * 100) : null,
    horasRespuesta: horas.length ? horas.reduce((a, b) => a + b, 0) / horas.length : null,
    citas: citas.length,
    noShow: noShow.length,
    faltas: app.filter((e) => estadoReformistaNoVino(e) === "confirmada").length,
    aceptacion: app.length ? Math.round((aceptadas.length / app.length) * 100) : null,
    ventas: ventas.length,
    pctVendido: citas.length ? Math.round((ventas.length / citas.length) * 100) : null,
    pendientes: pendientes.length,
    gastado,
    costePorVenta: ventas.length ? gastado / ventas.length : null,
    facturado,
    retorno: gastado ? facturado / gastado : null,
  };
}

/** El reformista marca si vendió tras la cita (para sus estadísticas). */
export const marcarResultado = (id: string, vendido: boolean, importe?: number) =>
  actualizarEncargo(id, (e) => ({ ...e, resultado: { vendido, ...(vendido && importe ? { importe } : {}), fecha: new Date().toISOString() } }));

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
  escribir(
    CLAVE_ENCARGOS,
    leerEncargos().map((x) =>
      x.id === id ? { ...x, estado: "firmado_cliente" as const, firmas: { cliente: ahora } } : x.proyectoId === e.proyectoId && x.estado !== "firmado" ? { ...x, estado: "descartado" as const } : x,
    ),
  );
}

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
  visita_pedida: { texto: "Cita pedida", cls: "bg-amber-100 text-amber-900" },
  visita_fijada: { texto: "Cita aceptada", cls: "bg-sky-100 text-sky-900" },
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
/** Cita presencial aceptada (y pagada) por el reformista: a partir de aquí ya pueden compartir contactos. */
export const citaAceptada = (e: Pick<Encargo, "visita" | "estado">) => !!e.visita.pagoReformista || (e.estado !== "visita_pedida" && e.estado !== "descartado");

export function enviarMensaje(id: string, de: MensajeChat["de"], texto: string, identidad?: Identidad): number {
  const e0 = leerEncargos().find((x) => x.id === id);
  const { texto: limpio, ocultos } = e0 && citaAceptada(e0) ? { texto: texto.trim(), ocultos: 0 } : anonimizar(texto, identidad);
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
