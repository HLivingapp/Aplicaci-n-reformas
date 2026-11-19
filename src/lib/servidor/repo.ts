import "server-only";
import { createClient } from "@supabase/supabase-js";
import { datosDesdeFilas, diferencias, type Fila, type FilaAjuste } from "../sincronizar";
import type { Datos } from "../types";

/** Acceso del servidor a la base de datos (clave de servicio, nunca llega al navegador). */
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) throw new Error("Falta configurar Supabase (SUPABASE_SERVICE_ROLE_KEY)");
  return createClient(url, clave, { auth: { persistSession: false } });
}

export async function cargarTodo(): Promise<Datos> {
  const s = db();
  const [r, a] = await Promise.all([
    s.from("registros").select("coleccion,id,cliente_id,datos").order("creado", { ascending: false }),
    s.from("ajustes").select("clave,datos"),
  ]);
  if (r.error) throw r.error;
  if (a.error) throw a.error;
  return datosDesdeFilas(r.data as Fila[], a.data as FilaAjuste[]);
}

export async function guardarCambios(antes: Datos, despues: Datos) {
  const s = db();
  const d = diferencias(antes, despues);
  if (d.upserts.length) {
    const { error } = await s.from("registros").upsert(d.upserts.map((f) => ({ ...f, actualizado: new Date().toISOString() })));
    if (error) throw error;
  }
  for (const b of d.borrados) {
    const { error } = await s.from("registros").delete().eq("coleccion", b.coleccion).eq("id", b.id);
    if (error) throw error;
  }
  if (d.ajustes.length) {
    const { error } = await s.from("ajustes").upsert(d.ajustes);
    if (error) throw error;
  }
}
