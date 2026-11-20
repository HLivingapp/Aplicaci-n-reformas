"use client";

import { useRouter } from "next/navigation";
import { hoy } from "./calc";
import { nuevoId } from "./id";
import { useDatos } from "./store";
import { estimar } from "./estimacion";
import { capitulosDesdeEstimacion, referenciaCapitulos } from "./presupuesto-estimacion";
import type { Capitulo, Presupuesto } from "./types";

export function useCrearPresupuesto() {
  const { actualizar } = useDatos();
  const router = useRouter();
  return (clienteId?: string, proyectoId?: string) => {
    const id = nuevoId();
    actualizar((d) => {
      d.contador += 1;
      const cliente = d.clientes.find((c) => c.id === clienteId);
      const proyecto = d.proyectos.find((x) => x.id === proyectoId);
      const estimacion = proyecto ? estimar(proyecto.vivienda, proyecto.reforma, d.tarifas) : null;
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
        capitulos: estimacion ? conCapitulos(capitulosDesdeEstimacion(estimacion)) : capitulosIniciales(),
        referenciaBase: estimacion?.base,
        referenciaCapitulos: estimacion ? referenciaCapitulos(estimacion) : undefined,
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

const conCapitulos = (c: Capitulo[]) => (c.length ? c : capitulosIniciales());

export { crearObraDesdePresupuestoEn as crearObraDesdePresupuesto } from "./obra";
