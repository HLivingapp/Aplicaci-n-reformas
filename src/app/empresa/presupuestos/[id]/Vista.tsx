"use client";

import { detallePartida } from "@/lib/presupuesto-estimacion";

import { useParamsReales } from "@/lib/rutas";
import { recargoDe } from "@/lib/tarifas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { euros, fecha, hoy, totalCapitulo, totales, totalPartida } from "@/lib/calc";
import { IVAS, UNIDADES } from "@/lib/catalogo";
import { crearObraDesdePresupuesto } from "@/lib/acciones";
import { nuevoId } from "@/lib/id";
import { useDatos } from "@/lib/store";
import type { Capitulo, Datos, Partida, Presupuesto } from "@/lib/types";
import { Boton, Campo, EstadoPresupuestoTag, inputCls, Tarjeta, Vacio } from "@/components/ui";

const num = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export default function EditorPresupuesto() {
  const { id } = useParamsReales<{ id: string }>();
  const router = useRouter();
  const { datos, actualizar } = useDatos();
  const [catalogoPara, setCatalogoPara] = useState<string | null>(null);
  const p = datos.presupuestos.find((x) => x.id === id);

  if (!p) return <Vacio>Presupuesto no encontrado. <Link href="/empresa/presupuestos" className="text-teal-700 underline">Volver</Link></Vacio>;

  const t = totales(p);
  const bloqueado = p.estado === "aceptado";
  const cliente = datos.clientes.find((c) => c.id === p.clienteId);

  const mod = (fn: (pr: Presupuesto, d: Datos) => void) =>
    actualizar((d) => {
      const pr = d.presupuestos.find((x) => x.id === id);
      if (pr) fn(pr, d);
    });
  const modCap = (capId: string, fn: (c: Capitulo) => void) =>
    mod((pr) => {
      const c = pr.capitulos.find((x) => x.id === capId);
      if (c) fn(c);
    });
  const modPartida = (capId: string, pid: string, campos: Partial<Partida>) =>
    modCap(capId, (c) => {
      const it = c.partidas.find((x) => x.id === pid);
      if (it) Object.assign(it, campos);
    });

  const eliminar = () => {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    actualizar((d) => {
      d.presupuestos = d.presupuestos.filter((x) => x.id !== id);
    });
    router.push("/empresa/presupuestos");
  };

  const marcarAceptado = () => {
    let obraId: string | undefined;
    actualizar((d) => {
      const pr = d.presupuestos.find((x) => x.id === id);
      if (!pr) return;
      pr.estado = "aceptado";
      pr.respuestaCliente ??= { fecha: hoy(), comentario: "Aceptado por la empresa en nombre del cliente" };
      obraId = crearObraDesdePresupuesto(d, id);
    });
    setTimeout(() => obraId && router.push(`/empresa/obras/${obraId}`), 0);
  };

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link href="/empresa/presupuestos" className="text-sm text-stone-500 hover:underline">← Presupuestos</Link>
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" onClick={() => window.print()}>Imprimir / PDF</Boton>
          {p.estado === "borrador" && <Boton onClick={() => mod((pr) => { pr.estado = "enviado"; })}>Enviar al cliente</Boton>}
          {p.estado === "enviado" && (
            <>
              <Boton variante="secundario" onClick={() => mod((pr) => { pr.estado = "borrador"; })}>Volver a borrador</Boton>
              <Boton onClick={marcarAceptado}>Marcar como aceptado</Boton>
            </>
          )}
          {p.estado === "rechazado" && <Boton variante="secundario" onClick={() => mod((pr) => { pr.estado = "borrador"; })}>Revisar y reenviar</Boton>}
          {p.obraId && <Link href={`/empresa/obras/${p.obraId}`} className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white">Ver obra →</Link>}
        </div>
      </div>

      {p.respuestaCliente && (
        <div className={`no-print mb-4 rounded-lg p-3 text-sm ${p.estado === "rechazado" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
          Respuesta del cliente ({fecha(p.respuestaCliente.fecha)}): {p.respuestaCliente.comentario || "sin comentarios"}
        </div>
      )}
      {bloqueado && <p className="no-print mb-4 text-sm text-stone-500">Presupuesto aceptado: ya no se puede modificar.</p>}

      <Tarjeta className="print-plain mb-4">
        <div className="mb-4 hidden print:block">
          <div className="text-lg font-semibold">{datos.empresa.nombre}</div>
          <div className="text-xs text-stone-500">{datos.empresa.cif} · {datos.empresa.direccion} · {datos.empresa.telefono} · {datos.empresa.email}</div>
        </div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm text-stone-500">Presupuesto Nº {p.numero}</div>
          <EstadoPresupuestoTag estado={p.estado} />
        </div>
        <fieldset disabled={bloqueado} className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Título" className="sm:col-span-2">
            <input className={inputCls} value={p.titulo} onChange={(e) => mod((pr) => { pr.titulo = e.target.value; })} />
          </Campo>
          <Campo etiqueta="Cliente">
            <select
              className={inputCls}
              value={p.clienteId}
              onChange={(e) =>
                mod((pr, d) => {
                  pr.clienteId = e.target.value;
                  pr.direccionObra ||= d.clientes.find((c) => c.id === e.target.value)?.direccion ?? "";
                })
              }
            >
              {datos.clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Dirección de la obra">
            <input className={inputCls} value={p.direccionObra} onChange={(e) => mod((pr) => { pr.direccionObra = e.target.value; })} />
          </Campo>
          <Campo etiqueta="Fecha">
            <input type="date" className={inputCls} value={p.fecha} onChange={(e) => mod((pr) => { pr.fecha = e.target.value; })} />
          </Campo>
          <Campo etiqueta="Validez (días)">
            <input type="number" min={1} className={inputCls} value={p.validezDias} onChange={(e) => mod((pr) => { pr.validezDias = num(e.target.value); })} />
          </Campo>
        </fieldset>
        {cliente && <div className="mt-3 hidden text-sm print:block">Cliente: {cliente.nombre} · {cliente.telefono} · {cliente.email}</div>}
      </Tarjeta>

      <fieldset disabled={bloqueado} className="space-y-4">
        {p.capitulos.map((c, ci) => (
          <Tarjeta key={c.id} className="print-plain">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-400">{ci + 1}.</span>
              <input className={`${inputCls} font-semibold`} value={c.nombre} onChange={(e) => modCap(c.id, (x) => { x.nombre = e.target.value; })} />
              <span className="whitespace-nowrap text-sm font-semibold">{euros(totalCapitulo(c))}</span>
              {!bloqueado && (
                <button className="no-print px-2 text-stone-400 hover:text-red-600" title="Eliminar capítulo" onClick={() => mod((pr) => { pr.capitulos = pr.capitulos.filter((x) => x.id !== c.id); })}>✕</button>
              )}
            </div>

            <div className="space-y-3">
              {c.partidas.map((it, ii) => (
                <div key={it.id} className="rounded-lg bg-stone-50 p-3">
                  <div className="flex gap-2">
                    <span className="pt-2 text-xs text-stone-400">{ci + 1}.{ii + 1}</span>
                    <textarea
                      rows={2}
                      className={`${inputCls} resize-y`}
                      value={it.descripcion}
                      placeholder="Descripción de la partida"
                      onChange={(e) => modPartida(c.id, it.id, { descripcion: e.target.value })}
                    />
                    {!bloqueado && (
                      <button className="no-print px-1 text-stone-400 hover:text-red-600" title="Eliminar partida" onClick={() => modCap(c.id, (x) => { x.partidas = x.partidas.filter((y) => y.id !== it.id); })}>✕</button>
                    )}
                  </div>
                  <textarea
                    rows={it.detalle ? 4 : 2}
                    className={`${inputCls} mt-2 resize-y text-xs text-stone-600`}
                    value={it.detalle ?? ""}
                    placeholder="Detalle para el cliente: qué incluye, medición, acabado, qué no incluye…"
                    onChange={(e) => modPartida(c.id, it.id, { detalle: e.target.value })}
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <Campo etiqueta="Cantidad">
                      <input inputMode="decimal" className={inputCls} defaultValue={it.cantidad} onChange={(e) => modPartida(c.id, it.id, { cantidad: num(e.target.value) })} />
                    </Campo>
                    <Campo etiqueta="Unidad">
                      <select className={inputCls} value={it.unidad} onChange={(e) => modPartida(c.id, it.id, { unidad: e.target.value })}>
                        {UNIDADES.map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </Campo>
                    <Campo etiqueta="Precio €/ud">
                      <input inputMode="decimal" className={inputCls} defaultValue={it.precio} onChange={(e) => modPartida(c.id, it.id, { precio: num(e.target.value) })} />
                    </Campo>
                    <Campo etiqueta="Coste €/ud (interno)" className="no-print">
                      <input inputMode="decimal" className={inputCls} defaultValue={it.coste} onChange={(e) => modPartida(c.id, it.id, { coste: num(e.target.value) })} />
                    </Campo>
                    <div className="flex flex-col justify-end text-right">
                      <span className="text-xs text-stone-500">Importe</span>
                      <span className="py-2 font-semibold">{euros(totalPartida(it))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!bloqueado && (
              <div className="no-print mt-3 flex flex-wrap gap-2">
                <Boton variante="secundario" onClick={() => modCap(c.id, (x) => { x.partidas.push({ id: nuevoId(), descripcion: "", unidad: "ud", cantidad: 1, precio: 0, coste: 0 }); })}>+ Partida</Boton>
                <Boton variante="fantasma" onClick={() => setCatalogoPara(catalogoPara === c.id ? null : c.id)}>📚 Desde el tarifario</Boton>
              </div>
            )}
            {catalogoPara === c.id && (
              <div className="no-print mt-3 max-h-72 overflow-y-auto rounded-lg border border-stone-200">
                {datos.tarifas.precios.map((item) => {
                  const precio = Math.round(item.coste * recargoDe(datos.tarifas, item.grupo) * 100) / 100;
                  return (
                    <button
                      key={item.id}
                      className="flex w-full items-start justify-between gap-3 border-b border-stone-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-teal-50"
                      onClick={() => modCap(c.id, (x) => { x.partidas.push({ id: nuevoId(), tarifaId: item.id, descripcion: item.descripcion, detalle: detallePartida(item.id), unidad: item.unidad, cantidad: 1, precio, coste: item.coste }); })}
                    >
                      <span><span className="text-xs text-stone-400">{item.capitulo} · </span>{item.descripcion}</span>
                      <span className="whitespace-nowrap text-stone-500">{euros(precio)}/{item.unidad}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Tarjeta>
        ))}

        {!bloqueado && (
          <Boton variante="secundario" className="no-print" onClick={() => mod((pr) => { pr.capitulos.push({ id: nuevoId(), nombre: `Capítulo ${pr.capitulos.length + 1}`, partidas: [] }); })}>
            + Capítulo
          </Boton>
        )}

        <Tarjeta className="print-plain">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Campo etiqueta="IVA">
                <select className={inputCls} value={p.ivaPct} onChange={(e) => mod((pr) => { pr.ivaPct = num(e.target.value); })}>
                  {IVAS.map((i) => <option key={i.pct} value={i.pct}>{i.texto}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Descuento %">
                <input inputMode="decimal" className={inputCls} defaultValue={p.descuentoPct} onChange={(e) => mod((pr) => { pr.descuentoPct = num(e.target.value); })} />
              </Campo>
              <Campo etiqueta="Notas y condiciones (las ve el cliente)">
                <textarea rows={3} className={inputCls} value={p.notas} onChange={(e) => mod((pr) => { pr.notas = e.target.value; })} />
              </Campo>
            </div>
            <div className="space-y-1.5 text-sm">
              <Fila t="Suma de partidas" v={euros(t.bruto)} />
              {p.descuentoPct > 0 && <Fila t={`Descuento ${p.descuentoPct}%`} v={`− ${euros(t.descuento)}`} />}
              <Fila t="Base imponible" v={euros(t.base)} />
              <Fila t={`IVA ${p.ivaPct}%`} v={euros(t.iva)} />
              <div className="flex justify-between border-t border-stone-200 pt-2 text-lg font-semibold">
                <span>Total</span>
                <span>{euros(t.total)}</span>
              </div>
              <div className="no-print mt-4 rounded-lg bg-stone-50 p-3 text-stone-600">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Solo empresa</div>
                <Fila t="Coste estimado" v={euros(t.coste)} />
                <Fila t="Beneficio" v={euros(t.beneficio)} />
                <Fila t="Margen sobre venta" v={`${t.margenPct}%`} />
              </div>
            </div>
          </div>
        </Tarjeta>
      </fieldset>

      {!bloqueado && (
        <div className="no-print mt-6">
          <Boton variante="peligro" onClick={eliminar}>Eliminar presupuesto</Boton>
        </div>
      )}
    </div>
  );
}

function Fila({ t, v }: { t: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span>{t}</span>
      <span>{v}</span>
    </div>
  );
}
