import { NextResponse } from "next/server";
import { responderPresupuesto } from "@/lib/publico";
import { cargarTodo, guardarCambios } from "@/lib/servidor/repo";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  if (typeof body?.presupuestoId !== "string" || typeof body?.acepta !== "boolean") return NextResponse.json({ mensaje: "Datos no válidos" }, { status: 400 });
  const antes = await cargarTodo();
  const despues = structuredClone(antes);
  const ok = responderPresupuesto(despues, token, body.presupuestoId, body.acepta, String(body.comentario ?? ""));
  if (ok) await guardarCambios(antes, despues);
  return NextResponse.json({ ok });
}
