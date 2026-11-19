import { catastroEstatal } from "./estatal";
import { normalizar, PROVINCIAS_FORALES } from "./provincias";
import type { ProveedorCatastro } from "./tipos";

/** Elige el catastro que corresponde a la provincia. Devuelve null si aún no está integrado. */
export function proveedorPara(provincia: string): ProveedorCatastro | null {
  if (PROVINCIAS_FORALES.includes(normalizar(provincia))) return null; // TODO: catastros forales
  return catastroEstatal;
}

/** Enlaces útiles para que la empresa revise la ficha. */
export function enlacesCatastro(referencia: string) {
  return {
    ficha: `https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCListaBienes.aspx?rc1=${referencia.slice(0, 7)}&rc2=${referencia.slice(7, 14)}`,
    mapa: `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${referencia.slice(0, 14)}`,
  };
}
