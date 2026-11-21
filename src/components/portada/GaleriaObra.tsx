"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publico } from "@/lib/base";

/**
 * Fotos reales de una reforma integral terminada en Madrid. Solo interiores, sin nada que permita
 * reconocer la dirección (ni fachadas, ni portal, ni vistas a la calle), renombradas y sin datos GPS.
 */
const FOTOS = [
  { f: "cocina", t: "Cocina en L con columnas de horno y microondas", alto: false },
  { f: "bano", t: "Baño con azulejo verde, mueble de madera y ducha", alto: true },
  { f: "salon", t: "Salón luminoso con suelo en espiga", alto: false },
  { f: "ducha", t: "Ducha a ras de suelo con mampara negra", alto: true },
  { f: "vestidor", t: "Vestidor a medida", alto: false },
  { f: "salon-amplio", t: "Salón amplio con radiadores nuevos", alto: false },
  { f: "bano-lavabo", t: "Lavabo con toallero eléctrico", alto: true },
  { f: "pasillo", t: "Pasillo con armarios empotrados", alto: true },
];

export function GaleriaObra({ empezar }: { empezar: string }) {
  const [abierta, setAbierta] = useState<number | null>(null);

  useEffect(() => {
    if (abierta === null) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(null);
      if (e.key === "ArrowRight") setAbierta((i) => (i === null ? i : (i + 1) % FOTOS.length));
      if (e.key === "ArrowLeft") setAbierta((i) => (i === null ? i : (i - 1 + FOTOS.length) % FOTOS.length));
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierta]);

  return (
    <section id="reformas" className="scroll-mt-16 bg-stone-100">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Reformas terminadas</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Así queda una reforma integral</h2>
            <p className="mt-3 max-w-2xl text-lg text-stone-600">Un piso en Madrid, reformado de arriba abajo: cocina abierta, suelo en espiga, baño completo, carpintería e instalaciones nuevas.</p>
          </div>
          <Link href={empezar} className="shrink-0 self-start rounded-2xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 md:self-auto">Calcular la mía</Link>
        </div>

        {/* Cuatro columnas, cada una con una foto horizontal y una vertical, para que el mosaico quede completo. */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[[0, 1], [6, 2], [4, 3], [7, 5]].map((col) => (
            <ul key={col.join()} className="flex h-[372px] flex-col gap-3 sm:h-[526px] sm:gap-4 lg:h-[586px]">
              {col.map((i) => {
                const x = FOTOS[i];
                return (
                  <li key={x.f} className={`min-h-0 ${x.alto ? "flex-[2]" : "flex-[1]"}`}>
                    <button onClick={() => setAbierta(i)} className="group relative block h-full w-full overflow-hidden rounded-2xl bg-stone-200 text-left">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={publico(`/fotos/obra/${x.f}.webp`)} alt={x.t} loading="lazy" className="block h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">{x.t}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>

      {abierta !== null && (
        <div role="dialog" aria-modal="true" aria-label={FOTOS[abierta].t} onClick={() => setAbierta(null)} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publico(`/fotos/obra/${FOTOS[abierta].f}.webp`)} alt={FOTOS[abierta].t} className="max-h-[80dvh] max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <p className="mt-3 text-center text-sm text-stone-200">{FOTOS[abierta].t}</p>
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAbierta((abierta - 1 + FOTOS.length) % FOTOS.length)} className="rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white/25" aria-label="Foto anterior">←</button>
            <button onClick={() => setAbierta(null)} className="rounded-full bg-white px-4 py-2 font-medium text-stone-900">Cerrar</button>
            <button onClick={() => setAbierta((abierta + 1) % FOTOS.length)} className="rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white/25" aria-label="Foto siguiente">→</button>
          </div>
        </div>
      )}
    </section>
  );
}
