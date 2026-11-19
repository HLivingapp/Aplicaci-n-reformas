import { NextResponse } from "next/server";
import { vistaProveedor } from "@/lib/proveedores";
import { cargarTodo } from "@/lib/servidor/repo";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const v = /^[a-f0-9]{32}$/.test(token) ? vistaProveedor(await cargarTodo(), token) : null;
  if (!v) return NextResponse.json({ mensaje: "Enlace no válido" }, { status: 404 });
  return NextResponse.json(v, { headers: { "Cache-Control": "no-store" } });
}
