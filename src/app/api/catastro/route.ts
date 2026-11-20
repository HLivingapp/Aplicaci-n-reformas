import { NextResponse } from "next/server";
import { consultarCatastro, type PeticionCatastro } from "@/lib/catastro/consultar";
import type { ResultadoBusqueda } from "@/lib/catastro/tipos";

/** POST { direccion } → busca el inmueble. POST { referencia, provincia } → detalle de una referencia. */
export async function POST(req: Request) {
  let body: PeticionCatastro;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ estado: "error", mensaje: "Petición no válida" } satisfies ResultadoBusqueda, { status: 400 });
  }
  const { res, status } = await consultarCatastro(body);
  return NextResponse.json(res, status ? { status } : undefined);
}
