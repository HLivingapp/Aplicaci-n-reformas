import { NextResponse } from "next/server";
import { aplicarREA } from "@/lib/proveedores";
import { consultarREA } from "@/lib/servidor/rea";
import { cargarTodo, guardarCambios } from "@/lib/servidor/repo";

const DIAS = 25;
const MAXIMO_POR_VEZ = 40;

/**
 * Tarea diaria (Vercel Cron): vuelve a consultar el REA de los reformistas activos cuya
 * última comprobación tiene más de 25 días. Si alguno ya no está en alta, deja de
 * cumplir los requisitos y deja de mostrarse a los clientes.
 */
export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 });
  const antes = await cargarTodo();
  const despues = structuredClone(antes);
  const limite = Date.now() - DIAS * 86400000;
  const pendientes = despues.proveedores
    .filter((p) => (p.estado === "aprobado" || p.estado === "pendiente") && (!p.reaVerificado || Date.parse(p.reaVerificado.fecha) < limite))
    .slice(0, MAXIMO_POR_VEZ);
  for (const p of pendientes) {
    aplicarREA(p, await consultarREA(p.nif));
    await new Promise((r) => setTimeout(r, 500)); // sin saturar el servicio del Ministerio
  }
  await guardarCambios(antes, despues);
  return NextResponse.json({ comprobados: pendientes.length });
}
