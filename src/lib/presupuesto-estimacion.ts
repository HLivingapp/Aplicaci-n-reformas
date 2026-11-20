import { ALCANCE } from "./alcance";
import type { Estimacion, LineaEstimacion } from "./estimacion";
import { nuevoId } from "./id";
import { NIVELES } from "./materiales";
import type { Capitulo } from "./types";

/** Texto largo de una partida: medición, acabado elegido, qué incluye y qué no. */
export function detallePartida(tarifaId: string | undefined, extra: { medicion?: string; acabado?: string; especificacion?: string } = {}) {
  const a = tarifaId ? ALCANCE[tarifaId] : undefined;
  return [
    a?.incluye,
    extra.especificacion ? `Equipo o material de referencia: ${extra.especificacion}` : "",
    extra.acabado ? `Acabado: ${extra.acabado}.` : "",
    extra.medicion ? `Medición: ${extra.medicion}.` : "",
    a?.noIncluye ? `No incluye: ${a.noIncluye}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function acabadoDe(e: Estimacion, l: LineaEstimacion) {
  const g = l.grupoMaterial && e.materiales.find((m) => m.grupo === l.grupoMaterial);
  const o = g ? g.opciones.find((x) => x.id === g.elegida) : undefined;
  if (!o) return undefined;
  const nivel = NIVELES.find((n) => n.valor === o.nivel)?.texto;
  return `${o.nombre}${nivel ? ` (gama ${nivel.toLowerCase()})` : ""}. ${o.detalle}`;
}

/** Convierte la cotización automática en capítulos y partidas editables, con todo el detalle. */
export function capitulosDesdeEstimacion(e: Estimacion): Capitulo[] {
  const caps: Capitulo[] = [];
  for (const l of e.lineas) {
    let c = caps.find((x) => x.nombre === l.capitulo);
    if (!c) caps.push((c = { id: nuevoId(), nombre: l.capitulo, partidas: [] }));
    c.partidas.push({
      id: nuevoId(),
      tarifaId: l.tarifaId,
      descripcion: l.descripcion,
      detalle: detallePartida(l.tarifaId, { medicion: l.medicion, acabado: acabadoDe(e, l), especificacion: l.especificacion }),
      unidad: l.unidad,
      cantidad: l.cantidad,
      precio: l.precio,
      coste: l.coste,
    });
  }
  return caps;
}

/** Importe de referencia (venta sin IVA) de cada capítulo de la estimación. */
export function referenciaCapitulos(e: Estimacion): Record<string, number> {
  const r: Record<string, number> = {};
  for (const l of e.lineas) r[l.capitulo] = Math.round(((r[l.capitulo] ?? 0) + l.cantidad * l.precio) * 100) / 100;
  return r;
}
