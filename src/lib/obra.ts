import { hoy, sumarDias } from "./calc";
import { FASES_TIPO } from "./catalogo";
import { estimar } from "./estimacion";
import { planificarFases } from "./fases";
import { nuevoId } from "./id";
import type { Datos, HitoPago, Obra } from "./types";

/** Crea una obra con las fases tipo a partir de un presupuesto aceptado. */
export function crearObraDesdePresupuestoEn(d: Datos, presupuestoId: string, inicio = hoy()): string | undefined {
  const p = d.presupuestos.find((x) => x.id === presupuestoId);
  if (!p) return;
  if (p.obraId) return p.obraId;
  // Si el presupuesto viene de una solicitud del asistente, las fases salen de sus respuestas.
  const proyecto = d.proyectos.find((x) => x.presupuestoId === p.id);
  const tipo = proyecto
    ? planificarFases(estimar(proyecto.vivienda, proyecto.reforma, d.tarifas), proyecto.vivienda, proyecto.reforma)
        .fases.filter((f) => f.momento === "obra")
        .map((f) => ({ nombre: f.nombre, dias: Math.ceil((f.dias * 7) / 5), tareas: f.tareas, enParalelo: f.enParalelo }))
    : FASES_TIPO;
  let cursor = inicio;
  let inicioAnterior = inicio;
  const obra: Obra = {
    id: nuevoId(),
    clienteId: p.clienteId,
    presupuestoId: p.id,
    titulo: p.titulo,
    direccion: p.direccionObra,
    inicio,
    novedades: [],
    hitos: hitosEstandar(),
    extras: [],
    fases: tipo.map((f: { nombre: string; dias: number; tareas: string[]; enParalelo?: boolean }) => {
      // Días naturales; las fases en paralelo empiezan con la anterior y no mueven el calendario.
      const ini = f.enParalelo ? inicioAnterior : cursor;
      const fin = sumarDias(ini, f.dias - 1);
      if (!f.enParalelo) {
        inicioAnterior = ini;
        cursor = sumarDias(fin, 1);
      }
      return {
        id: nuevoId(),
        nombre: f.nombre,
        inicio: ini,
        fin,
        estado: "pendiente" as const,
        tareas: f.tareas.map((t) => ({ id: nuevoId(), texto: t, hecha: false })),
      };
    }),
  };
  d.obras.unshift(obra);
  p.obraId = obra.id;
  return obra.id;
}

/** Hitos de pago estándar del contrato (30 / 30 / 30 / 10 %). */
export const hitosEstandar = (): HitoPago[] => [
  { id: "h-firma", nombre: "A la firma del contrato", pct: 30, estado: "pendiente" },
  { id: "h-instalaciones", nombre: "Al terminar demoliciones e instalaciones", pct: 30, estado: "pendiente" },
  { id: "h-acabados", nombre: "Al terminar alicatados y suelos", pct: 30, estado: "pendiente" },
  { id: "h-entrega", nombre: "A la entrega, con la obra revisada", pct: 10, estado: "pendiente" },
];

export const hitosDe = (o: Obra) => o.hitos ?? hitosEstandar();

/** Lo que firma el cliente desde su enlace sobre su obra. */
export type AccionObraCliente =
  | { tipo: "pagado"; hitoId: string }
  | { tipo: "extra"; extraId: string; acepta: boolean; comentario?: string }
  | { tipo: "valorar"; faseId: string; puntualidad: number; limpieza: number; cumplimiento: number; comentario?: string };

const nota = (n: unknown) => Math.min(5, Math.max(1, Math.round(Number(n) || 0)));

export function accionObraCliente(d: Datos, token: string, obraId: string, a: AccionObraCliente): boolean {
  const c = d.clientes.find((x) => x.token && x.token === token);
  const o = d.obras.find((x) => x.id === obraId && x.clienteId === c?.id);
  if (!c || !o || !a) return false;
  if (a.tipo === "pagado") {
    o.hitos = hitosDe(o);
    const h = o.hitos.find((x) => x.id === a.hitoId);
    if (!h || h.estado === "pagado") return false;
    h.estado = "pagado";
    h.pagado = hoy();
    return true;
  }
  if (a.tipo === "extra") {
    const e = o.extras?.find((x) => x.id === a.extraId);
    if (!e || e.estado !== "propuesto") return false;
    e.estado = a.acepta ? "aceptado" : "rechazado";
    e.respuesta = { fecha: hoy(), comentario: String(a.comentario ?? "").trim().slice(0, 1000) };
    return true;
  }
  if (a.tipo === "valorar") {
    const f = o.fases.find((x) => x.id === a.faseId);
    if (!f || f.estado !== "terminada" || o.valoraciones?.some((v) => v.faseId === f.id)) return false;
    o.valoraciones = [...(o.valoraciones ?? []), { faseId: f.id, fecha: hoy(), puntualidad: nota(a.puntualidad), limpieza: nota(a.limpieza), cumplimiento: nota(a.cumplimiento), comentario: String(a.comentario ?? "").trim().slice(0, 1000) }];
    return true;
  }
  return false;
}
