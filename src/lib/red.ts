import type { TarifaReformista } from "./types";
import { ESPECIALIDADES, homologado, type ProveedorBase } from "./proveedores";

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

function codigo(id: string) {
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
