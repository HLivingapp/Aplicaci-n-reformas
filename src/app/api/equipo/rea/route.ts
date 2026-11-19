import { NextResponse } from "next/server";
import { nifValido } from "@/lib/proveedores";
import { esDelEquipo } from "@/lib/servidor/equipo";
import { consultarREA } from "@/lib/servidor/rea";

/** El equipo pide consultar el REA de un NIF/CIF ahora. Devuelve el resultado; lo guarda la propia app del equipo. */
export async function POST(req: Request) {
  if (!(await esDelEquipo(req))) return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 });
  const { nif } = (await req.json().catch(() => ({}))) as { nif?: string };
  if (!nif || !nifValido(nif)) return NextResponse.json({ mensaje: "NIF/CIF no válido" }, { status: 400 });
  return NextResponse.json(await consultarREA(nif.toUpperCase()));
}
