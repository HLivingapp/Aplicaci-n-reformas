/**
 * Descripción detallada de la reforma (opcional): preguntas extra para afinar el presupuesto partida a partida.
 * Cada respuesta es opcional; «No lo sé» (null) deja el cálculo de la estimación rápida.
 */
export interface DetalleReforma {
  // Demoliciones
  /** Capas de suelo que hay que levantar (1 = solo la de arriba) */
  capasSuelo?: number | null;
  /** Falso techo que hay que desmontar */
  demFalsoTecho?: "ninguno" | "parte" | "todo" | null;
  /** Trasdosados (forrados de pared) que hay que quitar */
  demTrasdosados?: "ninguno" | "algunos" | "muchos" | null;
  /** Grosor de los tabiques a tirar */
  grosorParedes?: "fino" | "grueso" | null;
  /** Puertas, armarios empotrados y otras carpinterías a desmontar */
  carpinteriasQuitar?: number | null;
  /** Tabiques que se tiran (paños de unos 3 m) */
  tabiquesTirar?: number | null;
  // Albañilería y pladur
  /** Tabiques nuevos (paños de unos 3 m) */
  tabiquesNuevos?: number | null;
  tipoTabique?: "ladrillo" | "pladur" | "pladur_aislado" | null;
  /** Vigas y pilares que hay que forrar (cajear) */
  cajeados?: number | null;
  /** Trasdosados nuevos: forrar muros de fachada para aislar */
  trasdosadosNuevos?: "ninguno" | "fachada" | "todo" | null;
  /** Falso techo nuevo */
  falsoTechoNuevo?: "humedas" | "humedas_pasillo" | "todo" | null;
  /** Picar y rehacer esquinas y encuentros de techo */
  picadoEsquinas?: boolean | null;
  /** Nivelado del suelo antes del acabado */
  niveladoSuelo?: "no" | "leve" | "recrecido" | null;
  // Terrazas
  terrazaM2?: number | null;
  terrazaIntervencion?: "nada" | "suelo" | "suelo_impermeabilizar" | null;
  // Instalaciones
  dificultadElectrica?: "normal" | "compleja" | null;
  dificultadFontaneria?: "normal" | "compleja" | null;
  // Cocina
  modulosCocina?: number | null;
  esquinerosCocina?: number | null;
  especialesCocina?: number | null;
  // Gamas
  gamaElectrodomesticos?: "basica" | "media" | "alta" | null;
  gamaBano?: "basica" | "media" | "alta" | null;
  tipoAzulejo?: "ceramico" | "porcelanico" | "gran_formato" | null;
  // Climatización
  estanciasClima?: number | null;
  observaciones?: string;
}

/** Módulos que lleva la cocina estándar del presupuesto rápido. */
export const MODULOS_COCINA_ESTANDAR = 8;
/** m² de un paño de tabique de unos 3 m de largo y 2,6 m de alto. */
export const M2_PANO = 7.8;

export const FACTOR_GAMA: Record<"basica" | "media" | "alta", number> = { basica: 0.7, media: 1, alta: 1.6 };
export const FACTOR_AZULEJO: Record<"ceramico" | "porcelanico" | "gran_formato", number> = { ceramico: 0.8, porcelanico: 1, gran_formato: 1.4 };

type Opcion<T> = { v: T; texto: string; ayuda?: string };
export type Pregunta =
  | { id: keyof DetalleReforma; tipo: "opciones"; titulo: string; ayuda?: string; opciones: Opcion<string | boolean>[] }
  | { id: keyof DetalleReforma; tipo: "numero"; titulo: string; ayuda?: string; max: number; unidad?: string };

