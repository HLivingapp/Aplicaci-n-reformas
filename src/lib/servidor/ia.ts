import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { esLegal, ocultarContacto, type RespuestaIA, type Tema } from "../foro";

/**
 * Asistente IA de la comunidad: opina en temas técnicos y de legalizaciones urbanísticas en Madrid,
 * buscando en fuentes oficiales y citándolas. Necesita ANTHROPIC_API_KEY en el servidor (nunca en el repo).
 */
const DOMINIOS_LEGALES = ["madrid.es", "sede.madrid.es", "comunidad.madrid", "bocm.es", "boe.es", "mivau.gob.es", "codigotecnico.org"];

const SISTEMA = `Eres el asistente técnico de un foro público de reformas de vivienda en Madrid (España).
Respondes en español, en un tono cercano y claro para particulares, en 120-250 palabras.
- Temas de legalización urbanística en el municipio de Madrid (licencias, declaraciones responsables, ICIO y tasas, cambios de uso, cerramientos de terraza, comunidad de propietarios, edificios protegidos): básate solo en lo que encuentres en las fuentes oficiales con la búsqueda web, y cita la norma por su nombre. Si no lo encuentras o depende del caso, dilo.
- Temas técnicos de obra (humedades, materiales, instalaciones, aerotermia, plazos): explica causas probables y qué comprobar, y cita el Código Técnico de la Edificación o el reglamento que aplique cuando sea relevante.
- Termina siempre recordando que es una orientación y que un profesional homologado o el Ayuntamiento deben confirmarlo en su caso.
- No pidas ni repitas datos personales, direcciones ni contactos. No recomiendes empresas concretas.`;

export const iaConfigurada = () => Boolean(process.env.ANTHROPIC_API_KEY);

export async function preguntarIA(t: Tema): Promise<RespuestaIA> {
  const client = new Anthropic();
  const r = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    system: SISTEMA,
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 3,
        ...(esLegal(t) ? { allowed_domains: DOMINIOS_LEGALES } : {}),
        user_location: { type: "approximate", city: "Madrid", region: "Madrid", country: "ES", timezone: "Europe/Madrid" },
      },
    ],
    messages: [{ role: "user", content: `Tema del foro (${t.categoria}): ${ocultarContacto(t.titulo)}\n\n${ocultarContacto(t.texto)}` }],
  });
  if (r.stop_reason === "refusal") throw new Error("El asistente no puede responder a esta pregunta.");
  let texto = "";
  const fuentes = new Map<string, string>();
  for (const b of r.content) {
    if (b.type !== "text") continue;
    texto += b.text;
    for (const c of b.citations ?? []) if (c.type === "web_search_result_location") fuentes.set(c.url, c.title ?? c.url);
  }
  return { texto: texto.trim(), fuentes: [...fuentes].slice(0, 6).map(([url, titulo]) => ({ url, titulo })), creado: new Date().toISOString() };
}

const SISTEMA_OBRA = `Eres el asistente IA especializado en obra de una plataforma de reformas de vivienda en Madrid (España), para clientes con plan Pro.
Respondes en español, claro y práctico, en 150-400 palabras, con listas cuando ayuden.
Ayudas con: revisar presupuestos de reforma (qué partidas faltan, qué conviene concretar, precios fuera de mercado y qué preguntar al reformista), legalizaciones urbanísticas en el municipio de Madrid (licencia o declaración responsable, ICIO y tasas, comunidad de propietarios), dudas técnicas (humedades, instalaciones, aerotermia, ventanas, materiales), plazos, garantías y cómo seguir la obra por fases.
- En temas legales, básate en fuentes oficiales encontradas con la búsqueda web y cita la norma por su nombre. Si depende del caso, dilo.
- En temas técnicos, cita el Código Técnico de la Edificación o el reglamento aplicable cuando sea relevante.
- Cierra recordando, en una línea, que es una orientación y que un profesional homologado o el Ayuntamiento deben confirmarlo.
- No pidas datos personales ni direcciones exactas. No recomiendes empresas concretas.`;

export type TurnoChat = { rol: "usuario" | "asistente"; texto: string };

/** Asistente privado del plan Pro: conversación con búsqueda en fuentes oficiales. */
export async function asistenteObra(historial: TurnoChat[]): Promise<RespuestaIA> {
  const client = new Anthropic();
  const r = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 6000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    system: SISTEMA_OBRA,
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 3,
        user_location: { type: "approximate", city: "Madrid", region: "Madrid", country: "ES", timezone: "Europe/Madrid" },
      },
    ],
    messages: historial.map((t) => ({ role: t.rol === "usuario" ? ("user" as const) : ("assistant" as const), content: ocultarContacto(t.texto) })),
  });
  if (r.stop_reason === "refusal") throw new Error("El asistente no puede responder a esta pregunta.");
  let texto = "";
  const fuentes = new Map<string, string>();
  for (const b of r.content) {
    if (b.type !== "text") continue;
    texto += b.text;
    for (const c of b.citations ?? []) if (c.type === "web_search_result_location") fuentes.set(c.url, c.title ?? c.url);
  }
  return { texto: texto.trim(), fuentes: [...fuentes].slice(0, 6).map(([url, titulo]) => ({ url, titulo })), creado: new Date().toISOString() };
}
