/**
 * Base de conocimiento de la IA (tablas conocimiento_* en Supabase, ver supabase/migrations).
 * Los documentos viven solo en Supabase (UE), nunca en este repositorio público.
 */

export const TEMAS = [
  { valor: "cte", texto: "Código Técnico (CTE)", publico: true },
  { valor: "normativa_madrid", texto: "Normativa de Madrid", publico: true },
  { valor: "legalizaciones", texto: "Licencias y legalizaciones", publico: true },
  { valor: "tecnica", texto: "Técnica de obra", publico: true },
  { valor: "presupuestos", texto: "Presupuestos y partidas", publico: false },
  { valor: "productos", texto: "Productos y materiales", publico: false },
  { valor: "procesos", texto: "Procesos de la empresa", publico: false },
  { valor: "otros", texto: "Otros", publico: false },
] as const;
export type Tema = (typeof TEMAS)[number]["valor"];

export const TIPOS_OBRA = [
  { valor: "reforma_interior", texto: "Reforma interior" },
  { valor: "rehabilitacion", texto: "Rehabilitación" },
  { valor: "fachadas", texto: "Fachadas" },
  { valor: "cubiertas", texto: "Cubiertas" },
  { valor: "instalaciones", texto: "Instalaciones" },
  { valor: "estructura", texto: "Estructura" },
  { valor: "accesibilidad", texto: "Accesibilidad" },
] as const;
export type TipoObra = (typeof TIPOS_OBRA)[number]["valor"];

export const textoTema = (t: string) => TEMAS.find((x) => x.valor === t)?.texto ?? t;
export const textoTipo = (t: string) => TIPOS_OBRA.find((x) => x.valor === t)?.texto ?? t;

/** Formatos que sabe leer el importador (Edge Function conocimiento-importar). */
export const FORMATOS = ["pdf", "xlsx", "xls", "ods", "csv", "txt", "md"] as const;
export const formatoDe = (nombre: string) => {
  const ext = nombre.split(".").pop()?.toLowerCase() ?? "";
  return (FORMATOS as readonly string[]).includes(ext) ? ext : null;
};

export interface DocumentoConocimiento {
  id: string;
  titulo: string;
  tema: Tema;
  tipos_obra: TipoObra[];
  fuente: string | null;
  url: string | null;
  version: string | null;
  publico: boolean;
  archivo: string | null;
  formato: string | null;
  estado: "procesando" | "listo" | "error";
  paginas: number | null;
  notas: string | null;
  creado: string;
  fragmentos: number;
}

export interface FragmentoEncontrado {
  fragmento: number;
  documento: string;
  titulo: string;
  tema: Tema;
  fuente: string | null;
  url: string | null;
  version: string | null;
  pagina: number | null;
  seccion: string | null;
  texto: string;
  tipos_obra: TipoObra[];
  relevancia: number;
}

/** Enlace a la página exacta del documento original (los visores de PDF entienden #page=N). */
export const enlaceFragmento = (f: Pick<FragmentoEncontrado, "url" | "pagina">) =>
  f.url ? (f.pagina ? `${f.url}#page=${f.pagina}` : f.url) : null;

/** Cómo se cita un fragmento: «DB-HS · HS 3, pág. 12 (Código Técnico de la Edificación…)». */
export const citaFragmento = (f: Pick<FragmentoEncontrado, "titulo" | "seccion" | "pagina">) =>
  [f.seccion || f.titulo, f.pagina ? `pág. ${f.pagina}` : null].filter(Boolean).join(", ");
