import { NextResponse } from "next/server";
import { registrarProyecto } from "@/lib/publico";
import { cargarTodo, guardarCambios } from "@/lib/servidor/repo";
import { validarContacto, validarProyecto } from "@/lib/servidor/validar";

/** El cliente envía su proyecto desde el formulario público. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const p = validarProyecto(body);
  const c = validarContacto(body?.contacto);
  if (!p || !c || body?.acepto !== true) return NextResponse.json({ mensaje: "Faltan datos o el consentimiento" }, { status: 400 });
  const antes = await cargarTodo();
  const despues = structuredClone(antes);
  const token = registrarProyecto(despues, p.vivienda, p.reforma, c);
  await guardarCambios(antes, despues);
  return NextResponse.json({ token });
}
