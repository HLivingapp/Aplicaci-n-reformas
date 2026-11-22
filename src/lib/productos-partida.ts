import type { NivelMaterial } from "./types";

/**
 * Productos concretos del catálogo de gama media (ver gama-media.ts) con los que se calcula cada partida.
 * Solo identificadores: la ficha (foto, marca, modelo y precio público orientativo) se resuelve en la interfaz.
 * En gama básica y premium se muestra la especificación de equipos (marca «o similar»).
 */
const PRODUCTOS_MEDIA: Record<string, string[]> = {
  equip_bano: ["salgar-noja", "roca-gap", "imex-bano", "kassandra-delta"],
  cocina: ["alvic-luxe", "ascale", "imex-cocina"],
  electrodomesticos: ["balay"],
  suelo_laminado: ["meister-lc150"],
  ventana: ["cortizo"],
  ventanal: ["cortizo"],
  elec_completa: ["simon-27"],
};

export function productosDePartida(tarifaId: string, nivel: NivelMaterial): string[] | undefined {
  return nivel === "medio" ? PRODUCTOS_MEDIA[tarifaId] : undefined;
}
