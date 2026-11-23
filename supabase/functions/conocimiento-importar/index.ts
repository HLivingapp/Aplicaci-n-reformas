// Base de conocimiento · importar un documento (PDF, Excel, CSV, texto) en fragmentos para la IA.
//
// POST { documento: uuid, desde?: number, lote?: number }
//  · El documento ya existe en conocimiento_documentos (lo crea la zona de admin) con su `archivo`
//    en el almacén privado «conocimiento» o con una `url` pública (p. ej. codigotecnico.org).
//  · Los PDF se procesan por lotes de páginas para no pasar del límite de CPU: la respuesta trae
//    `siguiente` (la página por la que seguir) hasta que vale null y el documento queda «listo».
//
// Quién puede llamarla: alguien del equipo (su sesión de Supabase, comprobada con es_del_equipo())
// o una carga puntual con un token de un solo uso guardado (solo su huella) en conocimiento_cargas.
// Al trocear se ocultan emails, teléfonos, NIF/CIF/NIE e IBAN (RGPD).

import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getDocumentProxy } from "npm:unpdf@0.12.1";
import * as XLSX from "npm:xlsx@0.18.5";

const URL_SB = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICIO = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-carga-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// ---------------------------------------------------------------- RGPD
const OCULTO = "[dato oculto]";
const PATRONES = [
  /[\w.+-]+@[\w-]+(\.[\w-]+)+/gi, // email
  /\bES\d{2}[\s-]?(?:\d{4}[\s-]?){5}\b/gi, // IBAN
  /(?:\+?34[\s.-]?)?(?:[6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|[6789]\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2})\b/g, // teléfono
  /\b[A-HJNP-SUVW][\s.-]?\d{7}[\s.-]?[0-9A-J]\b/g, // CIF
  /\b[XYZ]?\d{7,8}[\s.-]?[A-Z]\b/g, // NIF / NIE
];
const limpiar = (t: string) => PATRONES.reduce((s, re) => s.replace(re, OCULTO), t);

// ---------------------------------------------------------------- CTE: a qué tipos de obra aplica cada sección
const TIPOS_CTE: Record<string, string[]> = {
  HE0: ["rehabilitacion", "fachadas", "cubiertas"],
  HE1: ["rehabilitacion", "fachadas", "cubiertas", "reforma_interior"],
  HE2: ["instalaciones", "reforma_interior", "rehabilitacion"],
  HE3: ["instalaciones", "rehabilitacion"],
  HE4: ["instalaciones", "reforma_interior", "rehabilitacion"],
  HE5: ["instalaciones", "rehabilitacion"],
  HE6: ["instalaciones", "rehabilitacion"],
  HS1: ["fachadas", "cubiertas", "rehabilitacion"],
  HS2: ["reforma_interior", "rehabilitacion"],
  HS3: ["reforma_interior", "instalaciones", "rehabilitacion"],
  HS4: ["reforma_interior", "instalaciones", "rehabilitacion"],
  HS5: ["reforma_interior", "instalaciones", "rehabilitacion"],
  HS6: ["rehabilitacion"],
  SI1: ["reforma_interior", "rehabilitacion"],
  SI2: ["fachadas", "cubiertas", "rehabilitacion"],
  SI3: ["reforma_interior", "rehabilitacion"],
  SI4: ["instalaciones", "rehabilitacion"],
  SI5: ["rehabilitacion"],
  SI6: ["estructura", "rehabilitacion"],
  SUA9: ["accesibilidad", "reforma_interior", "rehabilitacion"],
  HR: ["reforma_interior", "fachadas", "rehabilitacion"],
  SE: ["estructura", "rehabilitacion"],
};
function tiposCte(seccion: string | null, base: string[]): string[] {
  if (!seccion) return base;
  const m = (seccion.split("·").pop() ?? "").match(/\b(HE|HS|SI|SUA|HR|SE)\s?(\d)?/);
  if (!m) return base;
  const clave = m[1] === "SUA" ? (m[2] === "9" ? "SUA9" : "") : m[1] === "HR" || m[1] === "SE" ? m[1] : m[1] + (m[2] ?? "");
  if (m[1] === "SUA" && clave !== "SUA9") return ["reforma_interior", "rehabilitacion", "accesibilidad"];
  return TIPOS_CTE[clave] ?? base;
}

