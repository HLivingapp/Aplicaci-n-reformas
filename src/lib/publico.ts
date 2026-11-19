/**
 * Lo que ve y hace el cliente con su enlace privado. Funciones puras que usan
 * tanto el servidor (con base de datos) como el modo demostración.
 * Nunca devuelven costes, márgenes ni notas internas.
 */
import { crearObraDesdePresupuestoEn } from "./obra";
import { hoy } from "./calc";
import { estimar, type Estimacion } from "./estimacion";
import { nuevoId, nuevoToken } from "./id";
import { textoDireccion } from "./proyecto";
import type { Cliente, Datos, DatosReforma, Obra, Presupuesto, Proyecto, Tarifas, Vivienda } from "./types";

export const TEXTO_CONSENTIMIENTO =
  "Acepto que la empresa trate mis datos (contacto, dirección y datos de la vivienda) para estudiar mi reforma, preparar el presupuesto y contactarme, según la política de privacidad.";

export interface ContactoCliente {
  nombre: string;
  telefono: string;
  email: string;
}

export type ProyectoPublico = Omit<Proyecto, "notasInternas"> & { estimacion: Estimacion | null };

export interface DatosPortal {
  empresa: Datos["empresa"];
  cliente: Pick<Cliente, "nombre">;
  proyectos: ProyectoPublico[];
  presupuestos: Presupuesto[];
  obras: Obra[];
}

export function estimacionPublica(v: Vivienda, r: DatosReforma, t: Tarifas): Estimacion {
  const e = estimar(v, r, t);
  return { ...e, coste: 0, lineas: e.lineas.map((l) => ({ ...l, coste: 0 })) };
}

export function vistaPortal(d: Datos, token: string): DatosPortal | null {
  const c = d.clientes.find((x) => x.token && x.token === token);
  if (!c) return null;
  return {
    empresa: d.empresa,
    cliente: { nombre: c.nombre },
    proyectos: d.proyectos
      .filter((p) => p.clienteId === c.id && p.estado !== "descartado")
      .map((p) => {
        const { notasInternas, ...publico } = p;
        void notasInternas;
        return { ...publico, estimacion: p.presupuestoId ? null : estimacionPublica(p.vivienda, p.reforma, d.tarifas) };
      }),
    presupuestos: d.presupuestos
      .filter((p) => p.clienteId === c.id && p.estado !== "borrador")
      .map((p) => ({ ...p, capitulos: p.capitulos.map((ch) => ({ ...ch, partidas: ch.partidas.map((it) => ({ ...it, coste: 0 })) })) })),
    obras: d.obras.filter((o) => o.clienteId === c.id).map((o) => ({ ...o, novedades: o.novedades.filter((n) => n.visibleCliente) })),
  };
}

/** Da de alta al cliente y su proyecto. Devuelve el token de su enlace privado. */
export function registrarProyecto(d: Datos, v: Vivienda, r: DatosReforma, c: ContactoCliente): string {
  const token = nuevoToken();
  const clienteId = nuevoId();
  d.clientes.unshift({ id: clienteId, token, nombre: c.nombre.trim().slice(0, 120), telefono: c.telefono.trim().slice(0, 40), email: c.email.trim().slice(0, 120), direccion: textoDireccion(v.direccion).slice(0, 300), creado: hoy() });
  d.proyectos.unshift({
    id: nuevoId(),
    clienteId,
    creado: hoy(),
    estado: "nuevo",
    vivienda: v,
    reforma: { ...r, comentarios: r.comentarios.slice(0, 4000) },
    notasInternas: "",
    consentimiento: { fecha: new Date().toISOString(), texto: TEXTO_CONSENTIMIENTO },
  });
  return token;
}

export function responderPresupuesto(d: Datos, token: string, presupuestoId: string, acepta: boolean, comentario: string): boolean {
  const c = d.clientes.find((x) => x.token === token);
  const p = d.presupuestos.find((x) => x.id === presupuestoId && x.clienteId === c?.id);
  if (!c || !p || p.estado !== "enviado") return false;
  p.estado = acepta ? "aceptado" : "rechazado";
  p.respuestaCliente = { fecha: hoy(), comentario: comentario.trim().slice(0, 2000) };
  if (acepta) crearObraDesdePresupuestoEn(d, p.id);
  const proyecto = d.proyectos.find((x) => x.presupuestoId === p.id);
  if (proyecto) proyecto.estado = "presupuestado";
  return true;
}
