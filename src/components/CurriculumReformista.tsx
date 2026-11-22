"use client";

import { useEffect, useState } from "react";
import { publico } from "@/lib/base";
import { sinContactos } from "@/lib/anonimizar";
import { fotosSubidas, type FotoTrabajo } from "@/lib/fotos-trabajos";
import { INICIOS, SERVICIOS_PREVENCION } from "@/lib/proveedores";
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
