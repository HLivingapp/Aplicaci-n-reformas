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
  /** m² construidos de vivienda, sin la parte de zonas comunes. */
  superficie?: number;
  /** m² construidos totales del Catastro (incluye la parte proporcional de zonas comunes). */
  superficieTotal?: number;
  /** m² de zonas comunes atribuidos al inmueble. */
  superficieComunes?: number;
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
