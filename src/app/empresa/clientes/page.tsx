"use client";

import Link from "next/link";
import { useState } from "react";
import { hoy } from "@/lib/calc";
import { nuevoId } from "@/lib/id";
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
        d.clientes.unshift({ id: nuevoId(), creado: hoy(), ...form } as Cliente);
      }
    });
    setForm(null);
    setEditando(null);
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
                  <Link href={`/cliente/${c.id}`} className="rounded-lg px-3 py-2 text-sm text-teal-700 hover:bg-teal-50">Ver su portal →</Link>
                </div>
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
