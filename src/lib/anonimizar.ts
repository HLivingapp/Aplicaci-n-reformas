/**
 * Lo que ve el cliente de un reformista antes de firmar es anónimo: ni nombre, ni NIF/CIF, ni contactos.
 * Este filtro oculta en los textos teléfonos, emails, webs, redes sociales, NIF/CIF y el nombre o razón social del propio reformista.
 * Se aplica al guardar (para avisar al reformista) y otra vez al enseñarlo (por si acaso).
 */
export const OCULTO = "[dato oculto]";

const PATRONES: RegExp[] = [
  /[\w.+-]+@[\w-]+(\.[\w-]+)+/gi, // email
  /\b(?:https?:\/\/|www\.)\S+/gi, // web
  /\b[\w-]+\.(?:es|com|net|org|eu|info|biz|cat|madrid)\b(?:\/\S*)?/gi, // dominio suelto
  /(?:^|\s)@[\w.]{3,}/g, // usuario de redes
  /\b(?:instagram|facebook|tiktok|linkedin|youtube|whatsapp|telegram|twitter|x\.com)\b[^\s,.;]*/gi,
  /(?:\+?34[\s.-]?)?(?:[6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|[6789]\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2})\b/g, // teléfono español
  /\b[A-HJNP-SUVW][\s.-]?\d{7}[\s.-]?[0-9A-J]\b/gi, // CIF
  /\b[XYZ]?\d{7,8}[\s.-]?[A-Z]\b/gi, // NIF / NIE
  /(?:\d[\s.\-_/()*,]*){9,}/g, // teléfono con trucos: 6 1 2 . 3 4 5 . 6 7 8
  /\b(?:arroba|gmail|hotmail|outlook|yahoo|icloud|punto\s*com|punto\s*es)\b/gi, // email escrito con letras
  /\b(?:wasap|guasap|whats|wsp|tlf|telf|m[oó]vil|ll[aá]mame|escr[ií]beme|mi\s+n[uú]mero|mi\s+tel[eé]fono|mi\s+correo)\b/gi,
];

const CIFRAS = "cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieci\\w+|veinti?\\w*|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cien|ciento|doscientos|trescientos|cuatrocientos|quinientos|seiscientos|setecientos|ochocientos|novecientos";
/** Teléfono escrito con letras o mezclando letras y cifras: «seis uno dos tres…» (5 o más cifras seguidas). */
const NUMEROS_EN_LETRA = new RegExp(`(?:\\b(?:${CIFRAS}|\\d+)\\b[\\s,.\\-y]*){5,}`, "gi");

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Palabras del nombre propio que no son genéricas (S.L., reformas, construcciones…). */
const GENERICAS = new Set(["sl", "s.l.", "slu", "s.l.u.", "sa", "s.a.", "sociedad", "limitada", "reformas", "reforma", "construcciones", "obras", "servicios", "grupo", "y", "de", "del", "la", "el", "los", "las", "e", "hijos"]);

export interface Identidad { razonSocial?: string; nif?: string; contacto?: string; web?: string; email?: string; telefono?: string }

export function anonimizar(texto: string, id: Identidad = {}): { texto: string; ocultos: number } {
  let t = texto ?? "";
  let ocultos = 0;
  const tapar = (re: RegExp) => {
    t = t.replace(re, (m) => {
      ocultos++;
      return (m.match(/^\s/) ? " " : "") + OCULTO;
    });
  };
  for (const re of PATRONES) tapar(new RegExp(re.source, re.flags));
  tapar(NUMEROS_EN_LETRA);
  // Nombre completo y palabras distintivas del nombre o del contacto
  for (const nombre of [id.razonSocial, id.contacto].filter(Boolean) as string[]) {
    tapar(new RegExp(escapar(nombre.trim()), "gi"));
    for (const p of nombre.split(/[\s,]+/).filter((p) => p.length >= 4 && !GENERICAS.has(p.toLowerCase()))) tapar(new RegExp(`\\b${escapar(p)}\\b`, "gi"));
  }
  for (const dato of [id.nif, id.email, id.telefono, id.web].filter((x) => x && x.trim().length >= 5) as string[]) tapar(new RegExp(escapar(dato.trim()), "gi"));
  t = t.replace(new RegExp(`(${escapar(OCULTO)}\\s*){2,}`, "g"), OCULTO + " ");
  return { texto: t.trim(), ocultos };
}

export const sinContactos = (texto: string, id?: Identidad) => anonimizar(texto, id).texto;
