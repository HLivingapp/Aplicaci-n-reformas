import { NextResponse } from "next/server";
import { miembroLimpio } from "@/lib/miembro";
import { esDelEquipo } from "@/lib/servidor/equipo";
import { db } from "@/lib/servidor/repo";

/** Alta en la comunidad de la app con el email (y, si quiere, teléfono y permiso de contacto). */
const usos = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const ahora = Date.now();
  const lista = (usos.get(ip) ?? []).filter((x) => ahora - x < 3600_000);
  if (lista.length >= 10) return NextResponse.json({ error: "Demasiados intentos. Prueba en un rato." }, { status: 429 });
  lista.push(ahora);
  usos.set(ip, lista);

  const m = miembroLimpio(await req.json().catch(() => null));
  if (!m) return NextResponse.json({ error: "Revisa el email y el teléfono, y acepta la política de privacidad." }, { status: 400 });
  // Si ya era miembro, se actualizan teléfono y permisos sin perder la fecha de alta
  const { error } = await db()
    .from("miembros")
    .upsert({ email: m.email, telefono: m.telefono ?? null, privacidad: m.privacidad, contacto: m.contacto ?? null, actualizado: new Date().toISOString() }, { onConflict: "email" });
  if (error) return NextResponse.json({ error: "No se ha podido completar el registro." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Lista de miembros para el equipo (para contactar solo a quien lo ha autorizado). */
export async function GET(req: Request) {
  if (!(await esDelEquipo(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data, error } = await db().from("miembros").select("email, telefono, privacidad, contacto, creado").order("creado", { ascending: false }).limit(2000);
  if (error) return NextResponse.json({ error: "No se ha podido cargar" }, { status: 500 });
  return NextResponse.json({ miembros: data }, { headers: { "Cache-Control": "no-store" } });
}
