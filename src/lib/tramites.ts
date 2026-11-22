/**
 * Orientador de trámite urbanístico para reformas de vivienda en la ciudad de Madrid.
 * Las reglas marcadas como «confirmadas» las ha dado el equipo; las «orientativas» están pendientes de revisión.
 * Siempre es una orientación: el técnico confirma el trámite con el proyecto real.
 */

export type NivelTramite = 0 | 1 | 2 | 3;

export const NIVELES: Record<NivelTramite, { corto: string; titulo: string; explica: string; icono: string; cls: string; borde: string }> = {
  0: {
    corto: "Sin trámite",
    titulo: "Sin trámite urbanístico",
    explica: "Puedes hacer la obra sin pedir nada al Ayuntamiento. Avisa a la comunidad de vecinos de las fechas y el horario de ruido.",
    icono: "✅",
    cls: "bg-emerald-600 text-white",
    borde: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
  1: {
    corto: "Declaración responsable",
    titulo: "Declaración responsable (DR)",
    explica: "La presentas en el Ayuntamiento con la documentación técnica y puedes empezar la obra en cuanto la registras, sin esperar respuesta.",
    icono: "📝",
    cls: "bg-sky-600 text-white",
    borde: "border-sky-300 bg-sky-50 text-sky-900",
  },
  2: {
    corto: "Licencia básica",
    titulo: "Licencia urbanística básica",
    explica: "Hay que pedir licencia y esperar a que el Ayuntamiento la conceda antes de empezar. Suele hacer falta el acuerdo de la comunidad de vecinos.",
    icono: "📋",
    cls: "bg-amber-500 text-stone-950",
    borde: "border-amber-300 bg-amber-50 text-amber-950",
  },
  3: {
    corto: "Proyecto y licencia",
    titulo: "Proyecto técnico y licencia",
    explica: "Un arquitecto o aparejador redacta un proyecto firmado y se pide licencia antes de empezar. Es el trámite más largo.",
    icono: "🏗️",
    cls: "bg-rose-600 text-white",
    borde: "border-rose-300 bg-rose-50 text-rose-900",
  },
};

export interface ObraTramite {
  id: string;
  icono: string;
  texto: string;
  /** Trámite que exige esta obra */
  nivel: NivelTramite;
  /** Trámite si el edificio está protegido (si es distinto) */
  nivelProtegido?: NivelTramite;
  /** Explicación corta del porqué */
  porque: string;
  /** false = orientativo, pendiente de confirmar por el equipo */
  confirmada: boolean;
  /** Necesita acuerdo de la comunidad de vecinos */
  comunidad?: boolean;
  /** Trámite adicional que no cambia el nivel (p. ej., ocupación de vía pública) */
  extra?: string;
}

export const OBRAS: ObraTramite[] = [
  { id: "tabiques", icono: "🧱", texto: "Cambio tabiques de sitio", nivel: 1, nivelProtegido: 2, porque: "Cambiar la distribución interior se tramita con declaración responsable.", confirmada: true },
  { id: "carga", icono: "🏚️", texto: "Abro o quito un muro de carga", nivel: 3, porque: "Afecta a la estructura del edificio: hace falta proyecto técnico firmado y licencia.", confirmada: true, comunidad: true },
  { id: "aire", icono: "❄️", texto: "Pongo aire acondicionado en la fachada", nivel: 2, porque: "La máquina exterior en fachada cambia el aspecto exterior del edificio: licencia básica.", confirmada: true, comunidad: true },
  { id: "ventanas", icono: "🪟", texto: "Cambio las ventanas", nivel: 1, nivelProtegido: 2, porque: "Si el edificio no está protegido, declaración responsable. Si está protegido, licencia y el mismo modelo y color que exija la protección.", confirmada: true },
  { id: "terraza", icono: "🌇", texto: "Cierro la terraza o cambio su cerramiento", nivel: 2, porque: "Cambia la fachada: licencia básica, y el cierre debe seguir el modelo aprobado por la comunidad si lo hay.", confirmada: true, comunidad: true },
  { id: "puerta", icono: "🚪", texto: "Cambio la puerta de entrada", nivel: 0, porque: "Cambiar la puerta de la vivienda no necesita trámite. Si da al rellano, respeta el aspecto que marque la comunidad.", confirmada: true },
  { id: "instalaciones", icono: "🔌", texto: "Renuevo electricidad o fontanería sin tocar tabiques ni techos", nivel: 0, porque: "Renovar instalaciones sin cambiar tabiques ni techos no necesita trámite urbanístico. La electricidad sí necesita boletín del instalador.", confirmada: true },
  { id: "acabados", icono: "🎨", texto: "Cambio suelos, alicatados o pinto", nivel: 0, porque: "Cambiar acabados sin tocar la distribución se considera obra menor sin trámite.", confirmada: false },
  { id: "bano-cocina", icono: "🚿", texto: "Cambio de sitio la cocina o el baño", nivel: 1, nivelProtegido: 2, porque: "Suele implicar mover tabiques y llevar desagües a otra zona: declaración responsable. Comprueba que la bajante llega.", confirmada: false },
  { id: "techos", icono: "⬇️", texto: "Bajo techos o pongo falso techo", nivel: 1, porque: "Modificar techos en una reforma interior se tramita normalmente con declaración responsable.", confirmada: false },
  { id: "huecos", icono: "🪟", texto: "Abro o agrando un hueco en la fachada", nivel: 3, porque: "Tocar la fachada y su estructura necesita proyecto técnico y licencia, además del acuerdo de la comunidad.", confirmada: false, comunidad: true },
  { id: "unir", icono: "🔀", texto: "Uno dos pisos o divido uno en dos", nivel: 3, porque: "Cambia el número de viviendas del edificio: proyecto técnico, licencia y acuerdo de la comunidad.", confirmada: false, comunidad: true },
  { id: "uso", icono: "🏪", texto: "Paso un local a vivienda", nivel: 3, porque: "Un cambio de uso necesita proyecto técnico y licencia, y cumplir las condiciones de vivienda (luz, ventilación, superficie).", confirmada: false, comunidad: true },
  { id: "via", icono: "🚛", texto: "Pondré contenedor o andamio en la calle", nivel: 0, porque: "No cambia el trámite de la obra, pero necesitas autorización para ocupar la vía pública.", confirmada: false, extra: "Autorización de ocupación de la vía pública (contenedor o andamio)" },
];

export type Proteccion = "no" | "si" | "nose";

export interface ResultadoTramite {
  nivel: NivelTramite;
  /** Obras que fijan el trámite (las más exigentes) */
  decisivas: ObraTramite[];
  detalle: { obra: ObraTramite; nivel: NivelTramite }[];
  comunidad: boolean;
  extras: string[];
  hayOrientativas: boolean;
}

export function nivelDe(o: ObraTramite, proteccion: Proteccion): NivelTramite {
  return proteccion === "si" && o.nivelProtegido !== undefined ? o.nivelProtegido : o.nivel;
}

/** El trámite de la reforma es el más exigente de todas las obras elegidas. */
export function calcularTramite(ids: string[], proteccion: Proteccion): ResultadoTramite {
  const obras = OBRAS.filter((o) => ids.includes(o.id));
  const detalle = obras.map((obra) => ({ obra, nivel: nivelDe(obra, proteccion) }));
  const nivel = detalle.reduce<NivelTramite>((m, d) => (d.nivel > m ? d.nivel : m), 0);
  return {
    nivel,
    decisivas: detalle.filter((d) => d.nivel === nivel && nivel > 0).map((d) => d.obra),
    detalle: detalle.sort((a, b) => b.nivel - a.nivel),
    comunidad: obras.some((o) => o.comunidad),
    extras: obras.flatMap((o) => (o.extra ? [o.extra] : [])),
    hayOrientativas: obras.some((o) => !o.confirmada),
  };
}
