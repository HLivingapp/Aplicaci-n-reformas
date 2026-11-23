import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { citaFragmento, enlaceFragmento, type FragmentoEncontrado, type TipoObra } from "../conocimiento";

/**
 * Contexto de la base de conocimiento para la IA (tablas conocimiento_* en Supabase).
 * Se buscan los fragmentos más relevantes con buscar_conocimiento() y se pasan a Claude como bloques
 * «search_result» con citas activadas: así la respuesta cita el documento, la sección y la página
 * (p. ej. «DB-HS · HS 3, pág. 12»).
 *
 * Con la clave de servicio se ven también los documentos internos; `soloPublicos` los excluye para
 * respuestas que verán clientes o el foro público.
 */

/** Palabras de la pregunta que apuntan a cada tipo de obra (para afinar la búsqueda). */
const PISTAS: [TipoObra, RegExp][] = [
  ["fachadas", /fachad|aislamiento exterior|sate|ventan|carpinter|balc|terraz|cerramiento|medianer/i],
  ["cubiertas", /cubiert|tejad|azotea|impermeabil/i],
  ["estructura", /viga|forjad|pilar|muro de carga|tabique de carga|estructur|apear|refuerz|cimient/i],
  ["instalaciones", /aerotermi|caldera|calefacci|climatiz|aire acondicionado|ventilaci|extracci|fontaner|saneamient|desag|electric|acs|agua caliente|placas solares|fotovolt|recarga/i],
  ["accesibilidad", /accesib|silla de ruedas|rampa|ascensor|movilidad reducida|barrera/i],
  ["rehabilitacion", /rehabilit|edificio existente|comunidad|ite|iee|envolvente/i],
  ["reforma_interior", /reforma|cocina|baño|tabique|distribuci|suelo|techo|escalera|barandill|ruido|aislamiento acústico/i],
];
export const tiposDePregunta = (texto: string) => PISTAS.filter(([, re]) => re.test(texto)).map(([t]) => t);

/** Con la clave pública, la propia base de datos solo devuelve documentos públicos. */
function cliente(soloPublicos: boolean) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = soloPublicos ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return createClient(url, clave, { auth: { persistSession: false } });
}

export async function buscarConocimiento(consulta: string, opciones: { limite?: number; soloPublicos?: boolean; tipos?: TipoObra[] } = {}) {
  const s = cliente(Boolean(opciones.soloPublicos));
  if (!s || !consulta.trim()) return [];
  const tipos = opciones.tipos ?? tiposDePregunta(consulta);
  const pedir = (t: TipoObra[] | null) => s.rpc("buscar_conocimiento", { consulta: consulta.slice(0, 2000), tipos: t, limite: opciones.limite ?? 6 });
  let { data, error } = await pedir(tipos.length ? tipos : null);
  // Si filtrando por tipo de obra no sale nada, se busca en toda la base
  if (!error && !data?.length && tipos.length) ({ data, error } = await pedir(null));
  if (error || !data) return [];
  return (data as FragmentoEncontrado[]).slice(0, opciones.limite ?? 6);
}

/** Bloques para el mensaje del usuario: los fragmentos como resultados citables. */
export function bloquesConocimiento(fragmentos: FragmentoEncontrado[]): Anthropic.Beta.Messages.BetaSearchResultBlockParam[] {
  return fragmentos.map((f) => ({
    type: "search_result",
    source: enlaceFragmento(f) ?? `conocimiento:${f.documento}`,
    title: `${citaFragmento(f)} · ${f.titulo}`,
    content: [{ type: "text", text: f.texto }],
    citations: { enabled: true },
  }));
}

export const INSTRUCCIONES_CONOCIMIENTO = `
- Base de conocimiento: con la pregunta pueden llegar fragmentos de documentos oficiales (sobre todo el Código Técnico de la Edificación: Parte I, DB-HE, DB-HS, DB-SI, DB-SUA, DB-HR, DB-SE y documentos de apoyo) y de la plataforma. Úsalos antes que tu memoria y cítalos.
- Siempre que la pregunta trate de reforma interior, rehabilitación, fachadas o cubiertas, di qué exigencias del CTE aplican (documento básico y sección, p. ej. «DB-HS 3 Calidad del aire interior»). Recuerda que en edificios existentes el CTE se aplica a la parte intervenida, según la Parte I, art. 2, con el criterio de no empeorar las condiciones previas y la flexibilidad cuando la aplicación no sea técnica o económicamente viable.
- Si los fragmentos no bastan, dilo y no inventes valores, tablas ni artículos.
- Las fichas de obra son experiencia práctica, no normativa: si una ficha contradice el CTE, el RITE, el REBT, el reglamento de gas, las ordenanzas o lo que encuentres en fuentes oficiales, sigue la norma y no repitas el dato de la ficha.
- Los importes de los documentos «Costes de referencia» son costes de ejecución (PEM, lo que cobra una subcontrata o el gremio), no precios de venta. Para dar un precio a cliente aplica siempre la regla de precios que acompaña a esos fragmentos (margen sobre el coste y después IVA) y explica el cálculo.
- Para dar o valorar un precio, no te bases en una sola fuente: compara los costes de referencia, la referencia de venta de la plataforma, las tarifas de los reformistas si las tienes y precios públicos de almacenes o webs. Di qué fuentes has usado y, si discrepan mucho, explícalo y da un rango.`;
