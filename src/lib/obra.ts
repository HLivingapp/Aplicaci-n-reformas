import { hoy, sumarDias } from "./calc";
import { FASES_TIPO } from "./catalogo";
import { estimar } from "./estimacion";
import { planificarFases } from "./fases";
import { nuevoId } from "./id";
import type { Datos, Obra } from "./types";

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
