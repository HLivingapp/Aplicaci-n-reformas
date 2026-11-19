import "server-only";
import { db } from "./repo";

/** Comprueba que la petición viene de alguien del equipo (sesión de Supabase en la cabecera Authorization). */
export async function esDelEquipo(req: Request): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const s = db();
  const { data, error } = await s.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return false;
  const { data: fila } = await s.from("equipo").select("email").ilike("email", email).maybeSingle();
  return !!fila;
}
