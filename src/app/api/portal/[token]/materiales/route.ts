import { NextResponse } from "next/server";
import { elegirMateriales } from "@/lib/publico";
import { cargarTodo, guardarCambios } from "@/lib/servidor/repo";

/** El cliente elige los acabados de su proyecto desde su enlace privado. */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  if (!/^[a-z0-9-]{20,80}$/.test(token) || typeof body?.proyectoId !== "string") return NextResponse.json({ mensaje: "Datos no válidos" }, { status: 400 });
  const antes = await cargarTodo();
  const despues = structuredClone(antes);
  const ok = elegirMateriales(despues, token, body.proyectoId, body.materiales);
  if (ok) await guardarCambios(antes, despues);
  return NextResponse.json({ ok });
}
