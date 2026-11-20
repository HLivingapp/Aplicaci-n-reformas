"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { Muro } from "@/components/Muro";
import { conBaseDeDatos } from "@/lib/modo";
import { FICHAS_EJEMPLO, fichasRed, type FichaRed } from "@/lib/red";
import { leerLocal } from "@/lib/store";
import { incluye, useSuscripcion } from "@/lib/suscripcion";

const conServidor = conBaseDeDatos && process.env.NEXT_PUBLIC_ESTATICA !== "1";
const CLAVE_PEDIDOS = "app-reformas:pedidos-red";

const leerPedidos = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PEDIDOS) ?? "[]");
  } catch {
    return [];
  }
};

export default function RedProfesionales() {
  const s = useSuscripcion();
  const [fichas, setFichas] = useState<FichaRed[] | null>(null);
  const [zona, setZona] = useState("");
  const [pedidos, setPedidos] = useState<string[]>([]);

  useEffect(() => {
    setPedidos(leerPedidos());
    if (conServidor) {
      fetch("/api/red", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => setFichas(j.fichas ?? []))
        .catch(() => setFichas([]));
    } else {
      setFichas([...fichasRed(leerLocal().proveedores).map((f) => ({ ...f, obrasEnApp: 1 })), ...FICHAS_EJEMPLO]);
    }
  }, []);

  const zonas = useMemo(() => [...new Set((fichas ?? []).flatMap((f) => f.zonas))].sort(), [fichas]);
  const lista = (fichas ?? []).filter((f) => !zona || f.zonas.includes(zona)).sort((a, b) => b.obrasEnApp - a.obrasEnApp);
  const suscrito = s ? incluye(s.plan, "basico") : false;

  const pedir = (f: FichaRed) => {
    const n = [...new Set([...pedidos, f.id])];
    setPedidos(n);
    try {
      localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(n));
    } catch {
      /* sin almacenamiento */
    }
  };

  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <section className="bg-gradient-to-b from-teal-50 to-stone-50">
        <div className="mx-auto max-w-5xl px-4 pb-6 pt-10">
          <h1 className="text-3xl font-semibold tracking-tight">Red de reformistas homologados</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Todos han pasado la homologación: inscritos en el Registro de Empresas Acreditadas, al corriente con Hacienda y con seguro de responsabilidad civil. Lo comprobamos automáticamente y aquí ves la fecha de la última comprobación. Aparecen primero los que más obras han hecho con nosotros.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-5xl px-4 pb-16">
        {s && !suscrito && (
          <div className="mb-5">
            <Muro plan="basico" volver="/red" titulo="Suscríbete y accede a nuestra red de profesionales">
              Pide presupuesto a los reformistas que elijas y compara sus ofertas con tu presupuesto de referencia.
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
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200" title="Registro de Empresas Acreditadas, Hacienda y seguro de responsabilidad civil">
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
                  <div className="rounded-lg bg-stone-50 p-2"><div className="text-base font-semibold">{(f.capitalRC / 1000).toLocaleString("es-ES")} mil €</div>seguro RC</div>
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
                {pedidos.includes(f.id) ? (
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-center text-sm text-emerald-900">✓ Presupuesto pedido. Te responderá en la app; tu teléfono no se comparte hasta que tú aceptes.</div>
                ) : suscrito ? (
                  <button onClick={() => pedir(f)} className="rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">Pedir presupuesto</button>
                ) : (
                  <Link href="/suscripcion?volver=%2Fred" className="rounded-xl border border-teal-700 py-2.5 text-center text-sm font-semibold text-teal-800 hover:bg-teal-50">🔒 Pedir presupuesto · Plan Básico 5 €/mes</Link>
                )}
              </li>
            ))}
          </ul>
        )}
        {!conServidor && <p className="mt-6 text-center text-xs text-stone-400">Demostración: los reformistas que aparecen son ficticios.</p>}
      </main>
    </div>
  );
}
