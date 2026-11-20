import "server-only";
import type { Tema } from "../foro";
import { db } from "./repo";

/** Temas del foro en la base de datos: un registro por tema con sus respuestas. */
export async function cargarTemas(): Promise<Tema[]> {
  const { data, error } = await db().from("foro_temas").select("datos").order("creado", { ascending: false }).limit(500);
  if (error) throw error;
  return (data ?? []).map((x) => x.datos as Tema);
}

export async function guardarTemas(antes: Tema[], despues: Tema[]) {
  const s = db();
  for (const t of despues) {
    const viejo = antes.find((x) => x.id === t.id);
    if (viejo && JSON.stringify(viejo) === JSON.stringify(t)) continue;
    const { error } = await s.from("foro_temas").upsert({ id: t.id, datos: t, creado: t.creado, actualizado: new Date().toISOString() });
    if (error) throw error;
  }
  for (const t of antes) {
    if (despues.some((x) => x.id === t.id)) continue;
    const { error } = await s.from("foro_temas").delete().eq("id", t.id);
    if (error) throw error;
  }
}
