/**
 * Tarifario detallado a partir de presupuestos reales del reformista.
 * El reformista sube unos 20 presupuestos que haya hecho; la app saca sus líneas (descripción, unidad, cantidad y precio),
 * las empareja con las partidas del presupuesto de referencia y deduce su precio por partida (la mediana de lo que cobra).
 * RGPD: los presupuestos llevan datos de clientes. Se extraen solo las líneas de obra, se ocultan nombres, direcciones,
 * teléfonos, emails y NIF, y el documento original no se guarda.
 */
import { sinContactos } from "./anonimizar";
import { tarifasPorDefecto, ventaUnidad } from "./tarifas";
import type { TarifaReformista } from "./types";

export const PRESUPUESTOS_RECOMENDADOS = 20;

export interface LineaPresupuesto {
  descripcion: string;
  unidad: string;
  cantidad: number;
  /** Precio unitario sin IVA */
  precio: number;
  /** Partida de referencia con la que se ha emparejado (null = sin emparejar) */
  partidaId: string | null;
}

export interface PresupuestoLeido {
  id: string;
  /** Nombre neutro: «Presupuesto 1» (nunca el nombre del archivo, que suele llevar el del cliente) */
  nombre: string;
  lineas: LineaPresupuesto[];
  /** Líneas descartadas por parecer datos personales o cabeceras */
  descartadas: number;
}

export interface PartidaDeducida {
  partidaId: string;
  capitulo: string;
  descripcion: string;
  unidad: string;
  /** Precio de venta de referencia de la app */
  referencia: number;
  /** Mediana de lo que cobra el reformista */
  precio: number;
  min: number;
  max: number;
  /** En cuántas líneas de sus presupuestos aparece */
  muestras: number;
  /** El reformista lo ha corregido a mano */
  manual?: boolean;
}

// ---------- Datos personales ----------

const CABECERA_PERSONAL = /^\s*(cliente|nombre|sr\.?|sra\.?|d\.|dña\.?|don|doña|att\.?|atenci[oó]n|direcci[oó]n|domicilio|obra en|situaci[oó]n|emplazamiento|dni|nif|cif|tel[eé]fono|tlf|m[oó]vil|email|e-mail|correo|c\.?\s?p\.?|poblaci[oó]n|localidad|provincia|referencia catastral|presupuesto n[ºo°]?|fecha)\b/i;
const DIRECCION = /\b(c\/|calle|cl\.|avda\.?|avenida|av\.|plaza|pza\.?|paseo|p[ºo]\.?|camino|ronda|glorieta|travesía|urbanizaci[oó]n|portal|escalera|piso|planta)\s+[^\s,;]+(?:\s+[^\s,;]+){0,4}(?:,?\s*(?:n[ºo°.]?\s*)?\d+[a-z]?)?/gi;
const CODIGO_POSTAL = /\b(?:28|29|08|46|41)\d{3}\b/g;

/** Quita de una descripción todo lo que pueda identificar al cliente o la vivienda. */
export function limpiarDescripcion(t: string): string {
  return sinContactos(t.replace(DIRECCION, "[dirección oculta]").replace(CODIGO_POSTAL, "[CP]"))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

export const esLineaPersonal = (t: string) => CABECERA_PERSONAL.test(t);

// ---------- Lectura de líneas ----------

const UNIDADES: Record<string, string> = {
  m2: "m²", "m²": "m²", mt2: "m²", "m2c": "m²c", "m²c": "m²c", ml: "ml", "m.l.": "ml", m: "ml", ud: "ud", u: "ud", uds: "ud", unidad: "ud", unidades: "ud",
  pa: "pa", "p.a.": "pa", partida: "pa", kg: "kg", h: "h", hora: "h", horas: "h", m3: "m³", "m³": "m³", pto: "ud", ptos: "ud", punto: "ud", puntos: "ud",
};
const normalUnidad = (u: string) => UNIDADES[u.toLowerCase().replace(/\s/g, "")] ?? null;

/** «1.234,56» o «1234.56» o «1,5» → número */
export function numeroES(s: string): number {
  const t = s.replace(/[€\s]/g, "");
  if (!/\d/.test(t)) return NaN;
  if (t.includes(",") && t.includes(".")) return t.lastIndexOf(",") > t.lastIndexOf(".") ? Number(t.replace(/\./g, "").replace(",", ".")) : Number(t.replace(/,/g, ""));
  if (t.includes(",")) return Number(t.replace(",", "."));
  // «1.234» con tres decimales es un millar
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ""));
  return Number(t);
}

