import type { FichaRed } from "./red";

/**
 * Puntos de visibilidad de cada reformista (regla del titular de la app, 22/11/2026):
 * - Suben por facturación en la app, por valoración de clientes y por traer clientes (o venir invitado por un cliente).
 * - Cuando un cliente pide presupuestos, la app le propone los 3 reformistas con mejor encaje
 *   por cercanía (zona de trabajo) y puntos de visibilidad.
 * Las obras entre cliente y reformista que se traen el uno al otro no pagan nada (ni visitas ni reserva) y suman puntos.
 */
export const PUNTOS = {
  /** Puntos por cada 1.000 € (sin IVA) facturados en la app */
  porMilFacturado: 1,
  /** Puntos por cada valoración, según la nota: (nota − 3) × 10, solo si es mayor que 3 */
  porValoracion: 10,
  /** Puntos por cada cliente que trae a la app (o que le invita a ella) */
  porClienteTraido: 25,
  /** Puntos que se restan cada vez que intenta compartir datos de contacto en el chat antes de firmar */
  porIntentoContacto: -50,
  /** Peso de la cercanía frente a los puntos */
  zonaExacta: 1000,
  zonaCercana: 400,
  /** Reformistas que se proponen al cliente */
  propuestos: 3,
};

export interface DesglosePuntos {
  facturacion: number;
  valoraciones: number;
  clientes: number;
  penalizacion: number;
  total: number;
}

export function puntosVisibilidad(f: Pick<FichaRed, "facturacionApp" | "valoraciones" | "clientesTraidos"> & { intentosContacto?: number }): DesglosePuntos {
  const facturacion = Math.floor((f.facturacionApp ?? 0) / 1000) * PUNTOS.porMilFacturado;
  const valoraciones = Math.round((f.valoraciones ?? []).reduce((s, v) => s + Math.max(0, v.media - 3) * PUNTOS.porValoracion * v.n, 0));
  const clientes = (f.clientesTraidos ?? 0) * PUNTOS.porClienteTraido;
  const penalizacion = (f.intentosContacto ?? 0) * PUNTOS.porIntentoContacto;
  return { facturacion, valoraciones, clientes, penalizacion, total: Math.max(0, facturacion + valoraciones + clientes + penalizacion) };
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Cercanía: la zona del reformista incluye el municipio de la vivienda (exacta) o la misma provincia/área (cercana). */
export function cercania(f: Pick<FichaRed, "zonas">, municipio: string, codigoPostal = ""): { puntos: number; texto: string } {
  const m = norm(municipio || "Madrid");
  const zonas = f.zonas.map(norm);
  if (zonas.some((z) => z === m || z.startsWith(m + " ") || m.startsWith(z))) return { puntos: PUNTOS.zonaExacta, texto: "Trabaja en tu zona" };
  const area = m.split(/\s+/)[0];
  // Misma provincia: en la demo todas las zonas son de la Comunidad de Madrid (códigos postales 28xxx)
  const mismaProvincia = codigoPostal.startsWith("28") && zonas.length > 0;
  if (mismaProvincia || zonas.some((z) => z.split(/\s+/)[0] === area || z.includes("comunidad de madrid"))) return { puntos: PUNTOS.zonaCercana, texto: "Trabaja cerca" };
  return { puntos: 0, texto: "Fuera de tu zona" };
}

/** Encaje total para ordenar: cercanía + puntos de visibilidad. */
export const encaje = (f: FichaRed & { intentosContacto?: number }, municipio: string, cp = "") => cercania(f, municipio, cp).puntos + puntosVisibilidad(f).total;

/** Los reformistas con mejor encaje para esta vivienda (por defecto, 3). */
export function mejoresPara<T extends { ficha: FichaRed }>(lista: T[], municipio: string, cp = "", n = PUNTOS.propuestos): T[] {
  return [...lista].sort((a, b) => encaje(b.ficha, municipio, cp) - encaje(a.ficha, municipio, cp)).slice(0, n);
}

export const TEXTO_VISIBILIDAD =
  `Cuando un cliente pide presupuestos, la app le propone los ${PUNTOS.propuestos} reformistas con mejor encaje por cercanía y puntos de visibilidad. ` +
  `Los puntos suben con tu facturación en la app (${PUNTOS.porMilFacturado} por cada 1.000 €), con las valoraciones de tus clientes ` +
  `(hasta ${2 * PUNTOS.porValoracion} por valoración de 5 estrellas) y con cada cliente que traes a la app o que te invita (${PUNTOS.porClienteTraido}). ` +
  `Cada intento de compartir teléfono, email o web con un cliente antes de firmar resta ${-PUNTOS.porIntentoContacto}.`;
