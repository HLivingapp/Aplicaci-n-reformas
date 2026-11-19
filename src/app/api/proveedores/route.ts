import { NextResponse } from "next/server";
import { registrarProveedor } from "@/lib/proveedores";
import { cargarTodo, guardarCambios } from "@/lib/servidor/repo";
import { validarAlta } from "@/lib/servidor/validar";

/** Un reformista envía su cuestionario de homologación. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const alta = validarAlta(body?.alta);
  if (!alta || body?.acepto !== true || body?.declaro !== true)
    return NextResponse.json({ mensaje: "Faltan datos obligatorios, la declaración responsable o el consentimiento" }, { status: 400 });
  const antes = await cargarTodo();
  if (antes.proveedores.some((p) => p.nif === alta.nif)) return NextResponse.json({ mensaje: "Ya hay una solicitud con este NIF. Usa tu enlace privado o escríbenos." }, { status: 409 });
  const despues = structuredClone(antes);
  const token = registrarProveedor(despues, alta);
  await guardarCambios(antes, despues);
  return NextResponse.json({ token });
}
