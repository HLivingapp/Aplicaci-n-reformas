import { NextResponse } from "next/server";
import { cargarTodo } from "@/lib/servidor/repo";
import { galeriaPara } from "@/lib/servidor/galeria";
import { validarProyecto } from "@/lib/servidor/validar";

export async function POST(req: Request) {
  const ok = validarProyecto(await req.json().catch(() => null));
  if (!ok) return NextResponse.json({ mensaje: "Datos no válidos" }, { status: 400 });
  try {
    return NextResponse.json(await galeriaPara(await cargarTodo(), ok.vivienda, ok.reforma));
  } catch {
    return NextResponse.json({ parecidas: [], fases: [] });
  }
}
