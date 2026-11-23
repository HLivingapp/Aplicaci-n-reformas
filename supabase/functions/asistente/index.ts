// Edge Function «asistente» de ReformaMejor (Supabase, región del proyecto: UE).
//
// La clave de Anthropic vive SOLO aquí, como secreto: Supabase → Edge Functions → Secrets →
// ANTHROPIC_API_KEY. Nunca va en la web, en el repositorio ni en la base de datos.
//
// Modos:
//  · "asistente": asistente de obra del plan Pro (y unas pocas consultas de prueba en el Básico).
//    Usa como contexto el proyecto del cliente guardado en Supabase y busca en fuentes oficiales.
//  · "tarifa": lee un presupuesto en PDF de un profesional dado de alta y propone el ajuste de sus
//    tarifas por capítulo respecto a la referencia de la app. El PDF no se guarda en ningún sitio.
//
// Límites: por persona y mes (LIMITES) y un tope global de consultas al mes (secreto IA_TOPE_MES).
// Además conviene poner un tope de gasto mensual en console.anthropic.com → Settings → Limits.

import Anthropic from "npm:@anthropic-ai/sdk@1.11.0";
import { createClient } from "npm:@supabase/supabase-js@2.119.2";

const MODELO = Deno.env.get("IA_MODELO") ?? "claude-opus-5-5";
const TOPE_MES = Number(Deno.env.get("IA_TOPE_MES") ?? "3000");
const LIMITES = {
  asistente: { gratis: 0, basico: 5, pro: 150 } as Record<string, number>,
  tarifa: 10,
};
const ORIGENES = ["https://hlivingapp.github.io", "https://reformamejor.es", "https://www.reformamejor.es", "http://localhost:3000"];

const SISTEMA_OBRA = `Eres el asistente IA especializado en obra de ReformaMejor, una plataforma de reformas de vivienda que empieza en Madrid (España).
Respondes en español, claro y práctico, en 150-400 palabras, con listas cuando ayuden.
Ayudas con: revisar presupuestos de reforma (qué partidas faltan, qué conviene concretar, precios fuera de mercado y qué preguntar al reformista), legalizaciones urbanísticas en el municipio de Madrid (licencia o declaración responsable, ICIO y tasas, comunidad de propietarios), dudas técnicas (humedades, instalaciones, aerotermia, ventanas, materiales), plazos, garantías y cómo seguir la obra por fases.
Referencia orientativa de precio de venta en Madrid, sin IVA, por m² construido: calidad básica 950 €, media 1.100 €, premium 1.450 €. Un baño completo de gama media ronda los 12.000 €. El IVA de reforma de vivienda suele ser el 10 %.
- En temas legales, básate en fuentes oficiales encontradas con la búsqueda web y cita la norma por su nombre. Si depende del caso, dilo.
- En temas técnicos, cita el Código Técnico de la Edificación o el reglamento aplicable cuando sea relevante.
- Si te damos fragmentos de la base de conocimiento (CTE, normativa de Madrid…), apóyate en ellos primero y cítalos con su documento básico y sección. En reforma interior, rehabilitación y fachadas, ten siempre presente el CTE que aplique.
- Los importes de los documentos «Costes de referencia» son costes PEM (lo que cobra un subcontratista o gremio): no los des nunca como precio final. Aplica la regla de precios que viene en esos fragmentos y explica el cálculo.
- Si te damos el proyecto del cliente, úsalo para concretar tu respuesta; no repitas sus datos personales.
- Cierra recordando, en una línea, que es una orientación y que un profesional homologado o el Ayuntamiento deben confirmarlo.
- No pidas datos personales ni direcciones exactas. No recomiendes empresas concretas.`;

const SISTEMA_TARIFA = `Eres un técnico de presupuestos de reformas en España. Te damos un presupuesto real de un reformista (PDF) y la tabla de partidas de referencia de la app, con su precio de venta unitario sin IVA.
Empareja las partidas del presupuesto con las de referencia que sean equivalentes (misma unidad y alcance) y calcula, por capítulo, cuánto más caro (+) o más barato (-) es el reformista en porcentaje, con la media de las partidas emparejadas. Calcula también un porcentaje general.
- Usa solo capítulos de la tabla de referencia. Si un capítulo no tiene partidas comparables, no lo incluyas.
- Redondea los porcentajes a números enteros entre -60 y 100.
- Ignora y no repitas datos personales del cliente (nombre, dirección, teléfono, DNI).
- En "notas", explica en 2-4 frases en español qué has comparado y qué conviene que el reformista revise a mano.`;

