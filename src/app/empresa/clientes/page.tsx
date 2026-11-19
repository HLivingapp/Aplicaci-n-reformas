"use client";

import { useState } from "react";
import { hoy } from "@/lib/calc";
import { nuevoId, nuevoToken } from "@/lib/id";
import { EnlaceCliente } from "@/components/EnlaceCliente";
import { useCrearPresupuesto } from "@/lib/acciones";
import { useDatos } from "@/lib/store";
import type { Cliente } from "@/lib/types";
import { Boton, Campo, inputCls, Tarjeta, Titulo, Vacio } from "@/components/ui";

const vacio = { nombre: "", telefono: "", email: "", direccion: "" };

export default function Clientes() {
  const { datos, actualizar } = useDatos();
  const crearPresupuesto = useCrearPresupuesto();
  const [form, setForm] = useState<typeof vacio | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const lista = datos.clientes.filter((c) =>
    [c.nombre, c.telefono, c.email, c.direccion].join(" ").toLowerCase().includes(busca.toLowerCase()),
  );

  const guardar = () => {
    if (!form || !form.nombre.trim()) return;
    actualizar((d) => {
      if (editando) {
        const c = d.clientes.find((x) => x.id === editando);
        if (c) Object.assign(c, form);
      } else {
        d.clientes.unshift({ id: nuevoId(), token: nuevoToken(), creado: hoy(), ...form } as Cliente);
      }
    });
    setForm(null);
    setEditando(null);
  };

  /** Derecho de acceso: todo lo que guardamos de este cliente, en un archivo. */
  const descargar = (id: string) => {
    const paquete = {
      cliente: datos.clientes.find((c) => c.id === id),
      proyectos: datos.proyectos.filter((p) => p.clienteId === id),
      presupuestos: datos.presupuestos.filter((p) => p.clienteId === id),
      obras: datos.obras.filter((o) => o.clienteId === id),
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(paquete, null, 2)], { type: "application/json" }));
    a.download = `datos-cliente-${id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /** Derecho de supresión: borra al cliente y todo lo relacionado. */
  const eliminar = (id: string, nombre: string) => {
    if (prompt(`Se borrarán ${nombre}, sus proyectos, presupuestos y obras. No se puede deshacer. Escribe BORRAR para confirmar.`) !== "BORRAR") return;
    actualizar((d) => {
      d.clientes = d.clientes.filter((c) => c.id !== id);
      d.proyectos = d.proyectos.filter((p) => p.clienteId !== id);
      d.presupuestos = d.presupuestos.filter((p) => p.clienteId !== id);
      d.obras = d.obras.filter((o) => o.clienteId !== id);
    });
  };

  return (
    <>
      <Titulo accion={<Boton onClick={() => { setForm(vacio); setEditando(null); }}>+ Nuevo cliente</Boton>}>Clientes</Titulo>

      {form && (
        <Tarjeta className="mb-5">
          <h2 className="mb-3 font-semibold">{editando ? "Editar cliente" : "Nuevo cliente"}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Nombre *">
              <input className={inputCls} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
            </Campo>
            <Campo etiqueta="Teléfono">
              <input className={inputCls} type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </Campo>
            <Campo etiqueta="Email">
              <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Campo>
            <Campo etiqueta="Dirección">
              <input className={inputCls} value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </Campo>
          </div>
          <div className="mt-4 flex gap-2">
            <Boton onClick={guardar} disabled={!form.nombre.trim()}>Guardar</Boton>
            <Boton variante="fantasma" onClick={() => setForm(null)}>Cancelar</Boton>
          </div>
        </Tarjeta>
      )}

      <input className={`${inputCls} mb-4`} placeholder="Buscar cliente…" value={busca} onChange={(e) => setBusca(e.target.value)} />

      {lista.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {lista.map((c) => {
            const presupuestos = datos.presupuestos.filter((p) => p.clienteId === c.id).length;
            const obras = datos.obras.filter((o) => o.clienteId === c.id).length;
            return (
              <Tarjeta key={c.id}>
                <div className="font-medium">{c.nombre}</div>
                <div className="mt-1 space-y-0.5 text-sm text-stone-500">
                  {c.telefono && <div>📞 <a href={`tel:${c.telefono}`} className="hover:underline">{c.telefono}</a></div>}
                  {c.email && <div>✉️ <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a></div>}
                  {c.direccion && <div>📍 {c.direccion}</div>}
                </div>
                <div className="mt-2 text-xs text-stone-400">
                  {presupuestos} presupuesto(s) · {obras} obra(s)
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Boton variante="secundario" onClick={() => crearPresupuesto(c.id)}>Presupuestar</Boton>
                  <Boton variante="fantasma" onClick={() => { setEditando(c.id); setForm({ nombre: c.nombre, telefono: c.telefono, email: c.email, direccion: c.direccion }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar</Boton>
                </div>
                <div className="mt-2 border-t border-stone-100 pt-2">
                  <EnlaceCliente cliente={c} />
                </div>
                <details className="mt-1 text-sm">
                  <summary className="cursor-pointer py-1 text-xs text-stone-400">Protección de datos</summary>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Boton variante="secundario" onClick={() => descargar(c.id)}>Descargar sus datos</Boton>
                    <Boton variante="peligro" onClick={() => eliminar(c.id, c.nombre)}>Eliminar cliente y todos sus datos</Boton>
                  </div>
                </details>
              </Tarjeta>
            );
          })}
        </div>
      ) : (
        <Vacio>{busca ? "Ningún cliente coincide con la búsqueda." : "Todavía no hay clientes."}</Vacio>
      )}
    </>
  );
}
