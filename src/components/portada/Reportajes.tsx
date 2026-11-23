"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { publico } from "@/lib/base";
import { NOMBRE_GAMA, REPORTAJES, eurosM2Referencia, type Reportaje } from "@/lib/reportajes";

const euros = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Carrusel de reportajes de reformas terminadas: cada tarjeta abre su galería a pantalla completa. */
export function Reportajes({ empezar }: { empezar: string }) {
  const [abierto, setAbierto] = useState<{ r: Reportaje; i: number } | null>(null);
  const pista = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const total = abierto.r.fotos.length;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(null);
      if (e.key === "ArrowRight") setAbierto((a) => (a ? { ...a, i: (a.i + 1) % total } : a));
      if (e.key === "ArrowLeft") setAbierto((a) => (a ? { ...a, i: (a.i - 1 + total) % total } : a));
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto]);

  const mover = (dir: number) => {
    const el = pista.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.9, 760), behavior: "smooth" });
  };

  return (
    <section id="reportajes" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Reportajes de obras terminadas</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{REPORTAJES.length} reformas reales, foto a foto</h2>
            <p className="mt-3 max-w-2xl text-lg text-stone-600">Pisos terminados y listos para entrar a vivir. Toca un reportaje para verlo entero y compara con el precio de referencia de su gama.</p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <button onClick={() => mover(-1)} aria-label="Reportajes anteriores" className="grid h-11 w-11 place-items-center rounded-full border border-stone-300 text-lg hover:bg-stone-100">←</button>
            <button onClick={() => mover(1)} aria-label="Más reportajes" className="grid h-11 w-11 place-items-center rounded-full border border-stone-300 text-lg hover:bg-stone-100">→</button>
          </div>
        </div>

        <ul ref={pista} className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:thin]">
          {REPORTAJES.map((r) => (
            <li key={r.id} className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-stone-50 shadow-sm">
                <button onClick={() => setAbierto({ r, i: 0 })} className="group relative block aspect-[4/3] w-full overflow-hidden bg-stone-200 text-left" aria-label={`Ver reportaje: ${r.titulo}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={publico(r.fotos[0].f)} alt={r.fotos[0].t} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-800">{r.tipo}</span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white">📷 {r.fotos.length} fotos</span>
                </button>
                <div className="grid grid-cols-3 gap-1 px-1 pt-1">
                  {r.fotos.slice(1, 4).map((x, k) => (
                    <button key={x.f} onClick={() => setAbierto({ r, i: k + 1 })} className="aspect-[4/3] overflow-hidden rounded-lg bg-stone-200" aria-label={x.t}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={publico(x.f)} alt="" loading="lazy" className="h-full w-full object-cover transition hover:opacity-85" />
                    </button>
                  ))}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-semibold leading-snug">{r.titulo}</h3>
                  <p className="mt-2 text-sm text-stone-600">{r.resumen}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {r.destacados.map((d) => <li key={d} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">{d}</li>)}
                  </ul>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div>
                      <p className="text-xs text-stone-500">{NOMBRE_GAMA[r.gama]} · referencia</p>
                      <p className="whitespace-nowrap text-lg font-semibold text-stone-900">desde {euros(eurosM2Referencia(r.gama))} €/m²</p>
                    </div>
                    <button onClick={() => setAbierto({ r, i: 0 })} className="shrink-0 whitespace-nowrap rounded-xl bg-stone-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-stone-700">Ver fotos</button>
                  </div>
                </div>
              </article>
            </li>
          ))}
          <li className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]">
            <div className="flex h-full min-h-[420px] flex-col justify-center rounded-3xl bg-teal-700 p-8 text-white">
              <p className="font-display text-3xl font-semibold leading-tight">¿Cuánto costaría la tuya?</p>
              <p className="mt-3 text-teal-50">Pon tu dirección y en 2 minutos ves el presupuesto partida a partida, dentro de la app.</p>
              <Link href={empezar} className="mt-6 self-start rounded-2xl bg-white px-5 py-3 font-semibold text-teal-800 hover:bg-teal-50">Calcular mi reforma</Link>
            </div>
          </li>
        </ul>
        <p className="mt-2 text-xs text-stone-500">Precios orientativos de referencia por gama en la app (IVA no incluido). El presupuesto real se calcula partida a partida con los datos de tu vivienda.</p>
      </div>

      {abierto && (
        <div role="dialog" aria-modal="true" aria-label={abierto.r.titulo} onClick={() => setAbierto(null)} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
          <p className="mb-3 text-center text-sm font-semibold text-white">{abierto.r.titulo} <span className="font-normal text-stone-300">· {abierto.i + 1}/{abierto.r.fotos.length}</span></p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publico(abierto.r.fotos[abierto.i].f)} alt={abierto.r.fotos[abierto.i].t} className="max-h-[68dvh] max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <p className="mt-3 text-center text-sm text-stone-200">{abierto.r.fotos[abierto.i].t}</p>
          <div className="mt-3 flex max-w-full gap-1.5 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            {abierto.r.fotos.map((x, k) => (
              <button key={x.f} onClick={() => setAbierto({ ...abierto, i: k })} aria-label={x.t} className={`h-12 w-16 shrink-0 overflow-hidden rounded-md ${k === abierto.i ? "ring-2 ring-white" : "opacity-60 hover:opacity-100"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={publico(x.f)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAbierto({ ...abierto, i: (abierto.i - 1 + abierto.r.fotos.length) % abierto.r.fotos.length })} className="rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white/25" aria-label="Foto anterior">←</button>
            <button onClick={() => setAbierto(null)} className="rounded-full bg-white px-4 py-2 font-medium text-stone-900">Cerrar</button>
            <button onClick={() => setAbierto({ ...abierto, i: (abierto.i + 1) % abierto.r.fotos.length })} className="rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white/25" aria-label="Foto siguiente">→</button>
          </div>
        </div>
      )}
    </section>
  );
}
