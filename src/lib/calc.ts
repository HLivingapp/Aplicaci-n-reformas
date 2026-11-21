import type { Capitulo, Fase, Obra, Partida, Presupuesto } from "./types";

const r2 = (n: number) => Math.round(n * 100) / 100;

export const totalPartida = (p: Partida) => r2(p.cantidad * p.precio);
export const costePartida = (p: Partida) => r2(p.cantidad * p.coste);
export const totalCapitulo = (c: Capitulo) => r2(c.partidas.reduce((s, p) => s + totalPartida(p), 0));

export function totales(pr: Presupuesto) {
  const bruto = r2(pr.capitulos.reduce((s, c) => s + totalCapitulo(c), 0));
  const descuento = r2((bruto * pr.descuentoPct) / 100);
  const base = r2(bruto - descuento);
  const iva = r2((base * pr.ivaPct) / 100);
  const total = r2(base + iva);
  const coste = r2(pr.capitulos.reduce((s, c) => s + c.partidas.reduce((a, p) => a + costePartida(p), 0), 0));
  const beneficio = r2(base - coste);
  const margenPct = base > 0 ? r2((beneficio / base) * 100) : 0;
  return { bruto, descuento, base, iva, total, coste, beneficio, margenPct };
}

export function avanceFase(f: Fase) {
  if (f.estado === "terminada") return 100;
  if (!f.tareas.length) return f.estado === "en_curso" ? 50 : 0;
  return Math.round((f.tareas.filter((t) => t.hecha).length / f.tareas.length) * 100);
}

export function avanceObra(o: Obra) {
  if (!o.fases.length) return 0;
  return Math.round(o.fases.reduce((s, f) => s + avanceFase(f), 0) / o.fases.length);
}

export function finObra(o: Obra) {
  return o.fases.reduce((m, f) => (f.fin > m ? f.fin : m), o.inicio);
}

// Punto de miles también en cifras de cuatro dígitos (1.000 €), como se escribe en los presupuestos
const SIEMPRE = { useGrouping: "always" } as unknown as Intl.NumberFormatOptions;
const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", ...SIEMPRE });
export const euros = (n: number) => eur.format(n || 0);
const eur0 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, ...SIEMPRE });
/** Importe redondeado, sin céntimos */
export const eurosRedondo = (n: number) => eur0.format(n || 0);

export function fecha(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export const hoy = () => new Date().toISOString().slice(0, 10);

export function sumarDias(iso: string, dias: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}
