import type { TarifaReformista } from "./types";
import { ESPECIALIDADES, ESPECIALIDADES_COMUNIDAD, homologado, type ProveedorBase } from "./proveedores";

/**
 * Escaparate anónimo de la red: lo que ve un cliente suscrito de cada reformista homologado.
 * Sin nombre, NIF ni contactos hasta que el cliente le pide presupuesto y el reformista acepta.
 */
export interface FichaRed {
  id: string;
  codigo: string;
  tipo: "empresa" | "autonomo";
  zonas: string[];
  especialidades: string[];
  trabajadores: number;
  presentacion: string;
  obrasReferencia: number;
  /** Fecha de la última comprobación automática (REA, al corriente de pago, seguro RSC) */
  comprobado: string;
  capitalRC: number;
  /** Valoración media por fase de obra (1 a 5) y número de valoraciones */
  valoraciones?: { fase: string; media: number; n: number }[];
  obrasEnApp: number;
  /** Tarifas que ha cargado, para calcular su presupuesto a cada cliente */
  tarifa?: TarifaReformista;
}

const texto = (e: string) => ESPECIALIDADES.find((x) => x.valor === e)?.texto ?? e;

export function codigo(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `R-${(h % 9000) + 1000}`;
}

export function fichaRed(p: ProveedorBase & { id: string }): FichaRed {
  return {
    id: p.id,
    codigo: codigo(p.id),
    tipo: p.tipo,
    zonas: p.zonas,
    especialidades: p.especialidades.map(texto),
    trabajadores: p.trabajadores,
    presentacion: p.presentacion.slice(0, 400),
    obrasReferencia: p.obras.length,
    comprobado: p.reaVerificado?.fecha ?? p.revisado ?? p.creado,
    capitalRC: p.rc.capital,
    obrasEnApp: 0,
    tarifa: p.tarifa,
  };
}

export const fichasRed = (proveedores: (ProveedorBase & { id: string })[]) => proveedores.filter((p) => homologado(p)).map(fichaRed);

const haceDias = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** Reformistas de ejemplo (ficticios) para que la demo muestre cómo se ve la red. */
export const FICHAS_EJEMPLO: FichaRed[] = [
  {
    id: "ej-r1", codigo: "R-2741", tipo: "empresa", zonas: ["Madrid capital", "Pozuelo"], especialidades: ["Reforma integral", "Pladur y falsos techos", "Climatización y aerotermia"], trabajadores: 14,
    presentacion: "Reformas integrales de pisos con jefe de obra propio. Especialistas en aerotermia y suelo radiante.", obrasReferencia: 3, comprobado: haceDias(3), capitalRC: 600000, obrasEnApp: 12,
    valoraciones: [{ fase: "Demolición", media: 4.8, n: 11 }, { fase: "Instalaciones", media: 4.7, n: 11 }, { fase: "Acabados", media: 4.9, n: 10 }, { fase: "Limpieza y entrega", media: 4.6, n: 10 }],
  },
  {
    id: "ej-r2", codigo: "R-5180", tipo: "empresa", zonas: ["Madrid sur", "Getafe", "Leganés"], especialidades: ["Reforma integral", "Alicatado y solados", "Montaje de cocinas"], trabajadores: 6,
    presentacion: "Baños y cocinas en 3 a 5 semanas. Trabajamos con presupuesto cerrado y plazos por fase.", obrasReferencia: 3, comprobado: haceDias(9), capitalRC: 300000, obrasEnApp: 7,
    valoraciones: [{ fase: "Demolición", media: 4.5, n: 7 }, { fase: "Instalaciones", media: 4.4, n: 7 }, { fase: "Acabados", media: 4.7, n: 6 }],
  },
  {
    id: "ej-r3", codigo: "R-8833", tipo: "autonomo", zonas: ["Madrid norte", "Alcobendas"], especialidades: ["Electricidad", "Fontanería"], trabajadores: 2,
    presentacion: "Instalaciones eléctricas y de fontanería con boletín. Adaptación de cuadros y cambio de bajantes.", obrasReferencia: 2, comprobado: haceDias(15), capitalRC: 150000, obrasEnApp: 3,
    valoraciones: [{ fase: "Instalaciones", media: 4.9, n: 3 }],
  },
];

const TEXTOS_COMUNIDAD = ESPECIALIDADES.filter((e) => (ESPECIALIDADES_COMUNIDAD as readonly string[]).includes(e.valor)).map((e) => e.texto as string);

/** Hace obras en edificios (fachadas, tejados…) para comunidades de propietarios. */
export const paraComunidades = (f: FichaRed) => f.especialidades.some((e) => TEXTOS_COMUNIDAD.includes(e));
/** Solo trabaja en edificios: no sale en la comparativa de reformas de vivienda. */
export const soloComunidades = (f: FichaRed) => f.especialidades.length > 0 && f.especialidades.every((e) => TEXTOS_COMUNIDAD.includes(e));

/** Especialistas de ejemplo (ficticios) en fachadas y tejados para comunidades. */
export const FICHAS_COMUNIDADES: FichaRed[] = [
  {
    id: "ej-c1", codigo: "R-3317", tipo: "empresa", zonas: ["Madrid capital", "Alcorcón", "Móstoles"], especialidades: ["Fachadas y rehabilitación de edificios", "Aislamiento SATE"], trabajadores: 22,
    presentacion: "Rehabilitación de fachadas y SATE en edificios de viviendas. Andamio propio, técnico de obra y gestión de la licencia y la ocupación de vía pública.", obrasReferencia: 3, comprobado: haceDias(4), capitalRC: 1200000, obrasEnApp: 5,
    valoraciones: [{ fase: "Andamio y seguridad", media: 4.8, n: 5 }, { fase: "Ejecución", media: 4.7, n: 5 }, { fase: "Trato con los vecinos", media: 4.9, n: 4 }],
  },
  {
    id: "ej-c2", codigo: "R-6402", tipo: "empresa", zonas: ["Madrid norte", "Alcobendas", "San Sebastián de los Reyes"], especialidades: ["Tejados y cubiertas", "Impermeabilización"], trabajadores: 9,
    presentacion: "Tejados de teja, cubiertas planas e impermeabilización de terrazas y patios. Trabajos verticales sin andamio cuando se puede.", obrasReferencia: 3, comprobado: haceDias(11), capitalRC: 600000, obrasEnApp: 4,
    valoraciones: [{ fase: "Ejecución", media: 4.6, n: 4 }, { fase: "Limpieza y entrega", media: 4.8, n: 4 }],
  },
  {
    id: "ej-c3", codigo: "R-7754", tipo: "empresa", zonas: ["Málaga", "Torremolinos", "Benalmádena"], especialidades: ["Fachadas y rehabilitación de edificios", "Tejados y cubiertas", "Impermeabilización"], trabajadores: 12,
    presentacion: "Equipo en Málaga para fachadas, cubiertas y patios de luces de comunidades. Informe previo y fotos de cada fase para la junta.", obrasReferencia: 3, comprobado: haceDias(6), capitalRC: 600000, obrasEnApp: 2,
    valoraciones: [{ fase: "Ejecución", media: 4.7, n: 2 }],
  },
];
