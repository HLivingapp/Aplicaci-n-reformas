import { NextResponse } from "next/server";
import { estimacionPublica } from "@/lib/publico";
import { cargarTodo } from "@/lib/servidor/repo";
import { validarProyecto } from "@/lib/servidor/validar";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const d = await cargarTodo();
  const ok = validarProyecto(body, d.tarifas.materiales);
  if (!ok) return NextResponse.json({ mensaje: "Datos no válidos" }, { status: 400 });
  return NextResponse.json(estimacionPublica(ok.vivienda, ok.reforma, d.tarifas));
}
