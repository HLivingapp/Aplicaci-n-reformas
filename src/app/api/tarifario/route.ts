import { NextResponse } from "next/server";
import { vistaProveedor } from "@/lib/proveedores";
import { cargarTodo } from "@/lib/servidor/repo";
import { extraerLineasPresupuesto, iaConfigurada, type DocumentoPresupuesto } from "@/lib/servidor/ia";

/**
 * Lee un presupuesto del reformista con IA y devuelve sus líneas de obra (texto tabulado, sin datos del cliente).
 * El documento no se guarda: se procesa y se descarta. Solo para reformistas con enlace válido.
 */
const usos = new Map<string, number[]>();
const TIPOS = ["application/pdf", "image/jpeg", "image/png"] as const;

export async function POST(req: Request) {
  if (!iaConfigurada()) return NextResponse.json({ error: "La lectura con IA no está configurada todavía. Sube el presupuesto en CSV o pega sus líneas." }, { status: 503 });
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!/^[a-f0-9]{32}$/.test(token) || !vistaProveedor(await cargarTodo(), token)) return NextResponse.json({ error: "Enlace no válido" }, { status: 403 });
  const ahora = Date.now();
  const lista = (usos.get(token) ?? []).filter((x) => ahora - x < 3600_000);
  if (lista.length >= 40) return NextResponse.json({ error: "Has subido muchos presupuestos seguidos. Prueba en un rato." }, { status: 429 });
  lista.push(ahora);
  usos.set(token, lista);

  let doc: DocumentoPresupuesto;
  if (typeof body?.texto === "string" && body.texto.trim()) doc = { texto: body.texto };
  else if (TIPOS.includes(body?.mediaType) && typeof body?.base64 === "string" && body.base64.length < 14_000_000) doc = { mediaType: body.mediaType, base64: body.base64 };
  else return NextResponse.json({ error: "Sube un PDF, una foto o el texto del presupuesto." }, { status: 400 });
  try {
    return NextResponse.json({ lineas: await extraerLineasPresupuesto(doc) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "No se ha podido leer el presupuesto" }, { status: 500 });
  }
}
