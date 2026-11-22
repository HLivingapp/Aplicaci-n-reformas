"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { alCambiar, invitarProveedor, leerInvitaciones, type Invitacion } from "@/lib/encargos";
import { AVISO_NO_HOMOLOGADO, noHomologadosEn, type ProveedorPublico } from "@/lib/no-homologados";

/**
 * Proveedores sin homologar de la zona, con su contacto público. El cliente puede invitarles a homologarse sin coste;
 * al homologarse dejan de salir aquí y pasan a la red.
 */
export function NoHomologados({ zona, datos }: { zona?: string; datos?: Invitacion["datos"] }) {
  const [lista, setLista] = useState<ProveedorPublico[]>([]);
  const [mias, setMias] = useState<Invitacion[]>([]);
  const proyectoId = datos?.proyectoId;
  useEffect(() => {
    const f = () => {
      setLista(noHomologadosEn(zona));
      setMias(leerInvitaciones().filter((i) => i.publicoId && (!proyectoId || i.datos.proyectoId === proyectoId)));
    };
    f();
    return alCambiar(f);
  }, [zona, proyectoId]);
  if (!lista.length) return null;
  const enlace = (i: Invitacion) => `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/reformistas/?invita=${i.codigo}`;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
      <h3 className="font-semibold">Otros profesionales de tu zona, sin homologar</h3>
      <p className="mt-1 text-stone-600">
        Empresas que aún no están en la red. Te damos su contacto y sus referencias públicas de internet. Si te interesa alguno, invítale a homologarse: homologarse no le cuesta nada y, cuando lo haga, podrás llevar tu reforma con él en la app.
      </p>
      <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-950">⚠️ {AVISO_NO_HOMOLOGADO}</p>
      <p className="mt-2 text-xs text-stone-600">
        Invitarle es gratis para ti: no pagas nada, ni reserva ni comisión, en esta reforma con él. Él tampoco paga nada en esta primera reforma: ni la homologación, ni la visita, ni comisión. Una vez homologado, su contacto deja de salir aquí y pasa a la red de homologados con las condiciones normales.
      </p>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {lista.map((p) => {
          const inv = mias.find((i) => i.publicoId === p.id);
          return (
            <li key={p.id} className="flex flex-col rounded-xl border border-stone-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.nombre}</div>
                  <div className="text-xs text-stone-500">{p.oficios.join(", ")} · {p.zonas.join(", ")}</div>
                </div>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200">No homologado</span>
              </div>
              {p.valoracion && <div className="mt-2 text-xs text-stone-700">★ {p.valoracion.media.toLocaleString("es-ES")} · {p.valoracion.n} reseñas en {p.valoracion.fuente}</div>}
              <div className="mt-1 text-xs text-stone-700">
                {p.telefono && <div>📞 {p.telefono}</div>}
                {p.web && <div>🌐 {p.web}</div>}
              </div>
              <div className="mt-1 text-[11px] text-stone-400">Fuente: {p.fuente} · consultado el {new Date(p.comprobado).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
              <div className="mt-3 flex-1" />
              {!datos ? (
                <Link href="/nuevo" className="rounded-lg border border-violet-700 px-3 py-1.5 text-center text-xs font-medium text-violet-800 hover:bg-violet-50">Calcula tu presupuesto para invitarle</Link>
              ) : inv ? (
                <div className="space-y-1 text-xs">
                  <p className="text-violet-900">Invitación creada. Mándale este enlace: homologarse es gratis.</p>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Hola, quiero hacer mi reforma contigo a través de la app. Homologarte es gratis: ${enlace(inv)}`)}`} target="_blank" rel="noreferrer" className="inline-block rounded-lg bg-violet-700 px-3 py-1.5 font-semibold text-white">Enviar por WhatsApp</a>{" "}
                  <Link href={`/reformistas/?invita=${inv.codigo}`} className="text-stone-400 underline">Demo: abrir como el proveedor</Link>
                </div>
              ) : (
                <button onClick={() => invitarProveedor(datos, p.nombre, p.id)} className="rounded-lg border border-violet-700 px-3 py-1.5 text-xs font-medium text-violet-800 hover:bg-violet-50">
                  Invitarle a homologarse (gratis)
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-stone-400">Demostración: las empresas sin homologar son ficticias y el contacto es de ejemplo. Solo mostramos datos públicos de empresas; si eres una de ellas y no quieres aparecer, escríbenos y te retiramos.</p>
    </section>
  );
}
