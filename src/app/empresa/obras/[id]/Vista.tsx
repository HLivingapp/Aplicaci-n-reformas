"use client";

import { useParamsReales } from "@/lib/rutas";
import Link from "next/link";

import { useState } from "react";
import { avanceFase, avanceObra, fecha, finObra, hoy, sumarDias } from "@/lib/calc";
import { nuevoId } from "@/lib/id";
import { useDatos } from "@/lib/store";
import type { EstadoFase, Fase, Obra } from "@/lib/types";
import { Cronograma } from "@/components/Cronograma";
import { Barra, Boton, EstadoFaseTag, inputCls, Tarjeta, textosFase, Vacio } from "@/components/ui";

export default function DetalleObra() {
  const { id } = useParamsReales<{ id: string }>();
  const { datos, actualizar } = useDatos();
  const [nota, setNota] = useState("");
  const [visible, setVisible] = useState(true);
  const [nuevaTarea, setNuevaTarea] = useState<Record<string, string>>({});
  const o = datos.obras.find((x) => x.id === id);
  if (!o) return <Vacio>Obra no encontrada.</Vacio>;
  const cliente = datos.clientes.find((c) => c.id === o.clienteId);

  const mod = (fn: (ob: Obra) => void) =>
    actualizar((d) => {
      const ob = d.obras.find((x) => x.id === id);
      if (ob) fn(ob);
    });
  const modFase = (fid: string, fn: (f: Fase) => void) =>
    mod((ob) => {
      const f = ob.fases.find((x) => x.id === fid);
      if (f) fn(f);
    });

  const cambiarEstado = (fid: string, estado: EstadoFase) =>
    modFase(fid, (f) => {
      f.estado = estado;
      if (estado === "terminada") f.tareas.forEach((t) => (t.hecha = true));
    });

  const mover = (idx: number, dir: -1 | 1) =>
    mod((ob) => {
      const j = idx + dir;
      if (j < 0 || j >= ob.fases.length) return;
      [ob.fases[idx], ob.fases[j]] = [ob.fases[j], ob.fases[idx]];
    });

  const publicar = () => {
    if (!nota.trim()) return;
    mod((ob) => { ob.novedades.unshift({ id: nuevoId(), fecha: hoy(), texto: nota.trim(), visibleCliente: visible }); });
    setNota("");
  };

  const pct = avanceObra(o);

  return (
    <div>
      <Link href="/empresa/obras" className="text-sm text-stone-500 hover:underline">← Obras</Link>
      <div className="mb-4 mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{o.titulo}</h1>
          <p className="text-sm text-stone-500">{cliente?.nombre} · {o.direccion}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/empresa/presupuestos/${o.presupuestoId}`} className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm">Presupuesto</Link>
          {cliente && <a href={`/p/${cliente.token}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm">Vista del cliente ↗</a>}
        </div>
      </div>

      <Tarjeta className="mb-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>Avance general</span>
          <span className="font-semibold text-teal-700">{pct}%</span>
        </div>
        <Barra pct={pct} />
        <div className="mt-2 text-xs text-stone-500">Del {fecha(o.inicio)} al {fecha(finObra(o))}</div>
        <div className="mt-4"><Cronograma fases={o.fases} /></div>
      </Tarjeta>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <section className="space-y-3">
          <h2 className="font-semibold">Fases y tareas</h2>
          {o.fases.map((f, i) => (
            <Tarjeta key={f.id}>
              <div className="flex flex-wrap items-center gap-2">
                <input className={`${inputCls} flex-1 font-medium`} value={f.nombre} onChange={(e) => modFase(f.id, (x) => { x.nombre = e.target.value; })} />
                <EstadoFaseTag estado={f.estado} />
                <span className="text-sm font-semibold text-stone-500">{avanceFase(f)}%</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <label className="text-xs text-stone-500">Inicio
                  <input type="date" className={inputCls} value={f.inicio} onChange={(e) => modFase(f.id, (x) => { x.inicio = e.target.value; if (x.fin < x.inicio) x.fin = x.inicio; })} />
                </label>
                <label className="text-xs text-stone-500">Fin
                  <input type="date" className={inputCls} value={f.fin} min={f.inicio} onChange={(e) => modFase(f.id, (x) => { x.fin = e.target.value; })} />
                </label>
                <label className="col-span-2 text-xs text-stone-500 sm:col-span-1">Estado
                  <select className={inputCls} value={f.estado} onChange={(e) => cambiarEstado(f.id, e.target.value as EstadoFase)}>
                    {(Object.keys(textosFase) as EstadoFase[]).map((k) => <option key={k} value={k}>{textosFase[k]}</option>)}
                  </select>
                </label>
              </div>
              <ul className="mt-3 space-y-1">
                {f.tareas.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-teal-700"
                      checked={t.hecha}
                      onChange={(e) =>
                        modFase(f.id, (x) => {
                          const tt = x.tareas.find((y) => y.id === t.id);
                          if (tt) tt.hecha = e.target.checked;
                          const hechas = x.tareas.filter((y) => y.hecha).length;
                          x.estado = hechas === x.tareas.length ? "terminada" : hechas > 0 ? "en_curso" : x.estado === "terminada" ? "en_curso" : x.estado;
                        })
                      }
                    />
                    <span className={t.hecha ? "text-stone-400 line-through" : ""}>{t.texto}</span>
                    <button className="ml-auto text-stone-300 hover:text-red-600" title="Quitar tarea" onClick={() => modFase(f.id, (x) => { x.tareas = x.tareas.filter((y) => y.id !== t.id); })}>✕</button>
                  </li>
                ))}
              </ul>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const texto = (nuevaTarea[f.id] ?? "").trim();
                  if (!texto) return;
                  modFase(f.id, (x) => { x.tareas.push({ id: nuevoId(), texto, hecha: false }); if (x.estado === "terminada") x.estado = "en_curso"; });
                  setNuevaTarea({ ...nuevaTarea, [f.id]: "" });
                }}
              >
                <input className={inputCls} placeholder="Nueva tarea…" value={nuevaTarea[f.id] ?? ""} onChange={(e) => setNuevaTarea({ ...nuevaTarea, [f.id]: e.target.value })} />
                <Boton variante="secundario" type="submit">Añadir</Boton>
              </form>
              <div className="mt-3 flex gap-1 text-xs">
                <Boton variante="fantasma" onClick={() => mover(i, -1)} disabled={i === 0}>↑ Subir</Boton>
                <Boton variante="fantasma" onClick={() => mover(i, 1)} disabled={i === o.fases.length - 1}>↓ Bajar</Boton>
                <Boton variante="fantasma" className="ml-auto text-red-600" onClick={() => confirm(`¿Eliminar la fase "${f.nombre}"?`) && mod((ob) => { ob.fases = ob.fases.filter((x) => x.id !== f.id); })}>Eliminar fase</Boton>
              </div>
            </Tarjeta>
          ))}
          <Boton
            variante="secundario"
            onClick={() =>
              mod((ob) => {
                const ini = sumarDias(finObra(ob), 1);
                ob.fases.push({ id: nuevoId(), nombre: "Nueva fase", inicio: ini, fin: sumarDias(ini, 4), estado: "pendiente", tareas: [] });
              })
            }
          >
            + Fase
          </Boton>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Diario de obra</h2>
          <Tarjeta className="mb-3">
            <textarea rows={3} className={inputCls} placeholder="¿Qué ha pasado hoy en la obra?" value={nota} onChange={(e) => setNota(e.target.value)} />
            <label className="mt-2 flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" className="accent-teal-700" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
              Visible para el cliente
            </label>
            <Boton className="mt-2 w-full" onClick={publicar} disabled={!nota.trim()}>Publicar</Boton>
          </Tarjeta>
          <div className="space-y-2">
            {o.novedades.map((n) => (
              <div key={n.id} className="rounded-lg border border-stone-200 bg-white p-3 text-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-stone-400">
                  <span>{fecha(n.fecha)}</span>
                  <button
                    className={n.visibleCliente ? "text-teal-700" : "text-stone-400"}
                    onClick={() => mod((ob) => { const x = ob.novedades.find((y) => y.id === n.id); if (x) x.visibleCliente = !x.visibleCliente; })}
                  >
                    {n.visibleCliente ? "👁 Visible al cliente" : "🔒 Solo interno"}
                  </button>
                </div>
                {n.texto}
              </div>
            ))}
            {!o.novedades.length && <p className="text-sm text-stone-400">Sin anotaciones todavía.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