export const BLOQUES_DETALLE: { titulo: string; icono: string; preguntas: Pregunta[] }[] = [
  {
    titulo: "Lo que hay que demoler",
    icono: "🔨",
    preguntas: [
      { id: "capasSuelo", tipo: "numero", titulo: "¿Cuántas capas de suelo hay que levantar?", ayuda: "A veces hay un suelo puesto encima de otro. Si no lo sabes, levanta una baldosa suelta o pregúntanos.", max: 4, unidad: "capas" },
      { id: "demFalsoTecho", tipo: "opciones", titulo: "¿Hay falso techo que quitar?", opciones: [{ v: "ninguno", texto: "No hay" }, { v: "parte", texto: "En baños o pasillo" }, { v: "todo", texto: "En toda la casa" }] },
      { id: "demTrasdosados", tipo: "opciones", titulo: "¿Hay paredes forradas (trasdosados) que quitar?", ayuda: "Paredes de pladur o madera puestas sobre el muro, que suenan huecas.", opciones: [{ v: "ninguno", texto: "No" }, { v: "algunos", texto: "Alguna pared" }, { v: "muchos", texto: "Casi todas" }] },
      { id: "tabiquesTirar", tipo: "numero", titulo: "¿Cuántos tabiques se tiran?", ayuda: "Cuenta paños de unos 3 m de largo.", max: 20, unidad: "tabiques" },
      { id: "grosorParedes", tipo: "opciones", titulo: "¿Cómo son esos tabiques?", opciones: [{ v: "fino", texto: "Finos (ladrillo hueco o pladur)" }, { v: "grueso", texto: "Gruesos (ladrillo macizo, más de 10 cm)" }] },
      { id: "carpinteriasQuitar", tipo: "numero", titulo: "¿Cuántas puertas, armarios empotrados o ventanas hay que desmontar?", max: 30, unidad: "ud" },
    ],
  },
  {
    titulo: "Tabiques, techos y suelos",
    icono: "🧱",
    preguntas: [
      { id: "tabiquesNuevos", tipo: "numero", titulo: "¿Cuántos tabiques nuevos hay que levantar?", ayuda: "Paños de unos 3 m de largo.", max: 20, unidad: "tabiques" },
      { id: "tipoTabique", tipo: "opciones", titulo: "¿De qué tipo?", opciones: [{ v: "ladrillo", texto: "Ladrillo" }, { v: "pladur", texto: "Pladur" }, { v: "pladur_aislado", texto: "Pladur con aislamiento acústico" }] },
      { id: "cajeados", tipo: "numero", titulo: "¿Cuántas vigas o pilares hay que forrar (cajear)?", max: 20, unidad: "ud" },
      { id: "trasdosadosNuevos", tipo: "opciones", titulo: "¿Quieres forrar paredes para aislar (trasdosado)?", opciones: [{ v: "ninguno", texto: "No" }, { v: "fachada", texto: "Solo los muros de fachada" }, { v: "todo", texto: "Fachada y medianeras" }] },
      { id: "falsoTechoNuevo", tipo: "opciones", titulo: "¿Dónde quieres falso techo?", ayuda: "Hace falta para focos empotrados o aire por conductos.", opciones: [{ v: "humedas", texto: "Baños y cocina" }, { v: "humedas_pasillo", texto: "Baños, cocina y pasillo" }, { v: "todo", texto: "Toda la casa" }] },
      { id: "picadoEsquinas", tipo: "opciones", titulo: "¿Hay que picar y rehacer esquinas o encuentros de techo?", ayuda: "Molduras rotas, grietas en las esquinas…", opciones: [{ v: false, texto: "No" }, { v: true, texto: "Sí" }] },
      { id: "niveladoSuelo", tipo: "opciones", titulo: "¿El suelo está desnivelado?", opciones: [{ v: "no", texto: "Está bien" }, { v: "leve", texto: "Un poco (autonivelante)" }, { v: "recrecido", texto: "Mucho (recrecido de mortero)" }] },
    ],
  },
  {
    titulo: "Terraza",
    icono: "🌿",
    preguntas: [
      { id: "terrazaM2", tipo: "numero", titulo: "¿Cuántos m² de terraza hay?", max: 200, unidad: "m²" },
      { id: "terrazaIntervencion", tipo: "opciones", titulo: "¿Qué hacemos en la terraza?", opciones: [{ v: "nada", texto: "Nada" }, { v: "suelo", texto: "Cambiar el suelo" }, { v: "suelo_impermeabilizar", texto: "Suelo e impermeabilizar" }] },
    ],
  },
  {
    titulo: "Instalaciones",
    icono: "⚡",
    preguntas: [
      { id: "dificultadElectrica", tipo: "opciones", titulo: "Instalación eléctrica", opciones: [{ v: "normal", texto: "Normal" }, { v: "compleja", texto: "Compleja", ayuda: "muchos puntos, domótica o cambiar la acometida" }] },
      { id: "dificultadFontaneria", tipo: "opciones", titulo: "Fontanería", opciones: [{ v: "normal", texto: "Normal" }, { v: "compleja", texto: "Compleja", ayuda: "cambiar bajantes o llevar el agua lejos" }] },
      { id: "estanciasClima", tipo: "numero", titulo: "¿En cuántas estancias quieres aire o calefacción?", max: 12, unidad: "estancias" },
    ],
  },
  {
    titulo: "Cocina",
    icono: "🍳",
    preguntas: [
      { id: "modulosCocina", tipo: "numero", titulo: "¿Cuántos módulos tendrá la cocina?", ayuda: `Cuenta muebles bajos y altos de unos 60 cm. Una cocina normal tiene unos ${MODULOS_COCINA_ESTANDAR}.`, max: 40, unidad: "módulos" },
      { id: "esquinerosCocina", tipo: "numero", titulo: "¿Cuántos módulos esquineros?", max: 6, unidad: "ud" },
      { id: "especialesCocina", tipo: "numero", titulo: "¿Cuántos módulos especiales (columnas, despensero, cajones grandes)?", max: 10, unidad: "ud" },
    ],
  },
  {
    titulo: "Gamas y acabados",
    icono: "✨",
    preguntas: [
      { id: "gamaElectrodomesticos", tipo: "opciones", titulo: "Gama de electrodomésticos", opciones: [{ v: "basica", texto: "Básica" }, { v: "media", texto: "Media" }, { v: "alta", texto: "Alta" }] },
      { id: "gamaBano", tipo: "opciones", titulo: "Gama de sanitarios, grifería y mueble de baño", opciones: [{ v: "basica", texto: "Básica" }, { v: "media", texto: "Media" }, { v: "alta", texto: "Alta" }] },
      { id: "tipoAzulejo", tipo: "opciones", titulo: "Tipo de azulejo", opciones: [{ v: "ceramico", texto: "Cerámico" }, { v: "porcelanico", texto: "Porcelánico" }, { v: "gran_formato", texto: "Gran formato" }] },
    ],
  },
];

/** Deja solo campos conocidos y valores válidos (para datos que llegan del navegador). */
export function limpiarDetalle(d: unknown): DetalleReforma | undefined {
  if (!d || typeof d !== "object") return undefined;
  const o = d as Record<string, unknown>;
  const out: DetalleReforma = {};
  for (const b of BLOQUES_DETALLE)
    for (const p of b.preguntas) {
      const x = o[p.id];
      if (p.tipo === "numero" && typeof x === "number" && Number.isFinite(x)) (out as Record<string, unknown>)[p.id] = Math.max(0, Math.min(p.max, Math.round(x)));
      if (p.tipo === "opciones" && p.opciones.some((op) => op.v === x)) (out as Record<string, unknown>)[p.id] = x;
    }
  if (typeof o.observaciones === "string") out.observaciones = o.observaciones.slice(0, 2000);
  return out;
}

/** Preguntas contestadas (no «No lo sé»). */
export const respondidas = (d?: DetalleReforma) => (d ? BLOQUES_DETALLE.flatMap((b) => b.preguntas).filter((p) => d[p.id] != null).length : 0);
export const totalPreguntas = BLOQUES_DETALLE.reduce((s, b) => s + b.preguntas.length, 0);
