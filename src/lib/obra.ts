import { hoy, sumarDias } from "./calc";
import { FASES_TIPO } from "./catalogo";
import { nuevoId } from "./id";
import type { Datos, Obra } from "./types";

/** Crea una obra con las fases tipo a partir de un presupuesto aceptado. */
export function crearObraDesdePresupuestoEn(d: Datos, presupuestoId: string, inicio = hoy()): string | undefined {
  const p = d.presupuestos.find((x) => x.id === presupuestoId);
  if (!p) return;
  if (p.obraId) return p.obraId;
  let cursor = inicio;
  const obra: Obra = {
    id: nuevoId(),
    clienteId: p.clienteId,
    presupuestoId: p.id,
    titulo: p.titulo,
    direccion: p.direccionObra,
    inicio,
    novedades: [],
    fases: FASES_TIPO.map((f) => {
      const ini = cursor;
      const fin = sumarDias(ini, f.dias - 1);
      cursor = sumarDias(fin, 1);
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
