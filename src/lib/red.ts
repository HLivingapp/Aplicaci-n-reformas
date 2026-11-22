import type { PerfilProfesional, TarifaReformista } from "./types";
import { anonimizar } from "./anonimizar";
import type { FotoTrabajo } from "./fotos-trabajos";
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
  /** Facturación de obras firmadas en la app (sin IVA), para los puntos de visibilidad */
  facturacionApp?: number;
  /** Clientes que ha traído a la app o que le han invitado (sin reserva ni pago de visitas) */
  clientesTraidos?: number;
  /** Inscrito en el REA (no es obligatorio para todos; el cliente lo ve) */
  rea?: boolean;
  /** Currículum declarado en el alta (sin datos de contacto) */
  perfil?: PerfilProfesional;
  /** Fotos de trabajos de ejemplo (las que sube el reformista se leen aparte) */
  fotos?: FotoTrabajo[];
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
    presentacion: anonimizar(p.presentacion, p).texto.slice(0, 400),
    rea: p.rea.inscrito,
    perfil: p.perfil ? { ...p.perfil, entidadPrevencion: "", otrasCertificaciones: anonimizar(p.perfil.otrasCertificaciones, p).texto, disponibilidad: { ...p.perfil.disponibilidad, visitas: anonimizar(p.perfil.disponibilidad.visitas, p).texto } } : undefined,
    obrasReferencia: p.obras.length,
    comprobado: p.reaVerificado?.fecha ?? p.revisado ?? p.creado,
    capitalRC: p.rc.capital,
    obrasEnApp: 0,
    tarifa: p.tarifa,
  };
}

export const fichasRed = (proveedores: (ProveedorBase & { id: string })[]) => proveedores.filter((p) => homologado(p)).map(fichaRed);

const perfilEj = (n: number, tipos: string[], sp: PerfilProfesional["servicioPrevencion"], cursos: string[], certs: string[], inicio: PerfilProfesional["disponibilidad"]["inicio"], simultaneas: number): PerfilProfesional => ({
  proyectosEjecutados: n, tiposProyecto: tipos, cuentas: { ejercicio: 2025, presentadas: true }, servicioPrevencion: sp, entidadPrevencion: "", cursosPrevencion: cursos,
  certificaciones: certs, otrasCertificaciones: "", disponibilidad: { inicio, obrasSimultaneas: simultaneas, visitas: "Mañanas de lunes a viernes" },
});
/** Demo: fotos de ejemplo (interiores sin dirección reconocible) */
const fotosEj = (nombres: string[]): FotoTrabajo[] => nombres.map((n) => ({ src: `/fotos/obra/${n}.webp`, texto: "" }));

