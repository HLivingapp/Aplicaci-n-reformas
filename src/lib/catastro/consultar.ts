import { proveedorPara } from ".";
import type { ResultadoBusqueda } from "./tipos";
import type { Direccion } from "../types";

export interface PeticionCatastro {
  direccion?: Direccion;
  referencia?: string;
  provincia?: string;
}

/** Busca por dirección o por referencia. Se usa en el servidor y, en la demo sin servidor, en el navegador. */
export async function consultarCatastro(body: PeticionCatastro): Promise<{ res: ResultadoBusqueda; status?: number }> {
  const provincia = body.direccion?.provincia ?? body.provincia ?? "";
  const proveedor = proveedorPara(provincia);
  if (!proveedor) {
    return wrap({
      estado: "no_disponible",
      mensaje: "En esta provincia el catastro es foral y todavía no está conectado. Introduce los datos a mano.",
    } satisfies ResultadoBusqueda);
  }

  if (body.referencia) {
    const rc = body.referencia.replace(/\s/g, "").toUpperCase();
    if (!/^[0-9A-Z]{14}([0-9A-Z]{6})?$/.test(rc)) {
      return wrap({ estado: "error", mensaje: "La referencia catastral debe tener 20 caracteres" } satisfies ResultadoBusqueda, { status: 400 });
    }
    try {
      const detalle = await proveedor.detalle(rc);
      if (!detalle) return wrap({ estado: "sin_resultados", mensaje: "No existe esa referencia catastral" } satisfies ResultadoBusqueda);
      return wrap({ estado: "ok", inmuebles: [{ referencia: detalle.referencia, descripcion: detalle.direccion ?? "" }], detalle } satisfies ResultadoBusqueda);
    } catch (e) {
      return wrap({ estado: "error", mensaje: e instanceof Error ? e.message : "Error del Catastro" } satisfies ResultadoBusqueda);
    }
  }

  const d = body.direccion;
  if (!d?.calle?.trim() || !d.numero?.trim() || !d.municipio?.trim()) {
    return wrap({ estado: "error", mensaje: "Faltan calle, número o municipio" } satisfies ResultadoBusqueda, { status: 400 });
  }
  return wrap(await proveedor.buscarPorDireccion(d));
}

function wrap(res: ResultadoBusqueda, init?: { status: number }) {
  return { res, status: init?.status };
}
