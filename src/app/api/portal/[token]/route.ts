import { NextResponse } from "next/server";
import { vistaPortal } from "@/lib/publico";
import { cargarTodo } from "@/lib/servidor/repo";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-z0-9-]{20,80}$/.test(token)) return NextResponse.json({ mensaje: "Enlace no válido" }, { status: 404 });
  const vista = vistaPortal(await cargarTodo(), token);
  if (!vista) return NextResponse.json({ mensaje: "Enlace no válido" }, { status: 404 });
  return NextResponse.json(vista, { headers: { "Cache-Control": "no-store" } });
}
