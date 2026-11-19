"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { fecha, hoy } from "@/lib/calc";
import { enlacesCatastro } from "@/lib/catastro";
import type { ResultadoBusqueda } from "@/lib/catastro/tipos";
import { useCrearPresupuesto } from "@/lib/acciones";
import { textoDireccion } from "@/lib/proyecto";
import { useDatos } from "@/lib/store";
import type { EstadoProyecto, Proyecto } from "@/lib/types";
import { EnlaceCliente } from "@/components/EnlaceCliente";
import { VistaEstimacion } from "@/components/Estimacion";
import { PlanoBase } from "@/components/PlanoBase";
import { estimar } from "@/lib/estimacion";
import { Resumen } from "@/components/ResumenProyecto";
import { Ubicacion } from "@/components/Ubicacion";
import { Boton, Campo, EstadoProyectoTag, inputCls, Tarjeta, textosProyecto, Vacio } from "@/components/ui";

export default function DetalleSolicitud() {
  const { id } = useParams<{ id: string }>();
  const { datos, actualizar } = useDatos();
  const crearPresupuesto = useCrearPresupuesto();
  const [rc, setRc] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const p = datos.proyectos.find((x) => x.id === id);
  if (!p) return <Vacio>Solicitud no encontrada.</Vacio>;
  const cliente = datos.clientes.find((c) => c.id === p.clienteId);
  const v = p.vivienda;

  const mod = (fn: (x: Proyecto) => void) =>
    actualizar((d) => {
      const x = d.proyectos.find((y) => y.id === id);
      if (x) fn(x);
    });

  const consultar = async (body: object) => {
    setBuscando(true);
    setAviso(null);
    try {
      const res = (await (await fetch("/api/catastro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json()) as ResultadoBusqueda;
      if (res.estado === "ok" && res.detalle) {
        const det = res.detalle;
        mod((x) => {
          x.vivienda.catastro = { referencia: det.referencia, superficie: det.superficie, anoConstruccion: det.anoConstruccion, uso: det.uso, direccionCatastro: det.direccion, lat: det.lat, lng: det.lng, consultado: hoy() };
          x.vivienda.anoConstruccion ??= det.anoConstruccion ?? null;
        });
        setAviso("Ficha catastral actualizada.");
      } else if (res.estado === "ok") {
        setAviso(`Hay ${res.inmuebles.length} inmuebles en esa dirección. Elige uno: ${res.inmuebles.slice(0, 8).map((i) => `${i.descripcion} (${i.referencia})`).join("; ")}`);
      } else {
        setAviso(res.mensaje);
      }
    } catch {
      setAviso("No se pudo conectar con el Catastro.");
    } finally {
      setBuscando(false);
    }
  };

  const enlaces = v.catastro ? enlacesCatastro(v.catastro.referencia) : null;
  const difiereM2 = v.catastro?.superficie && v.m2 && Math.abs(v.catastro.superficie - v.m2) > 2;

  return (
    <div>
      <Link href="/empresa/solicitudes" className="text-sm text-stone-500 hover:underline">← Solicitudes</Link>
      <div className="mb-4 mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cliente?.nombre ?? "Cliente"}</h1>
          <p className="text-sm text-stone-500">Solicitud del {fecha(p.creado)} · {textoDireccion(v.direccion)}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-sm">
            {cliente?.telefono && <a href={`tel:${cliente.telefono}`} className="text-teal-700">📞 {cliente.telefono}</a>}
            {cliente?.email && <a href={`mailto:${cliente.email}`} className="text-teal-700">✉️ {cliente.email}</a>}
          </div>
          {cliente && <div className="-ml-2 mt-1"><EnlaceCliente cliente={cliente} /></div>}
          {p.consentimiento && <div className="mt-1 text-xs text-stone-400">Consentimiento aceptado el {fecha(p.consentimiento.fecha.slice(0, 10))}</div>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className={`${inputCls} w-auto`} value={p.estado} onChange={(e) => mod((x) => { x.estado = e.target.value as EstadoProyecto; })} aria-label="Estado">
            {(Object.keys(textosProyecto) as EstadoProyecto[]).map((k) => <option key={k} value={k}>{textosProyecto[k]}</option>)}
          </select>
          {p.presupuestoId ? (
            <Link href={`/empresa/presupuestos/${p.presupuestoId}`} className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white">Ver presupuesto →</Link>
          ) : (
            <Boton onClick={() => crearPresupuesto(p.clienteId, p.id)}>Crear presupuesto</Boton>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Tarjeta>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">Ficha catastral</h2>
              <EstadoProyectoTag estado={p.estado} />
            </div>
            {v.catastro ? (
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-stone-500">Referencia</dt><dd className="font-mono">{v.catastro.referencia}</dd></div>
                {v.catastro.direccionCatastro && <div className="flex justify-between gap-4"><dt className="text-stone-500">Dirección</dt><dd className="text-right">{v.catastro.direccionCatastro}</dd></div>}
                <div className="flex justify-between"><dt className="text-stone-500">Superficie construida</dt><dd>{v.catastro.superficie ? `${v.catastro.superficie} m²` : "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-stone-500">Año de construcción</dt><dd>{v.catastro.anoConstruccion ?? "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-stone-500">Uso</dt><dd>{v.catastro.uso ?? "—"}</dd></div>
                <div className="text-xs text-stone-400">Consultado el {fecha(v.catastro.consultado)}</div>
              </dl>
            ) : (
              <p className="text-sm text-amber-800">El cliente no la encontró. Búscala por dirección o pega la referencia catastral.</p>
            )}
            {difiereM2 && <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">El cliente indicó {v.m2} m² y el Catastro dice {v.catastro?.superficie} m². Revisar en la visita.</p>}
            {enlaces && (
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a href={enlaces.ficha} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">Abrir ficha en la Sede del Catastro ↗</a>
                <a href={enlaces.mapa} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">Cartografía ↗</a>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
              <Boton variante="secundario" disabled={buscando} onClick={() => consultar({ direccion: v.direccion })}>
                {buscando ? "Consultando…" : "Buscar por dirección"}
              </Boton>
              <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); if (rc.trim()) consultar({ referencia: rc, provincia: v.direccion.provincia }); }}>
                <input className={`${inputCls} font-mono`} placeholder="Referencia catastral (20 caracteres)" value={rc} onChange={(e) => setRc(e.target.value)} />
                <Boton variante="secundario" type="submit" disabled={buscando || !rc.trim()}>Consultar</Boton>
              </form>
            </div>
            {aviso && <p className="mt-2 text-sm text-stone-600">{aviso}</p>}
          </Tarjeta>

          <Tarjeta>
            <h2 className="mb-2 font-semibold">Datos de la vivienda y la reforma</h2>
            <Resumen v={v} r={p.reforma} />
          </Tarjeta>

          <Tarjeta>
            <Campo etiqueta="Notas internas (el cliente no las ve)">
              <textarea rows={4} className={inputCls} value={p.notasInternas} onChange={(e) => mod((x) => { x.notasInternas = e.target.value; })} placeholder="Fecha de visita, observaciones, estado de la instalación…" />
            </Campo>
          </Tarjeta>
        </div>

        <div className="space-y-4">
          <Tarjeta>
            <h2 className="mb-1 font-semibold">Cotización automática</h2>
            <p className="mb-3 text-xs text-stone-500">Con el tarifario «{datos.tarifas.nombre}» (+{datos.tarifas.recargoPct}% sobre coste). Al crear el presupuesto se copian estas partidas para afinarlas.</p>
            <VistaEstimacion e={estimar(v, p.reforma, datos.tarifas)} detalle />
          </Tarjeta>
          <Tarjeta>
            <h2 className="mb-2 font-semibold">Plano base orientativo</h2>
            <PlanoBase m2={v.catastro?.superficie ?? v.m2} dormitorios={p.reforma.dormitoriosDeseados} banos={p.reforma.banosDeseados} cocinaAbierta={v.cocinaAbierta} terrazas={v.terrazas} />
          </Tarjeta>
          <Tarjeta>
            <h2 className="mb-2 font-semibold">Ubicación y fachada</h2>
            <Ubicacion lat={v.catastro?.lat} lng={v.catastro?.lng} direccionTexto={textoDireccion(v.direccion)} />
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
