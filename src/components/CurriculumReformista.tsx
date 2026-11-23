"use client";

import { useEffect, useState } from "react";
import { publico } from "@/lib/base";
import { sinContactos } from "@/lib/anonimizar";
import { fotosSubidas, type FotoTrabajo } from "@/lib/fotos-trabajos";
import { HABILITACIONES, INICIOS, OPCIONES_HABILITACION, SERVICIOS_PREVENCION, TRAMOS_FACTURACION } from "@/lib/proveedores";
import type { FichaRed } from "@/lib/red";

/** Currículum anónimo del reformista que ve el cliente al elegir: experiencia, prevención, certificaciones, disponibilidad y fotos de trabajos. */
export function CurriculumReformista({ f }: { f: FichaRed }) {
  const [fotos, setFotos] = useState<FotoTrabajo[]>(f.fotos ?? []);
  const [grande, setGrande] = useState<FotoTrabajo | null>(null);
  useEffect(() => {
    const subidas = fotosSubidas(f.id);
    if (subidas.length) setFotos(subidas);
  }, [f.id]);
  const p = f.perfil;
  const filas: [string, string][] = [];
  if (p) {
    filas.push(["Experiencia", `${p.proyectosEjecutados.toLocaleString("es-ES")} proyectos ejecutados${p.tiposProyecto.length ? `: ${p.tiposProyecto.join(", ").toLowerCase()}` : ""}`]);
    if (p.cuentas.presentadas !== null) filas.push(["Cuentas", p.cuentas.presentadas ? `Presentadas las de ${p.cuentas.ejercicio}` : `No ha presentado las de ${p.cuentas.ejercicio}`]);
  }
  // Lo que importa para contratar: REA, boletines, legalizaciones y volumen real
  const clave: { k: string; v: string; ok: boolean | null }[] = [
    { k: "Inscrito en el REA", v: f.rea === undefined ? "Sin dato" : f.rea ? "Sí" : "No", ok: f.rea ?? null },
    ...HABILITACIONES.map((h) => {
      const x = p?.habilitaciones?.[h.clave] ?? "";
      const o = OPCIONES_HABILITACION.find((y) => y.valor === x);
      return { k: h.corto, v: o?.cliente ?? "Sin dato", ok: x ? x !== "no" : null };
    }),
  ];
  const tramo = TRAMOS_FACTURACION.find((t) => t.valor === p?.facturacion?.tramo)?.texto;
  const opiniones = f.opiniones ?? [];
  filas.push(["REA", f.rea === undefined ? "Sin dato" : f.rea ? "Inscrito en el Registro de Empresas Acreditadas" : "No inscrito en el REA (no es obligatorio para todos)"]);
  if (p) {
    const sp = SERVICIOS_PREVENCION.find((s) => s.valor === p.servicioPrevencion)?.texto;
    if (sp) filas.push(["Prevención", sp]);
    if (p.cursosPrevencion.length) filas.push(["Formación PRL del equipo", p.cursosPrevencion.join(", ")]);
    const certs = [...p.certificaciones, ...(p.otrasCertificaciones ? [sinContactos(p.otrasCertificaciones)] : [])];
    if (certs.length) filas.push(["Certificaciones", certs.join(", ")]);
    const ini = INICIOS.find((i) => i.valor === p.disponibilidad.inicio)?.texto;
    if (ini) filas.push(["Disponibilidad", `Puede empezar: ${ini.toLowerCase()} · lleva ${p.disponibilidad.obrasSimultaneas} obra${p.disponibilidad.obrasSimultaneas === 1 ? "" : "s"} a la vez${p.disponibilidad.visitas ? ` · visitas: ${sinContactos(p.disponibilidad.visitas).toLowerCase()}` : ""}`]);
  }
  filas.push(["Zonas", f.zonas.join(", ")], ["Equipo", `${f.trabajadores} persona${f.trabajadores === 1 ? "" : "s"} · ${f.tipo === "empresa" ? "empresa" : "autónomo"}`]);

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-stone-50 p-3 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Currículum de {f.codigo}</div>
      <div className="rounded-xl bg-white p-3 ring-1 ring-stone-200" data-testid="importa-contratar">
        <div className="text-xs font-semibold text-stone-800">Lo que importa para contratar</div>
        <ul className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
          {clave.map((c) => (
            <li key={c.k} className="flex items-center gap-2">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${c.ok === null ? "bg-stone-100 text-stone-400" : c.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-50 text-red-700"}`}>{c.ok === null ? "?" : c.ok ? "✓" : "✕"}</span>
              <span className="text-stone-500">{c.k}:</span> <span className="font-medium text-stone-800">{c.v}</span>
            </li>
          ))}
          <li className="flex items-center gap-2 sm:col-span-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px]">€</span>
            <span className="text-stone-500">Facturación{p?.facturacion ? ` ${p.facturacion.ejercicio}` : ""}:</span> <span className="font-medium text-stone-800">{tramo ?? "Sin dato"}</span>
            {f.facturacionApp ? <span className="text-stone-500">· {f.facturacionApp.toLocaleString("es-ES", { useGrouping: "always" } as Intl.NumberFormatOptions)} € en obras firmadas en la app</span> : null}
          </li>
        </ul>
      </div>
      {f.presentacion && <p className="text-stone-700">{sinContactos(f.presentacion)}</p>}
      <dl className="grid gap-x-3 gap-y-1 text-xs sm:grid-cols-[9rem_1fr]">
        {filas.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-medium text-stone-500">{k}</dt>
            <dd className="text-stone-800">{v}</dd>
          </div>
        ))}
      </dl>
      {fotos.length > 0 ? (
        <div>
          <div className="mb-1 text-xs font-medium text-stone-500">Fotos de sus trabajos</div>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {fotos.map((x, i) => (
              <button key={i} type="button" onClick={() => setGrande(x)} className="aspect-square overflow-hidden rounded-lg bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.src.startsWith("/") ? publico(x.src) : x.src} alt={x.texto ? sinContactos(x.texto) : `Trabajo ${i + 1} de ${f.codigo}`} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-stone-500">Todavía no ha subido fotos de sus trabajos.</p>
      )}
      <div data-testid="opiniones">
        <div className="mb-1 text-xs font-medium text-stone-500">Opiniones de sus clientes · entrevista al terminar la obra</div>
        {opiniones.length ? (
          <ul className="space-y-2">
            {opiniones.map((o) => (
              <li key={o.id} className="rounded-xl bg-white p-3 text-xs ring-1 ring-stone-200">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-stone-800">{sinContactos(o.obra)}</span>
                  <span className="text-stone-400">{new Date(o.fecha).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</span>
                </div>
                <p className="mt-1.5"><span className="font-semibold text-emerald-800">Lo mejor: </span>{sinContactos(o.loMejor)}</p>
                <p className="mt-1"><span className="font-semibold text-amber-800">En qué falla: </span>{sinContactos(o.enQueFalla)}</p>
                <p className="mt-1.5 flex flex-wrap gap-x-3 text-stone-500">
                  {o.cumplioPlazo !== null && <span>{o.cumplioPlazo ? "✓ Cumplió el plazo" : "✕ No cumplió el plazo"}</span>}
                  {o.cumplioPresupuesto !== null && <span>{o.cumplioPresupuesto ? "✓ Sin desvíos de presupuesto" : "✕ Hubo desvíos de presupuesto"}</span>}
                  <span>{o.recomendaria === "si" ? "👍 Lo recomendaría" : o.recomendaria === "con_reservas" ? "🤔 Lo recomendaría con reservas" : "👎 No lo recomendaría"}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-stone-500">Todavía no tiene entrevistas. Al terminar cada obra hablamos con el cliente para saber qué hizo mejor y en qué falló.</p>
        )}
      </div>
      <p className="text-[11px] text-stone-400">Para proteger a ambos, no mostramos el nombre ni los contactos del reformista hasta que firméis el contrato en la app.</p>
      {grande && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setGrande(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={grande.src.startsWith("/") ? publico(grande.src) : grande.src} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
