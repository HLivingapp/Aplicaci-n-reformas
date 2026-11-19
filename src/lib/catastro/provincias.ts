/**
 * Provincias con el nombre que usa la Sede Electrónica del Catastro.
 * Las provincias forales (Álava, Bizkaia, Gipuzkoa y Navarra) tienen catastro propio.
 */
export const PROVINCIAS = [
  "A CORUÑA", "ALBACETE", "ALICANTE", "ALMERIA", "ASTURIAS", "AVILA", "BADAJOZ", "BARCELONA", "BURGOS", "CACERES",
  "CADIZ", "CANTABRIA", "CASTELLON", "CEUTA", "CIUDAD REAL", "CORDOBA", "CUENCA", "GIRONA", "GRANADA", "GUADALAJARA",
  "HUELVA", "HUESCA", "ILLES BALEARS", "JAEN", "LA RIOJA", "LAS PALMAS", "LEON", "LLEIDA", "LUGO", "MADRID", "MALAGA",
  "MELILLA", "MURCIA", "OURENSE", "PALENCIA", "PONTEVEDRA", "SALAMANCA", "S.C. TENERIFE", "SEGOVIA", "SEVILLA", "SORIA",
  "TARRAGONA", "TERUEL", "TOLEDO", "VALENCIA", "VALLADOLID", "ZAMORA", "ZARAGOZA",
  "ARABA/ALAVA", "BIZKAIA", "GIPUZKOA", "NAVARRA",
];

export const PROVINCIAS_FORALES = ["ARABA/ALAVA", "BIZKAIA", "GIPUZKOA", "NAVARRA"];

export const TIPOS_VIA = [
  { sigla: "CL", texto: "Calle" },
  { sigla: "AV", texto: "Avenida" },
  { sigla: "PZ", texto: "Plaza" },
  { sigla: "PS", texto: "Paseo" },
  { sigla: "CR", texto: "Carretera" },
  { sigla: "CM", texto: "Camino" },
  { sigla: "RD", texto: "Ronda" },
  { sigla: "GL", texto: "Glorieta" },
  { sigla: "TR", texto: "Travesía" },
  { sigla: "UR", texto: "Urbanización" },
];

/** Mayúsculas sin tildes, como espera el Catastro. Mantiene la Ñ. */
export function normalizar(s: string) {
  return s
    .toUpperCase()
    .replace(/Ñ/g, "\u0000")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0000/g, "Ñ")
    .replace(/\s+/g, " ")
    .trim();
}
