"use client";

import { CATEGORIAS, mensajeLimpio, ocultarContacto, temasIniciales, TIPOS, type Accion, type Mensaje, type Tema } from "./foro";
import { supabaseNavegador } from "./supabase/navegador";

/**
 * Foro en la web estática con nube: se lee y escribe directamente en Supabase (tablas foro_mensajes
 * y foro_votos). Leer es libre; para participar hay que haber entrado con el enlace del email.
 * La base de datos oculta teléfonos, emails y enlaces, marca a los profesionales homologados y lleva
 * los contadores, así que nadie puede saltárselo desde el navegador.
 */

interface FilaForo {
  id: string;
  tema_id: string | null;
  autor: string;
  alias: string;
  profesional: boolean;
  titulo: string | null;
  categoria: string | null;
  tipo_tema: Tema["tipoTema"] | null;
  texto: string;
  foto: string | null;
  solucion: boolean;
  utiles: number;
  denuncias: number;
  creado: string;
}

const aMensaje = (f: FilaForo): Mensaje => ({
  id: f.id,
  autor: { alias: f.alias, tipo: f.profesional ? "profesional" : "particular", homologado: f.profesional || undefined },
  texto: f.texto,
  foto: f.foto ?? undefined,
  creado: f.creado,
  utiles: f.utiles,
  denuncias: f.denuncias,
  solucion: f.solucion || undefined,
});

/** Temas publicados (más los de ejemplo, que solo se leen) y lo que ha hecho quien ha entrado. */
export async function cargarForoNube(): Promise<{ temas: Tema[]; mios: Set<string>; utiles: Set<string> }> {
  const s = supabaseNavegador();
  const [{ data, error }, { data: sesion }] = await Promise.all([
    s.from("foro_mensajes").select("id,tema_id,autor,alias,profesional,titulo,categoria,tipo_tema,texto,foto,solucion,utiles,denuncias,creado").order("creado", { ascending: false }).limit(1000),
    s.auth.getSession(),
  ]);
  if (error) throw error;
  const filas = (data ?? []) as FilaForo[];
  const temas: Tema[] = filas
    .filter((f) => !f.tema_id)
    .map((f) => ({
      ...aMensaje(f),
      titulo: f.titulo ?? "",
      categoria: f.categoria ?? "",
      tipoTema: f.tipo_tema ?? "pregunta",
      respuestas: filas.filter((r) => r.tema_id === f.id).map(aMensaje).reverse(),
    }));
  const uid = sesion.session?.user.id;
  let utiles = new Set<string>();
  if (uid) {
    const v = await s.from("foro_votos").select("mensaje_id").eq("tipo", "util");
    utiles = new Set((v.data ?? []).map((x) => x.mensaje_id as string));
  }
  return { temas: [...temas, ...temasIniciales()], mios: new Set(filas.filter((f) => f.autor === uid).map((f) => f.id)), utiles };
}

const esEjemplo = (id: string) => temasIniciales().some((t) => t.id === id);

/** Aplica una acción en la nube. Lanza un Error con un texto para la persona si no se puede. */
export async function accionForoNube(a: Exclude<Accion, { tipo: "ia" }>) {
  const s = supabaseNavegador();
  const { data: sesion } = await s.auth.getSession();
  if (!sesion.session) throw new Error("Entra con el enlace que te enviamos al email para participar.");
  if (a.tipo !== "crear" && esEjemplo(a.temaId)) throw new Error("Este tema es de ejemplo. Abre uno nuevo con tu pregunta o tu experiencia.");
  let r: { error: { code?: string; message: string } | null };
  if (a.tipo === "crear") {
    if (!CATEGORIAS.includes(a.categoria as (typeof CATEGORIAS)[number])) throw new Error("Tema no válido");
    if (!TIPOS.some((x) => x.valor === a.tipoTema)) throw new Error("Tipo no válido");
    const titulo = ocultarContacto(String(a.titulo ?? "").trim()).slice(0, 120);
    if (titulo.length < 8) throw new Error("El título es demasiado corto.");
    const m = mensajeLimpio(a.id, a.mensaje, { alias: "", tipo: "particular" }, "");
    r = await s.from("foro_mensajes").insert({ id: a.id, alias: m.autor.alias, titulo, categoria: a.categoria, tipo_tema: a.tipoTema, texto: m.texto, foto: m.foto ?? null });
  } else if (a.tipo === "responder") {
    const m = mensajeLimpio(a.id, a.mensaje, { alias: "", tipo: "particular" }, "");
    r = await s.from("foro_mensajes").insert({ id: a.id, tema_id: a.temaId, alias: m.autor.alias, texto: m.texto, foto: m.foto ?? null });
  } else if (a.tipo === "util" || a.tipo === "denunciar") {
    r = await s.from("foro_votos").insert({ mensaje_id: a.mensajeId, tipo: a.tipo === "util" ? "util" : "denuncia" });
    if (r.error?.code === "23505") r = { error: null }; // ya lo había marcado
  } else if (a.tipo === "borrar") {
    r = await s.from("foro_mensajes").delete().eq("id", a.mensajeId);
  } else {
    r = await s.rpc("foro_marcar_solucion", { respuesta: a.mensajeId });
  }
  if (r.error) throw new Error(r.error.message.includes("Solo quien") ? r.error.message : "No se ha podido guardar. Inténtalo de nuevo en un momento.");
}
