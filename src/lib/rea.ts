/**
 * Lectura de la consulta pública del Registro de Empresas Acreditadas (REA) del
 * Ministerio de Trabajo, que reúne los registros de todas las comunidades autónomas.
 * Función pura: el servidor hace la petición y aquí solo se interpreta la respuesta.
 */
export const URL_CONSULTA_REA = "https://expinterweb.mites.gob.es/rea/pub/consulta.htm";

export interface ResultadoREA {
  /** alta: inscrita y en vigor · baja: consta pero no en alta · no_consta · error: no se pudo consultar */
  resultado: "alta" | "baja" | "no_consta" | "error";
  razonSocial?: string;
  numero?: string;
  estado?: string;
  autonomia?: string;
  fecha: string;
}

/** Tipo de identificador que espera el formulario del REA. */
export function tipoIdentificadorREA(nif: string): "1" | "2" | "3" {
  if (/^\d{8}[A-Z]$/.test(nif)) return "1";
  if (/^[XYZ]/.test(nif)) return "2";
  return "3";
}

const limpiar = (s: string) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export function parsearREA(html: string, fecha = new Date().toISOString()): ResultadoREA {
  if (/No consta la acreditaci/i.test(html)) return { resultado: "no_consta", fecha };
  const campos = new Map<string, string>();
  for (const m of html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>\s*(?:\s|<!--[\s\S]*?-->)*<td[^>]*>([\s\S]*?)<\/td>/gi)) campos.set(limpiar(m[1]).toLowerCase(), limpiar(m[2]));
  const de = (prefijo: string) => [...campos].find(([k]) => k.startsWith(prefijo))?.[1];
  const razonSocial = de("nombre/raz");
  const numero = de("número de inscripción") ?? de("número de inscripci") ?? [...campos].find(([k]) => k.includes("inscripci") && k.includes("rea"))?.[1];
  const estado = [...campos].find(([k]) => k.startsWith("estado de inscripci"))?.[1];
  if (!razonSocial && !estado) return { resultado: "error", fecha };
  const autonomia = [...campos].find(([k]) => k.startsWith("autonom"))?.[1];
  return { resultado: estado?.toUpperCase() === "ALTA" ? "alta" : "baja", razonSocial, numero, estado, autonomia, fecha };
}

/** Compara nombres de empresa sin tildes, puntuación ni forma jurídica. */
export function mismoNombre(a: string, b: string) {
  const n = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, " ")
      .replace(/\b(S ?L ?U?|S ?A ?U?|SOCIEDAD LIMITADA|SOCIEDAD ANONIMA|SLL|SLNE|SCOOP|COOP|CB|SC)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const x = n(a);
  const y = n(b);
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
}