const haceDias = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** Reformistas de ejemplo (ficticios) para que la demo muestre cómo se ve la red. */
export const FICHAS_EJEMPLO: FichaRed[] = [
  {
    id: "ej-r1", codigo: "R-2741", tipo: "empresa", zonas: ["Madrid capital", "Pozuelo"], especialidades: ["Reforma integral", "Pladur y falsos techos", "Climatización y aerotermia"], trabajadores: 14,
    presentacion: "Reformas integrales de pisos con jefe de obra propio. Especialistas en aerotermia y suelo radiante.", obrasReferencia: 3, comprobado: haceDias(3), capitalRC: 600000, obrasEnApp: 12, facturacionApp: 410000, clientesTraidos: 2, rea: true, perfil: perfilEj(140, ["Reforma integral de vivienda", "Baños", "Cocinas", "Instalaciones"], "ajeno", ["PRL 20 h construcción (TPC, oficio)", "PRL 60 h nivel básico", "Recurso preventivo", "Trabajos en altura"], ["Instalador térmico (RITE)", "Gases fluorados", "ISO 9001"], "1-2 meses", 4), fotos: fotosEj(["salon-amplio", "cocina", "bano", "pasillo"]),
    valoraciones: [{ fase: "Demolición", media: 4.8, n: 11 }, { fase: "Instalaciones", media: 4.7, n: 11 }, { fase: "Acabados", media: 4.9, n: 10 }, { fase: "Limpieza y entrega", media: 4.6, n: 10 }],
  },
  {
    id: "ej-r2", codigo: "R-5180", tipo: "empresa", zonas: ["Madrid sur", "Getafe", "Leganés"], especialidades: ["Reforma integral", "Alicatado y solados", "Montaje de cocinas"], trabajadores: 6,
    presentacion: "Baños y cocinas en 3 a 5 semanas. Trabajamos con presupuesto cerrado y plazos por fase.", obrasReferencia: 3, comprobado: haceDias(9), capitalRC: 300000, obrasEnApp: 7, facturacionApp: 165000, clientesTraidos: 4, rea: true, perfil: perfilEj(85, ["Baños", "Cocinas", "Reforma parcial"], "ajeno", ["PRL 20 h construcción (TPC, oficio)", "Primeros auxilios"], [], "2-4 semanas", 3), fotos: fotosEj(["bano-lavabo", "ducha", "cocina-salon"]),
    valoraciones: [{ fase: "Demolición", media: 4.5, n: 7 }, { fase: "Instalaciones", media: 4.4, n: 7 }, { fase: "Acabados", media: 4.7, n: 6 }],
  },
  {
    id: "ej-r3", codigo: "R-8833", tipo: "autonomo", zonas: ["Madrid norte", "Alcobendas"], especialidades: ["Electricidad", "Fontanería"], trabajadores: 2,
    presentacion: "Instalaciones eléctricas y de fontanería con boletín. Adaptación de cuadros y cambio de bajantes.", obrasReferencia: 2, comprobado: haceDias(15), capitalRC: 150000, obrasEnApp: 3, facturacionApp: 24000, clientesTraidos: 1, rea: false, perfil: perfilEj(60, ["Instalaciones"], "asumido", ["PRL 20 h construcción (TPC, oficio)", "Riesgo eléctrico"], ["Instalador eléctrico habilitado (REBT)", "Fontanería (instalador autorizado)"], "inmediata", 2),
    valoraciones: [{ fase: "Instalaciones", media: 4.9, n: 3 }],
  },
  {
    id: "ej-r4", codigo: "R-6402", tipo: "empresa", zonas: ["Madrid capital", "Las Rozas", "Majadahonda"], especialidades: ["Reforma integral", "Carpintería y puertas", "Pintura"], trabajadores: 9,
    presentacion: "Reformas de pisos en el centro de Madrid con equipo propio de albañilería, pintura y carpintería.", obrasReferencia: 3, comprobado: haceDias(5), capitalRC: 450000, obrasEnApp: 5, facturacionApp: 98000, clientesTraidos: 0, rea: true, perfil: perfilEj(55, ["Reforma integral de vivienda", "Reforma parcial", "Locales y oficinas"], "ajeno", ["PRL 20 h construcción (TPC, oficio)", "Andamios"], [], "1-2 meses", 2), fotos: fotosEj(["salon", "vestidor"]),
    valoraciones: [{ fase: "Demolición", media: 4.3, n: 5 }, { fase: "Acabados", media: 4.5, n: 5 }],
  },
  {
    id: "ej-r5", codigo: "R-3915", tipo: "autonomo", zonas: ["Alcalá de Henares", "Torrejón de Ardoz"], especialidades: ["Reforma integral", "Alicatado y solados"], trabajadores: 3,
    presentacion: "Reformas de baño y cocina en el Corredor del Henares.", obrasReferencia: 2, comprobado: haceDias(12), capitalRC: 300000, obrasEnApp: 2, facturacionApp: 31000, clientesTraidos: 1, rea: false, perfil: perfilEj(30, ["Baños", "Cocinas"], "ajeno", ["PRL 20 h construcción (TPC, oficio)"], [], "2-4 semanas", 1),
    valoraciones: [{ fase: "Acabados", media: 4.6, n: 2 }],
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
    presentacion: "Equipo en Málaga para fachadas, cubiertas y patios de luces de comunidades de vecinos. Informe previo y fotos de cada fase para la junta.", obrasReferencia: 3, comprobado: haceDias(6), capitalRC: 600000, obrasEnApp: 2,
    valoraciones: [{ fase: "Ejecución", media: 4.7, n: 2 }],
  },
];