const NUM = String.raw`[\d.,]+\s*€?`;
const LINEA_TEXTO = new RegExp(String.raw`^(.*?\S)\s+(m2c?|m²c?|mt2|ml|m\.l\.|m|uds?|u|unidad(?:es)?|p\.?a\.?|partida|kg|h|horas?|m3|m³|ptos?|puntos?)\.?\s+(${NUM})\s+(${NUM})(?:\s+(${NUM}))?\s*$`, "i");

/** Lee una línea con descripción, unidad, cantidad, precio unitario e importe (texto, CSV o Excel copiado). */
export function leerLinea(cruda: string): Omit<LineaPresupuesto, "partidaId"> | null {
  const t = cruda.replace(/ /g, " ").trim();
  if (!t || esLineaPersonal(t)) return null;
  // CSV / tabulado / punto y coma
  const sep = t.includes("\t") ? "\t" : t.includes(";") ? ";" : null;
  if (sep) {
    const c = t.split(sep).map((x) => x.trim().replace(/^"|"$/g, ""));
    const iu = c.findIndex((x) => normalUnidad(x));
    if (iu > 0) {
      const nums = c.slice(iu + 1).map(numeroES).filter((n) => Number.isFinite(n));
      const desc = c.slice(0, iu).filter((x) => !/^[\d.]+$/.test(x)).join(" ");
      if (desc && nums.length >= 2) return cuadrar(desc, normalUnidad(c[iu])!, nums);
    }
    return null;
  }
  const m = t.match(LINEA_TEXTO);
  if (!m) return null;
  const nums = [m[3], m[4], m[5]].filter(Boolean).map(numeroES);
  return cuadrar(m[1].replace(/^[\d.]+\s+/, ""), normalUnidad(m[2])!, nums);
}

/** Cantidad y precio: si hay importe, se comprueba que cantidad × precio ≈ importe. */
function cuadrar(desc: string, unidad: string, nums: number[]): Omit<LineaPresupuesto, "partidaId"> | null {
  const cantidad = nums[0];
  let precio = nums[1];
  const importe = nums[2];
  if (importe && cantidad && Math.abs(cantidad * precio - importe) > importe * 0.05 && Math.abs((importe / cantidad) - precio) > 0.01) precio = importe / cantidad;
  if (!(cantidad > 0) || !(precio > 0) || precio > 100_000) return null;
  return { descripcion: limpiarDescripcion(desc), unidad, cantidad: Math.round(cantidad * 100) / 100, precio: Math.round(precio * 100) / 100 };
}

// ---------- Emparejar con las partidas de referencia ----------

const VACIAS = new Set("de del la el los las y en con para por a o al un una sin incluye incluido segun según tipo hasta mm cm m2 ml ud".split(" "));
const palabras = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ ]/g, " ").split(/\s+/).filter((p) => p.length > 2 && !VACIAS.has(p)).map((p) => p.replace(/(es|s)$/, ""));

/** Partidas de referencia con su precio de venta por unidad. */
export function partidasReferencia() {
  const t = tarifasPorDefecto();
  return t.precios.map((p) => ({ id: p.id, capitulo: p.capitulo, descripcion: p.descripcion, unidad: p.unidad, precio: ventaUnidad(t, p), claves: new Set(palabras(p.descripcion)) }));
}

const compatible = (a: string, b: string) => a === b || (a.startsWith("m²") && b.startsWith("m²"));

/** La partida de referencia que más se parece (palabras en común y misma unidad). */
export function emparejar(desc: string, unidad: string, ref = partidasReferencia()): string | null {
  const ps = palabras(desc);
  if (!ps.length) return null;
  let mejor: { id: string; s: number } | null = null;
  for (const r of ref) {
    if (!compatible(unidad, r.unidad)) continue;
    const comunes = ps.filter((p) => r.claves.has(p)).length;
    const s = comunes / Math.sqrt(ps.length * Math.max(1, r.claves.size));
    if (comunes >= 2 || (comunes === 1 && ps.length <= 3)) if (!mejor || s > mejor.s) mejor = { id: r.id, s };
  }
  return mejor && mejor.s >= 0.25 ? mejor.id : null;
}