/** Sección del CTE que aparece en la página: cabeceras «Sección HE 1», numeración «HE1 - 12», «SUA 9-3», anejos. */
function seccionCte(texto: string, prefijo: string): string | null {
  const cab = texto.match(/Secci[oó]n\s+(HE|HS|SI|SUA)\s?(\d)\b/);
  if (cab) return `${prefijo} · ${cab[1]} ${cab[2]}`;
  const num = texto.match(/\b(HE|HS|SI|SUA)\s?(\d)\s?-\s?\d{1,3}\b/);
  if (num) return `${prefijo} · ${num[1]} ${num[2]}`;
  const anejo = texto.match(/\bAnejo\s+([A-Z]{1,3}|\d{1,2})\b/);
  if (anejo) return `${prefijo} · Anejo ${anejo[1]}`;
  return null;
}

// ---------------------------------------------------------------- troceo
const OBJETIVO = 1600;
function trocear(texto: string): string[] {
  const parrafos = texto.split(/\n{2,}|\n(?=[A-Z0-9][^\n]{0,80}\n)/).map((p) => p.replace(/[ \t]+/g, " ").trim()).filter(Boolean);
  const salida: string[] = [];
  let actual = "";
  for (const p of parrafos) {
    if (actual && actual.length + p.length > OBJETIVO) {
      salida.push(actual);
      actual = "";
    }
    if (p.length > OBJETIVO * 2) {
      for (let i = 0; i < p.length; i += OBJETIVO) salida.push(p.slice(i, i + OBJETIVO));
      continue;
    }
    actual = actual ? `${actual}\n${p}` : p;
  }
  if (actual) salida.push(actual);
  return salida.filter((t) => t.replace(/\W/g, "").length > 40);
}

async function textoPagina(pdf: Awaited<ReturnType<typeof getDocumentProxy>>, n: number) {
  const pagina = await pdf.getPage(n);
  const c = await pagina.getTextContent();
  let t = "";
  for (const it of c.items as { str?: string; hasEOL?: boolean }[]) {
    if (typeof it.str !== "string") continue;
    t += it.str + (it.hasEOL ? "\n" : "");
  }
  pagina.cleanup();
  return t.replace(/\n{3,}/g, "\n\n");
}

