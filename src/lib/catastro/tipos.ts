import type { Direccion } from "../types";

export interface InmuebleCandidato {
  referencia: string;
  descripcion: string;
  escalera?: string;
  planta?: string;
  puerta?: string;
}

export interface DetalleInmueble {
  referencia: string;
  superficie?: number;
  anoConstruccion?: number;
  uso?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
}

export type ResultadoBusqueda =
  | { estado: "ok"; inmuebles: InmuebleCandidato[]; detalle?: DetalleInmueble }
  | { estado: "sin_resultados"; mensaje: string }
  | { estado: "no_disponible"; mensaje: string }
  | { estado: "error"; mensaje: string };

/** Cada catastro (estatal, forales…) implementa esta interfaz. */
export interface ProveedorCatastro {
  nombre: string;
  buscarPorDireccion(d: Direccion): Promise<ResultadoBusqueda>;
  detalle(referencia: string): Promise<DetalleInmueble | null>;
}
