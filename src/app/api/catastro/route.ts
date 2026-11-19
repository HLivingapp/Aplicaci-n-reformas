import { NextResponse } from "next/server";
import { proveedorPara } from "@/lib/catastro";
import type { ResultadoBusqueda } from "@/lib/catastro/tipos";
import type { Direccion } from "@/lib/types";

/** POST { direccion } → busca el inmueble. POST { referencia, provincia } → detalle de una referencia. */
export async function POST(req: Request) {
  let body: { direccion?: Direccion; referencia?: string; provincia?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ estado: "error", mensaje: "Petición no válida" } satisfies ResultadoBusqueda, { status: 400 });
  }

  const provincia = body.direccion?.provincia ?? body.provincia ?? "";
  const proveedor = proveedorPara(provincia);
  if (!proveedor) {
    return NextResponse.json({
      estado: "no_disponible",
      mensaje: "En esta provincia el catastro es foral y todavía no está conectado. Introduce los datos a mano.",
    } satisfies ResultadoBusqueda);
  }

  if (body.referencia) {
    const rc = body.referencia.replace(/\s/g, "").toUpperCase();
    if (!/^[0-9A-Z]{14}([0-9A-Z]{6})?$/.test(rc)) {
      return NextResponse.json({ estado: "error", mensaje: "La referencia catastral debe tener 20 caracteres" } satisfies ResultadoBusqueda, { status: 400 });
    }
    try {
      const detalle = await proveedor.detalle(rc);
      if (!detalle) return NextResponse.json({ estado: "sin_resultados", mensaje: "No existe esa referencia catastral" } satisfies ResultadoBusqueda);
      return NextResponse.json({ estado: "ok", inmuebles: [{ referencia: detalle.referencia, descripcion: detalle.direccion ?? "" }], detalle } satisfies ResultadoBusqueda);
    } catch (e) {
      return NextResponse.json({ estado: "error", mensaje: e instanceof Error ? e.message : "Error del Catastro" } satisfies ResultadoBusqueda);
    }
  }

  const d = body.direccion;
  if (!d?.calle?.trim() || !d.numero?.trim() || !d.municipio?.trim()) {
    return NextResponse.json({ estado: "error", mensaje: "Faltan calle, número o municipio" } satisfies ResultadoBusqueda, { status: 400 });
  }
  return NextResponse.json(await proveedor.buscarPorDireccion(d));
}
