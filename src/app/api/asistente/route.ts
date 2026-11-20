import { NextResponse } from "next/server";
import { asistenteObra, iaConfigurada, type TurnoChat } from "@/lib/servidor/ia";

/**
 * Asistente IA del plan Pro. Hasta que el cobro con Stripe esté conectado, solo se abre si el
 * servidor tiene ASISTENTE_ABIERTO=1 (para pruebas de la empresa); después se comprobará la suscripción.
 */
const usos = new Map<string, number[]>();

export async function POST(req: Request) {
  if (!iaConfigurada()) return NextResponse.json({ error: "El asistente IA no está configurado todavía." }, { status: 503 });
  if (process.env.ASISTENTE_ABIERTO !== "1") return NextResponse.json({ error: "El asistente IA está disponible con el plan Pro." }, { status: 402 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const ahora = Date.now();
  const lista = (usos.get(ip) ?? []).filter((x) => ahora - x < 3600_000);
  if (lista.length >= 30) return NextResponse.json({ error: "Has hecho muchas preguntas seguidas. Prueba en un rato." }, { status: 429 });
  lista.push(ahora);
  usos.set(ip, lista);

  const body = await req.json().catch(() => null);
  const historial: TurnoChat[] = Array.isArray(body?.historial)
    ? body.historial
        .filter((t: TurnoChat) => (t?.rol === "usuario" || t?.rol === "asistente") && typeof t.texto === "string" && t.texto.trim())
        .slice(-12)
        .map((t: TurnoChat) => ({ rol: t.rol, texto: t.texto.slice(0, 8000) }))
    : [];
  if (!historial.length || historial[historial.length - 1].rol !== "usuario") return NextResponse.json({ error: "Escribe tu pregunta." }, { status: 400 });
  try {
    return NextResponse.json({ respuesta: await asistenteObra(historial) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "No se ha podido responder" }, { status: 500 });
  }
}
