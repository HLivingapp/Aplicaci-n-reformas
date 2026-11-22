"use client";

import { puntosVisibilidad } from "@/lib/visibilidad";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { Muro } from "@/components/Muro";
import { conBaseDeDatos } from "@/lib/modo";
import { FICHAS_COMUNIDADES, FICHAS_EJEMPLO, fichasRed, type FichaRed } from "@/lib/red";
import { leerLocal } from "@/lib/store";
import { incluye, useSuscripcion } from "@/lib/suscripcion";
import { tarifaDe } from "@/lib/encargos";
import { BotonLink } from "@/components/ui";

const conServidor = conBaseDeDatos && process.env.NEXT_PUBLIC_ESTATICA !== "1";

export default function RedProfesionales() {
  const s = useSuscripcion();
  const [fichas, setFichas] = useState<FichaRed[] | null>(null);
  const [zona, setZona] = useState("");

  useEffect(() => {
    if (conServidor) {
      fetch("/api/red", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => setFichas(j.fichas ?? []))
        .catch(() => setFichas([]));
    } else {
      setFichas([...fichasRed(leerLocal().proveedores).map((f) => ({ ...f, obrasEnApp: 1 })), ...FICHAS_EJEMPLO, ...FICHAS_COMUNIDADES]);
    }
  }, []);

  const zonas = useMemo(() => [...new Set((fichas ?? []).flatMap((f) => f.zonas))].sort(), [fichas]);
  const lista = (fichas ?? []).filter((f) => !zona || f.zonas.includes(zona)).sort((a, b) => puntosVisibilidad(b).total - puntosVisibilidad(a).total);
  const suscrito = s ? incluye(s.plan, "basico") : false;


  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <section className="bg-gradient-to-b from-teal-50 to-stone-50">
        <div className="mx-auto max-w-5xl px-4 pb-6 pt-10">
          <h1 className="text-3xl font-semibold tracking-tight">Red de reformistas homologados</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Todos han pasado la homologación: inscritos en el Registro de Empresas Acreditadas, con certificado al corriente de pago y con seguro RSC (responsabilidad civil). Lo comprobamos automáticamente y aquí ves la fecha de la última comprobación. Aparecen primero los que más obras han hecho en la app.
          </p>
          <p className="mt-2 max-w-2xl text-stone-600">Cada uno ha cargado sus tarifas, así que no tienes que pedir presupuestos uno a uno: calcula el tuyo y verás lo que te costaría con cada reformista.</p>
          <BotonLink href="/nuevo" className="mt-4">Calcular mi presupuesto gratis</BotonLink>
        </div>
      </section>
      <main className="mx-auto max-w-5xl px-4 pb-16">
        {s && !suscrito && (
          <div className="mb-5">
            <Muro plan="basico" volver="/red" titulo="Suscríbete y accede a nuestra red de profesionales">
              Cada reformista ha cargado sus tarifas: con tu presupuesto ves lo que te costaría con cada uno, eliges los que más te interesan y quedas con ellos para una visita.
            </Muro>
          </div>
        )}

        {zonas.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            <button onClick={() => setZona("")} className={`rounded-full px-3 py-1 text-sm ${!zona ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}>Todas las zonas</button>
            {zonas.map((z) => (
              <button key={z} onClick={() => setZona(zona === z ? "" : z)} className={`rounded-full px-3 py-1 text-sm ${zona === z ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}>{z}</button>
            ))}
          </div>
        )}

        {!fichas ? (
          <p className="p-6 text-center text-stone-500">Cargando…</p>
        ) : lista.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-stone-500">Todavía no hay reformistas homologados en esta zona.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {lista.map((f) => (
              <li key={f.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">Reformista {f.codigo}</div>
                    <div className="text-xs text-stone-500">{f.tipo === "empresa" ? "Empresa" : "Autónomo"} · {f.trabajadores} persona{f.trabajadores === 1 ? "" : "s"} · {f.zonas.join(", ")}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200" title="Registro de Empresas Acreditadas, certificado al corriente de pago y seguro RSC">
                    ✓ Homologado · comprobado el {new Date(f.comprobado).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.especialidades.map((e) => <span key={e} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">{e}</span>)}
                </div>
                {f.presentacion && <p className="mt-2 text-sm text-stone-600">{f.presentacion}</p>}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-stone-50 p-2"><div className="text-base font-semibold">{f.obrasEnApp}</div>obras en la app</div>
                  <div className="rounded-lg bg-stone-50 p-2"><div className="text-base font-semibold">{f.obrasReferencia}</div>obras de referencia</div>
                  <div className="rounded-lg bg-stone-50 p-2"><div className="text-base font-semibold">{(f.capitalRC / 1000).toLocaleString("es-ES")} mil €</div>seguro RSC</div>
                </div>
                {f.valoraciones && f.valoraciones.length > 0 && (
                  <div className="mt-3 text-xs">
                    <div className="font-medium text-stone-600">Valoraciones por fase de obra</div>
                    <ul className="mt-1 space-y-0.5">
                      {f.valoraciones.map((v) => (
                        <li key={v.fase} className="flex items-center gap-2">
                          <span className="w-32 text-stone-500">{v.fase}</span>
                          <span className="h-1.5 flex-1 rounded-full bg-stone-100"><span className="block h-1.5 rounded-full bg-amber-400" style={{ width: `${(v.media / 5) * 100}%` }} /></span>
                          <span className="w-16 text-right text-stone-700">★ {v.media.toLocaleString("es-ES")} ({v.n})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex-1" />
                <div className="rounded-xl bg-teal-50 p-2.5 text-center text-sm text-teal-900">
                  {tarifaDe(f) ? "Ha cargado sus tarifas: verás su precio para tu casa en tu presupuesto." : "Todavía no ha cargado sus tarifas."}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!conServidor && <p className="mt-6 text-center text-xs text-stone-400">Demostración: los reformistas que aparecen son ficticios.</p>}
      </main>
    </div>
  );
}