function cors(origen: string) {
  return {
    "Access-Control-Allow-Origin": ORIGENES.includes(origen) ? origen : ORIGENES[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

const ocultarContacto = (t: string) =>
  t
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[contacto oculto]")
    .replace(/(\+?34[\s.-]?)?[6789]([\s.-]?\d){8}/g, "[teléfono oculto]");

type Turno = { rol: "usuario" | "asistente"; texto: string };
type Fragmento = { titulo?: string; seccion?: string | null; pagina?: number | null; url?: string | null; texto?: string; fuente?: string | null };

// Base de conocimiento (CTE, normativa de Madrid, legalizaciones…) con la sesión de la persona:
// a un cliente solo le devuelve documentos públicos. Si falla o no existe, el asistente sigue sin ella.
async function buscarConocimiento(token: string, consulta: string) {
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await sb.rpc("buscar_conocimiento", { consulta: consulta.slice(0, 1000), limite: 8 });
    if (error || !Array.isArray(data)) return [];
    return (data as Fragmento[])
      .filter((f) => typeof f.texto === "string" && f.texto.trim())
      .map((f) => ({
        type: "search_result" as const,
        source: f.url ? (f.pagina ? `${f.url}#page=${f.pagina}` : f.url) : `conocimiento:${f.fuente ?? f.titulo ?? "documento"}`,
        title: [f.titulo, f.seccion].filter(Boolean).join(" · ").slice(0, 300) || "Documento técnico",
        content: [{ type: "text" as const, text: f.texto!.slice(0, 6000) }],
        citations: { enabled: true },
      }));
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin") ?? "");
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  if (!Deno.env.get("ANTHROPIC_API_KEY")) return json({ error: "El asistente IA no está configurado todavía." }, 503);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: sesion } = await admin.auth.getUser(token);
  const usuario = sesion.user;
  if (!usuario) return json({ error: "Entra con tu email para usar el asistente." }, 401);

  const body = await req.json().catch(() => null);
  const modo: "asistente" | "tarifa" = body?.modo === "tarifa" ? "tarifa" : "asistente";
  const mes = new Date().toISOString().slice(0, 7);

  // ¿Puede usarlo? Plan (asistente) o profesional dado de alta (tarifa), y límites del mes.
  let limite: number;
  if (modo === "asistente") {
    const { data: p } = await admin.from("planes").select("plan,hasta").eq("usuario", usuario.id).maybeSingle();
    const plan = p && (!p.hasta || new Date(p.hasta) > new Date()) ? (p.plan as string) : "gratis";
    limite = LIMITES.asistente[plan] ?? 0;
    if (!limite) return json({ error: "El asistente IA está incluido en el plan Pro.", plan }, 402);
  } else {
    const { data: pro } = await admin.from("profesionales").select("id").eq("usuario", usuario.id).maybeSingle();
    if (!pro) return json({ error: "La lectura de presupuestos es para profesionales dados de alta en la app." }, 403);
    limite = LIMITES.tarifa;
  }
  const { data: uso } = await admin.from("uso_ia").select("consultas").eq("usuario", usuario.id).eq("mes", mes).eq("modo", modo).maybeSingle();
  if ((uso?.consultas ?? 0) >= limite) return json({ error: `Has usado las ${limite} consultas de este mes. Se renuevan el día 1.` }, 429);
  const { data: total } = await admin.rpc("uso_ia_mes", { m: mes });
  if (Number(total ?? 0) >= TOPE_MES) return json({ error: "El asistente está muy solicitado este mes. Vuelve a intentarlo más adelante." }, 429);

  const client = new Anthropic();
  try {
    if (modo === "asistente") {
      const historial: Turno[] = Array.isArray(body?.historial)
        ? body.historial
            .filter((t: Turno) => (t?.rol === "usuario" || t?.rol === "asistente") && typeof t.texto === "string" && t.texto.trim())
            .slice(-12)
            .map((t: Turno) => ({ rol: t.rol, texto: ocultarContacto(t.texto.slice(0, 8000)) }))
        : [];
      if (!historial.length || historial[historial.length - 1].rol !== "usuario") return json({ error: "Escribe tu pregunta." }, 400);
      while (historial[0]?.rol !== "usuario") historial.shift();

      // Contexto: el proyecto más reciente del cliente (vivienda, reforma y presupuestos), sin datos de contacto
      const { data: proyectos } = await admin.from("proyectos_cliente").select("datos").eq("usuario", usuario.id).order("actualizado", { ascending: false }).limit(1);
      const d = proyectos?.[0]?.datos as { proyectos?: { vivienda?: unknown; reforma?: unknown }[]; presupuestos?: unknown[] } | undefined;
      const contexto = d
        ? ocultarContacto(JSON.stringify({ proyecto: d.proyectos?.map((p) => ({ vivienda: p.vivienda, reforma: p.reforma })), presupuestos: d.presupuestos })).slice(0, 20000)
        : "";

      const conocimiento = await buscarConocimiento(token, historial[historial.length - 1].texto);
      const mensajes = historial.map((t, i) => ({
        role: t.rol === "usuario" ? ("user" as const) : ("assistant" as const),
        content: i === historial.length - 1 && conocimiento.length
          ? [...conocimiento, { type: "text" as const, text: t.texto }]
          : t.texto,
      }));

      const r = await client.beta.messages.create({
        model: MODELO,
        max_tokens: 6000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium" },
        system: [
          { type: "text", text: SISTEMA_OBRA, cache_control: { type: "ephemeral" } },
          ...(contexto ? [{ type: "text" as const, text: `Proyecto del cliente en la app (datos orientativos):\n${contexto}` }] : []),
        ],
        tools: [
          {
            type: "web_search_20260209",
            name: "web_search",
            max_uses: 3,
            user_location: { type: "approximate", city: "Madrid", region: "Madrid", country: "ES", timezone: "Europe/Madrid" },
          },
        ],
        messages: mensajes,
      });
      await admin.rpc("sumar_uso_ia", { u: usuario.id, m: mes, md: modo, entrada: r.usage.input_tokens, salida: r.usage.output_tokens });
      if (r.stop_reason === "refusal") return json({ error: "El asistente no puede responder a esta pregunta." }, 422);
      let texto = "";
      const fuentes = new Map<string, string>();
      for (const b of r.content) {
        if (b.type !== "text") continue;
        texto += b.text;
        for (const c of b.citations ?? []) {
          if (c.type === "web_search_result_location") fuentes.set(c.url, c.title ?? c.url);
          else if (c.type === "search_result_location" && /^https?:/.test(c.source)) fuentes.set(c.source, c.title ?? c.source);
        }
      }
      return json({
        respuesta: { texto: texto.trim(), fuentes: [...fuentes].slice(0, 6).map(([url, titulo]) => ({ url, titulo })), creado: new Date().toISOString() },
        restantes: limite - (uso?.consultas ?? 0) - 1,
      });
    }

    // modo "tarifa"
    const pdf = typeof body?.pdf === "string" ? body.pdf : "";
    if (!pdf || pdf.length > 11_000_000 || !/^[A-Za-z0-9+/=]+$/.test(pdf.slice(0, 1000))) return json({ error: "Sube el presupuesto en PDF (máximo 8 MB)." }, 400);
    const referencia = Array.isArray(body?.referencia)
      ? body.referencia.slice(0, 400).map((p: Record<string, unknown>) => ({
          capitulo: String(p.capitulo ?? "").slice(0, 60),
          partida: String(p.partida ?? "").slice(0, 160),
          unidad: String(p.unidad ?? "").slice(0, 12),
          precio: Number(p.precio) || 0,
        }))
      : [];
    const capitulos = [...new Set(referencia.map((p: { capitulo: string }) => p.capitulo).filter(Boolean))] as string[];
    if (!capitulos.length) return json({ error: "Falta la tabla de referencia." }, 400);

    const r = await client.beta.messages.create({
      model: MODELO,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "medium",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              general: { type: "integer" },
              capitulos: {
                type: "array",
                items: {
                  type: "object",
                  properties: { capitulo: { type: "string", enum: capitulos }, pct: { type: "integer" }, partidas: { type: "integer" } },
                  required: ["capitulo", "pct", "partidas"],
                  additionalProperties: false,
                },
              },
              notas: { type: "string" },
            },
            required: ["general", "capitulos", "notas"],
            additionalProperties: false,
          },
        },
      },
      system: SISTEMA_TARIFA,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf } },
            { type: "text", text: `Tabla de referencia (capítulo | partida | unidad | precio de venta sin IVA):\n${referencia.map((p: { capitulo: string; partida: string; unidad: string; precio: number }) => `${p.capitulo} | ${p.partida} | ${p.unidad} | ${p.precio}`).join("\n")}` },
          ],
        },
      ],
    });
    await admin.rpc("sumar_uso_ia", { u: usuario.id, m: mes, md: modo, entrada: r.usage.input_tokens, salida: r.usage.output_tokens });
    if (r.stop_reason === "refusal") return json({ error: "No se ha podido leer este presupuesto." }, 422);
    const texto = r.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const datos = JSON.parse(texto) as { general: number; capitulos: { capitulo: string; pct: number; partidas: number }[]; notas: string };
    const lim = (n: number) => Math.max(-60, Math.min(100, Math.round(n)));
    return json({
      tarifa: { general: lim(datos.general), capitulos: Object.fromEntries(datos.capitulos.filter((c) => c.partidas > 0).map((c) => [c.capitulo, lim(c.pct)])) },
      notas: datos.notas,
      restantes: limite - (uso?.consultas ?? 0) - 1,
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "Hay muchas consultas ahora mismo. Prueba en un minuto." }, 429);
    if (e instanceof Anthropic.APIError) return json({ error: "El asistente no está disponible ahora. Inténtalo más tarde." }, 502);
    console.error(e);
    return json({ error: "No se ha podido responder. Inténtalo de nuevo." }, 500);
  }
});