async function sha256(t: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Usa POST" }, 405);
  const admin = createClient(URL_SB, SERVICIO, { auth: { persistSession: false } });

  // --- ¿quién llama?
  let permitido = false;
  const token = req.headers.get("x-carga-token");
  if (token && token.length >= 32) {
    const { data } = await admin.from("conocimiento_cargas").select("huella").eq("huella", await sha256(token)).gt("caduca", new Date().toISOString()).maybeSingle();
    permitido = Boolean(data);
  } else {
    const auth = req.headers.get("Authorization") ?? "";
    if (auth.startsWith("Bearer ")) {
      const usuario = createClient(URL_SB, ANON, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
      const { data } = await usuario.rpc("es_del_equipo");
      permitido = data === true;
    }
  }
  if (!permitido) return json({ error: "Solo el equipo puede importar documentos." }, 403);

  const body = await req.json().catch(() => ({}));
  const id = String(body.documento ?? "");
  const desde = Math.max(1, Number(body.desde) || 1);
  const lote = Math.min(40, Math.max(1, Number(body.lote) || 15));
  const prefijo = typeof body.codigo === "string" ? body.codigo.slice(0, 40) : "";

  const { data: doc, error } = await admin.from("conocimiento_documentos").select("*").eq("id", id).maybeSingle();
  if (error || !doc) return json({ error: "No encuentro el documento." }, 404);

  const fallo = async (msg: string) => {
    await admin.from("conocimiento_documentos").update({ estado: "error", notas: msg.slice(0, 500) }).eq("id", id);
    return json({ error: msg }, 500);
  };

  try {
    // --- original
    let bytes: Uint8Array;
    if (doc.archivo) {
      const { data, error: e } = await admin.storage.from("conocimiento").download(doc.archivo);
      if (e || !data) return await fallo("No se ha podido leer el archivo subido.");
      bytes = new Uint8Array(await data.arrayBuffer());
    } else if (doc.url) {
      const r = await fetch(doc.url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; base-conocimiento)" } });
      if (!r.ok) return await fallo(`La web respondió ${r.status} al descargar el documento.`);
      bytes = new Uint8Array(await r.arrayBuffer());
    } else return await fallo("El documento no tiene archivo ni enlace.");

    // --- dónde seguir
    const { data: ultimo } = await admin.from("conocimiento_fragmentos").select("orden, seccion").eq("documento", id).order("orden", { ascending: false }).limit(1).maybeSingle();
    let orden = desde === 1 ? 0 : (ultimo?.orden ?? 0);
    let seccion: string | null = desde === 1 ? null : (ultimo?.seccion ?? null);
    if (desde === 1) await admin.from("conocimiento_fragmentos").delete().eq("documento", id);

    const formato = (doc.formato ?? "").toLowerCase();
    const filas: { documento: string; orden: number; pagina: number | null; seccion: string | null; texto: string; tipos_obra: string[] }[] = [];
    const esCte = doc.tema === "cte";
    const añadir = (texto: string, pagina: number | null, sec: string | null) => {
      for (const trozo of trocear(esCte ? texto : limpiar(texto))) {
        filas.push({ documento: id, orden: ++orden, pagina, seccion: sec, texto: trozo, tipos_obra: esCte ? tiposCte(sec, doc.tipos_obra) : doc.tipos_obra });
      }
    };

    // Fichas en Markdown: un apartado por «## …». Con `costes_aparte` (id de otro documento, interno),
    // los apartados con importes van a ese documento y el principal queda solo con la parte técnica.
    const idCostes = typeof body.costes_aparte === "string" ? body.costes_aparte : "";
    const { data: docCostes } = idCostes
      ? await admin.from("conocimiento_documentos").select("id, tipos_obra, publico").eq("id", idCostes).maybeSingle()
      : { data: null };
    if (docCostes?.publico) return await fallo("El documento de costes debe ser interno.");
    let ordenCostes = 0;
    const añadirCostes = (texto: string, sec: string | null) => {
      for (const trozo of trocear(limpiar(texto))) {
        filas.push({ documento: docCostes!.id, orden: ++ordenCostes, pagina: null, seccion: sec, texto: trozo, tipos_obra: docCostes!.tipos_obra });
      }
    };
    if (docCostes) await admin.from("conocimiento_fragmentos").delete().eq("documento", docCostes.id);
    const CON_IMPORTES = /€|\bimporte\b|\(coste\)|precio a cliente|\bcoste\b[^\n]*\d/i;

    let total = 1;
    let siguiente: number | null = null;
    if (formato === "pdf" || (!formato && bytes[0] === 0x25)) {
      const pdf = await getDocumentProxy(bytes);
      total = pdf.numPages;
      const hasta = Math.min(total, desde + lote - 1);
      for (let n = desde; n <= hasta; n++) {
        const t = await textoPagina(pdf, n);
        if (esCte) seccion = seccionCte(t, prefijo || doc.titulo.split(" ")[0]) ?? seccion ?? (prefijo || null);
        else if (!seccion && prefijo) seccion = prefijo;
        añadir(t, n, seccion);
      }
      siguiente = hasta < total ? hasta + 1 : null;
    } else if (["xlsx", "xls", "csv", "ods"].includes(formato)) {
      const libro = XLSX.read(bytes, { type: "array" });
      for (const hoja of libro.SheetNames) {
        const filasHoja = XLSX.utils.sheet_to_json<Record<string, unknown>>(libro.Sheets[hoja], { defval: "" });
        for (let i = 0; i < filasHoja.length; i += 25) {
          const texto = filasHoja
            .slice(i, i + 25)
            .map((f) => Object.entries(f).filter(([, v]) => String(v).trim()).map(([k, v]) => `${k}: ${v}`).join(" · "))
            .filter(Boolean)
            .join("\n");
          if (texto) añadir(texto, null, `Hoja «${hoja}»`);
        }
      }
    } else {
      const texto = new TextDecoder().decode(bytes);
      if (formato === "md" || /^##\s/m.test(texto)) {
        const titulo1 = texto.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? doc.titulo;
        for (const parte of texto.split(/^(?=##\s)/m)) {
          const h = parte.match(/^##\s+(.+)$/m)?.[1]?.trim().replace(/^\d+[.)]\s*/, "");
          const sec = `${prefijo || titulo1}${h ? ` · ${h}` : ""}`.slice(0, 200);
          if (docCostes && CON_IMPORTES.test(parte)) añadirCostes(parte, sec);
          else añadir(parte, null, sec);
        }
      } else añadir(texto, null, prefijo || null);
    }

    for (let i = 0; i < filas.length; i += 200) {
      const { error: e } = await admin.from("conocimiento_fragmentos").insert(filas.slice(i, i + 200));
      if (e) return await fallo("No se han podido guardar los fragmentos: " + e.message);
    }
    await admin
      .from("conocimiento_documentos")
      .update({ estado: siguiente ? "procesando" : "listo", paginas: total, notas: null })
      .eq("id", id);
    if (docCostes) await admin.from("conocimiento_documentos").update({ estado: "listo", notas: null }).eq("id", docCostes.id);
    return json({ ok: true, total, siguiente, fragmentos: filas.length });
  } catch (e) {
    return await fallo(e instanceof Error ? e.message : "Error al procesar el documento");
  }
});
