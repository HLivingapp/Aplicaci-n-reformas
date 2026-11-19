"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ESTADO_PROVEEDOR } from "@/components/Proveedor";
import { Boton, Campo, inputCls, Tarjeta, Titulo, Vacio } from "@/components/ui";
import { hoy, euros } from "@/lib/calc";
import { conBaseDeDatos } from "@/lib/modo";
import { avisos, cumpleRequisitos, DOCUMENTOS, documentosExigidos, ESPECIALIDADES, requisitos, situacionDoc } from "@/lib/proveedores";
import { useDatos } from "@/lib/store";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import type { DocumentoProveedor, Proveedor } from "@/lib/types";

const especialidad = (v: string) => ESPECIALIDADES.find((e) => e.valor === v)?.texto ?? v;
const SITUACION = { pendiente: "Pendiente", rechazado: "No válido", caducado: "Caducado", caduca_pronto: "Caduca pronto", valido: "Válido" } as const;
const COLOR = { pendiente: "text-amber-700", rechazado: "text-red-700", caducado: "text-red-700", caduca_pronto: "text-amber-700", valido: "text-emerald-700" } as const;

async function verDocumento(d: DocumentoProveedor) {
  if (!conBaseDeDatos) return alert("Modo demostración: el archivo no se guarda.");
  const { data, error } = await supabaseNavegador().storage.from("proveedores").createSignedUrl(d.ruta, 300);
  if (error || !data) return alert("No se pudo abrir el documento");
  window.open(data.signedUrl, "_blank", "noopener");
}

