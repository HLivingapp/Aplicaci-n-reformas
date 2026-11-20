import { NextResponse } from "next/server";
import { accionObraCliente } from "@/lib/obra";
import { cargarTodo, guardarCambios } from "@/lib/servidor/repo";

/** El cliente confirma pagos de hitos, acepta o rechaza extras y valora fases desde su enlace. */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  if (!/^[a-z0-9-]{20,80}$/.test(token) || typeof body?.obraId !== "string" || typeof body?.accion?.tipo !== "string") return NextResponse.json({ mensaje: "Datos no válidos" }, { status: 400 });
  const antes = await cargarTodo();
  const despues = structuredClone(antes);
  const ok = accionObraCliente(despues, token, body.obraId, body.accion);
  if (ok) await guardarCambios(antes, despues);
  return NextResponse.json({ ok });
}
