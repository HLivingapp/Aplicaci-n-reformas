"use client";

import { useRouter } from "next/navigation";
import { hoy, sumarDias } from "./calc";
import { FASES_TIPO } from "./catalogo";
import { nuevoId } from "./id";
import { useDatos } from "./store";
import { estimar, type Estimacion } from "./estimacion";
import type { Capitulo, Datos, Obra, Presupuesto } from "./types";

export function useCrearPresupuesto() {
  const { actualizar } = useDatos();
  const router = useRouter();
  return (clienteId?: string, proyectoId?: string) => {
    const id = nuevoId();
    actualizar((d) => {
      d.contador += 1;
      const cliente = d.clientes.find((c) => c.id === clienteId);
      const proyecto = d.proyectos.find((x) => x.id === proyectoId);
      const p: Presupuesto = {
        id,
        numero: `${hoy().slice(0, 4)}-${String(d.contador).padStart(3, "0")}`,
        clienteId: clienteId ?? d.clientes[0]?.id ?? "",
        titulo: proyecto ? `Reforma ${proyecto.reforma.alcance} · ${proyecto.vivienda.m2 ?? "?"} m²` : "Nuevo presupuesto",
        direccionObra: cliente?.direccion ?? "",
        fecha: hoy(),
        validezDias: 30,
        estado: "borrador",
        ivaPct: 10,
        descuentoPct: 0,
        notas: "",
        capitulos: proyecto ? capitulosDesdeEstimacion(estimar(proyecto.vivienda, proyecto.reforma, d.tarifas)) : capitulosIniciales(),
      };
      d.presupuestos.unshift(p);
      if (proyecto) {
        proyecto.presupuestoId = id;
        proyecto.estado = "presupuestado";
      }
    });
    router.push(`/empresa/presupuestos/${id}`);
  };
}

function capitulosIniciales(): Capitulo[] {
  return [{ id: nuevoId(), nombre: "Capítulo 1", partidas: [] }];
}

/** Convierte la cotización automática en capítulos y partidas editables. */
function capitulosDesdeEstimacion(e: Estimacion): Capitulo[] {
  const caps: Capitulo[] = [];
  for (const l of e.lineas) {
    let c = caps.find((x) => x.nombre === l.capitulo);
    if (!c) caps.push((c = { id: nuevoId(), nombre: l.capitulo, partidas: [] }));
    c.partidas.push({ id: nuevoId(), descripcion: l.descripcion, unidad: l.unidad, cantidad: l.cantidad, precio: l.precio, coste: l.coste });
  }
  return caps.length ? caps : capitulosIniciales();
}

/** Crea una obra con las fases tipo a partir de un presupuesto aceptado. */
export function crearObraDesdePresupuesto(d: Datos, presupuestoId: string, inicio = hoy()): string | undefined {
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