export default function FichaProveedor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { datos, actualizar } = useDatos();
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const p = datos.proveedores.find((x) => x.id === id);
  if (!p) return <Vacio>No se encuentra este proveedor.</Vacio>;

  const cambiar = (fn: (x: Proveedor) => void) =>
    actualizar((d) => {
      const x = d.proveedores.find((y) => y.id === id);
      if (x) fn(x);
    });
  const cambiarDoc = (docId: string, fn: (x: DocumentoProveedor) => void) =>
    cambiar((x) => {
      const doc = x.documentos.find((y) => y.id === docId);
      if (doc) fn(doc);
    });
  const reqs = requisitos(p);
  const cumple = cumpleRequisitos(p);
  const enlace = typeof window !== "undefined" ? `${window.location.origin}/reformista/${p.token}` : "";

  async function borrar() {
    if (!p || !confirm(`¿Borrar a ${p.razonSocial} y todos sus documentos? No se puede deshacer.`)) return;
    if (conBaseDeDatos && p.documentos.length) {
      const { error } = await supabaseNavegador().storage.from("proveedores").remove(p.documentos.map((d) => d.ruta));
      if (error) return alert("No se pudieron borrar los documentos: " + error.message);
    }
    actualizar((d) => void (d.proveedores = d.proveedores.filter((x) => x.id !== id)));
    router.push("/empresa/proveedores");
  }

  return (
    <>
      <Link href="/empresa/proveedores" className="mb-2 inline-block text-sm text-teal-700 hover:underline">← Proveedores</Link>
      <Titulo accion={<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_PROVEEDOR[p.estado].cls}`}>{ESTADO_PROVEEDOR[p.estado].texto}</span>}>
        {p.razonSocial}
      </Titulo>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <Tarjeta>
            <h2 className="mb-3 font-semibold">Documentos</h2>
            <div className="space-y-4">
              {documentosExigidos(p).map((t) => {
                const docs = p.documentos.filter((d) => d.tipo === t).sort((a, b) => b.subido.localeCompare(a.subido));
                return (
                  <div key={t} className="border-t border-stone-100 pt-3 first:border-0 first:pt-0">
                    <div className="text-sm font-medium">{DOCUMENTOS[t].texto}</div>
                    {!docs.length && <div className="text-xs text-stone-500">No lo ha subido todavía.</div>}
                    {docs.map((d) => {
                      const s = situacionDoc(d);
                      return (
                        <div key={d.id} className="mt-2 space-y-2 rounded-lg bg-stone-50 p-2 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <button onClick={() => verDocumento(d)} className="truncate text-left text-teal-700 hover:underline">📄 {d.nombre}</button>
                            <span className={`text-xs font-medium ${COLOR[s]}`}>{SITUACION[s]}</span>
                          </div>
                          <div className="flex flex-wrap items-end gap-2 text-xs text-stone-600">
                            <span>Subido {d.subido}</span>
                            {DOCUMENTOS[t].caduca && (
                              <label className="flex items-center gap-1">
                                Válido hasta
                                <input
                                  type="date"
                                  className="rounded border border-stone-300 px-1.5 py-0.5"
                                  value={d.caduca ?? ""}
                                  onChange={(e) => cambiarDoc(d.id, (x) => void (x.caduca = e.target.value || undefined))}
                                />
                              </label>
                            )}
                          </div>
                          {d.estado === "valido" && (
                            <div className="flex flex-wrap gap-2">
                              <input
                                className="min-w-0 flex-1 rounded border border-stone-300 px-2 py-1 text-xs"
                                placeholder="Si no es correcto, motivo (lo verá el proveedor)"
                                value={motivos[d.id] ?? ""}
                                onChange={(e) => setMotivos({ ...motivos, [d.id]: e.target.value })}
                              />
                              <Boton variante="peligro" className="px-2 py-1 text-xs" onClick={() => cambiarDoc(d.id, (x) => { x.estado = "rechazado"; x.motivo = (motivos[d.id] ?? "").slice(0, 300); })}>
                                No es válido
                              </Boton>
                            </div>
                          )}
                          {d.estado !== "valido" && (
                            <button className="text-xs text-stone-500 hover:underline" onClick={() => cambiarDoc(d.id, (x) => { x.estado = "valido"; delete x.motivo; })}>
                              Dar por válido
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Tarjeta>

          <Tarjeta>
            <h2 className="mb-2 font-semibold">Obras de referencia</h2>
            <p className="mb-3 text-xs text-stone-500">Llama a cada contacto para confirmar la obra antes de aprobar.</p>
            <ul className="space-y-2 text-sm">
              {p.obras.map((o, i) => (
                <li key={i} className="rounded-lg bg-stone-50 p-2">
                  <div>{o.descripcion || "—"}</div>
                  <div className="text-xs text-stone-500">{o.ano} · {o.importe ? euros(o.importe) : "importe no indicado"} · {o.contacto || "sin contacto"}</div>
                </li>
              ))}
            </ul>
          </Tarjeta>

          <Tarjeta>
            <h2 className="mb-2 font-semibold">Zonas y especialidades</h2>
            <p className="text-sm"><span className="text-stone-500">Zonas:</span> {p.zonas.join(", ") || "—"}</p>
            <p className="mt-1 text-sm"><span className="text-stone-500">Especialidades:</span> {p.especialidades.map(especialidad).join(", ") || "—"}</p>
            {p.presentacion && <p className="mt-2 whitespace-pre-line text-sm text-stone-600">{p.presentacion}</p>}
          </Tarjeta>
        </div>

        <div className="space-y-4">
          {avisos(p).length > 0 && (
            <Tarjeta className="border-amber-200 bg-amber-50">
              <h2 className="mb-1 text-sm font-semibold text-amber-950">Avisos</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-amber-950">
                {avisos(p).map((a) => <li key={a}>{a}</li>)}
              </ul>
              <p className="mt-2 text-xs text-amber-900">No bloquean la homologación. Revisa el documento y, si no es correcto, márcalo como no válido o suspende al proveedor.</p>
            </Tarjeta>
          )}
          <Tarjeta>
            <h2 className="mb-2 font-semibold">Requisitos</h2>
            <ul className="space-y-1 text-sm">
              {reqs.map((r) => (
                <li key={r.clave} className="flex gap-2"><span>{r.ok ? "✅" : "⬜"}</span>{r.texto}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.estado !== "aprobado" && (
                <Boton disabled={!cumple} onClick={() => cambiar((x) => { x.estado = "aprobado"; x.revisado = hoy(); })}>Aprobar</Boton>
              )}
              {p.estado === "aprobado" && (
                <Boton variante="secundario" onClick={() => cambiar((x) => { x.estado = "suspendido"; x.revisado = hoy(); })}>Suspender</Boton>
              )}
              {p.estado !== "rechazado" && (
                <Boton variante="peligro" onClick={() => cambiar((x) => { x.estado = "rechazado"; x.revisado = hoy(); })}>Rechazar</Boton>
              )}
              {p.estado === "rechazado" && <Boton variante="secundario" onClick={() => cambiar((x) => void (x.estado = "pendiente"))}>Reabrir</Boton>}
            </div>
            {p.estado === "pendiente" && <p className="mt-2 text-xs text-stone-500">Se aprobará solo cuando complete los requisitos.</p>}
            {p.estado === "aprobado" && p.aprobadoAutomatico && <p className="mt-2 text-xs text-stone-500">Aprobado automáticamente el {p.revisado}.</p>}
            {p.estado === "aprobado" && !cumple && <p className="mt-2 text-xs text-red-700">Tiene requisitos caducados: no se muestra a los clientes hasta que los renueve.</p>}
          </Tarjeta>

          <Tarjeta className="space-y-1 text-sm">
            <h2 className="mb-1 font-semibold">Datos</h2>
            <div>{p.tipo === "empresa" ? "Empresa" : "Autónomo"} · {p.nif}</div>
            <div>{p.contacto}</div>
            {p.telefono && <a className="block text-teal-700" href={`tel:${p.telefono}`}>{p.telefono}</a>}
            {p.email && <a className="block text-teal-700" href={`mailto:${p.email}`}>{p.email}</a>}
            {p.web && <div className="truncate text-stone-500">{p.web}</div>}
            <div className="text-stone-500">{p.trabajadores} trabajadores</div>
            <div className="text-stone-500">REA: {p.rea.inscrito ? p.rea.numero || "sí" : "no inscrito"}</div>
            <div className="text-stone-500">RC: {p.rc.aseguradora || "—"}{p.rc.capital ? ` · ${euros(p.rc.capital)}` : ""}</div>
            <div className="text-stone-500">Declaración responsable firmada el {p.declaracion?.fecha.slice(0, 10) ?? "—"}</div>
            <div className="text-stone-500">Solicitud del {p.creado}{p.revisado ? ` · revisado ${p.revisado}` : ""}</div>
          </Tarjeta>

          <Tarjeta className="space-y-2">
            <Campo etiqueta="Enlace privado del proveedor">
              <input readOnly className={inputCls} value={enlace} onFocus={(e) => e.target.select()} />
            </Campo>
            <Campo etiqueta="Notas internas">
              <textarea rows={4} className={inputCls} value={p.notasInternas} onChange={(e) => cambiar((x) => void (x.notasInternas = e.target.value.slice(0, 4000)))} />
            </Campo>
            <Boton variante="peligro" className="w-full" onClick={borrar}>Borrar proveedor</Boton>
          </Tarjeta>
        </div>
      </div>
    </>
  );
}