/** Lee todo el texto de un presupuesto: solo líneas de obra, anonimizadas y emparejadas. */
export function leerPresupuesto(texto: string, n: number, ref = partidasReferencia()): PresupuestoLeido {
  let descartadas = 0;
  const lineas: LineaPresupuesto[] = [];
  for (const cruda of texto.split(/\r?\n/)) {
    if (!cruda.trim()) continue;
    const l = leerLinea(cruda);
    if (!l) { descartadas++; continue; }
    lineas.push({ ...l, partidaId: emparejar(l.descripcion, l.unidad, ref) });
  }
  return { id: `pres-${n}-${Date.now().toString(36)}`, nombre: `Presupuesto ${n}`, lineas, descartadas };
}

// ---------- Deducir el tarifario ----------

const mediana = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const r2 = (n: number) => Math.round(n * 100) / 100;

export function deducirPartidas(presupuestos: PresupuestoLeido[], ref = partidasReferencia()): PartidaDeducida[] {
  const por = new Map<string, number[]>();
  for (const p of presupuestos) for (const l of p.lineas) if (l.partidaId) por.set(l.partidaId, [...(por.get(l.partidaId) ?? []), l.precio]);
  return [...por].map(([id, precios]) => {
    const r = ref.find((x) => x.id === id)!;
    return { partidaId: id, capitulo: r.capitulo, descripcion: r.descripcion, unidad: r.unidad, referencia: r.precio, precio: r2(mediana(precios)), min: Math.min(...precios), max: Math.max(...precios), muestras: precios.length };
  }).sort((a, b) => a.capitulo.localeCompare(b.capitulo) || b.muestras - a.muestras);
}

/** Tarifa final: precio propio en cada partida deducida y, para el resto, el % por capítulo que sale de ellas. */
export function tarifaDesdePartidas(partidas: PartidaDeducida[], presupuestos: number): TarifaReformista {
  const pct = (p: PartidaDeducida) => (p.precio / p.referencia - 1) * 100;
  const capitulos: Record<string, number> = {};
  for (const cap of new Set(partidas.map((p) => p.capitulo))) capitulos[cap] = Math.round(mediana(partidas.filter((p) => p.capitulo === cap).map(pct)));
  return {
    general: partidas.length ? Math.round(mediana(partidas.map(pct))) : 0,
    capitulos,
    partidas: Object.fromEntries(partidas.map((p) => [p.partidaId, p.precio])),
    origen: { presupuestos, partidas: partidas.length },
    actualizado: new Date().toISOString(),
  };
}

// ---------- Demostración: presupuestos de ejemplo (inventados) ----------

/** Genera presupuestos de ejemplo con cabecera de cliente ficticia, para enseñar cómo se anonimizan. */
export function presupuestosEjemplo(n = PRESUPUESTOS_RECOMENDADOS): string[] {
  const ref = partidasReferencia();
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  const nombres = ["Laura Gómez", "Pedro Sanz", "Marta Ruiz", "Javier Moreno", "Ana López"];
  const calles = ["Calle de Toledo 45", "Paseo de las Delicias 12", "Avenida de América 30", "Calle Bravo Murillo 101", "Plaza de Olavide 3"];
  // Cada reformista tiene su nivel de precios y especialidades más baratas
  const nivel = 0.92 + azar() * 0.16;
  return Array.from({ length: n }, (_, i) => {
    const cab = [`PRESUPUESTO Nº 2026-${100 + i}`, `Cliente: ${nombres[i % 5]}`, `Dirección: ${calles[i % 5]}, 28015 Madrid`, `Teléfono: 6${String(10000000 + i * 1234567).slice(0, 8)}`, ""];
    const lineas = ref.filter(() => azar() < 0.35).slice(0, 18).map((r) => {
      const cant = r.unidad === "pa" ? 1 : r.unidad === "ud" ? 1 + Math.floor(azar() * 6) : Math.round((5 + azar() * 80) * 10) / 10;
      const precio = Math.round(r.precio * nivel * (0.9 + azar() * 0.2) * 100) / 100;
      const unidad = r.unidad.replace("m²c", "m2").replace("m²", "m2");
      return `${r.descripcion}\t${unidad}\t${String(cant).replace(".", ",")}\t${precio.toFixed(2).replace(".", ",")}\t${(cant * precio).toFixed(2).replace(".", ",")}`;
    });
    return [...cab, ...lineas, "", "TOTAL SIN IVA", "Forma de pago: 30% a la firma"].join("\n");
  });
}
