"use client";

import Link from "next/link";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { SimuladorHipoteca } from "@/components/SimuladorHipoteca";

const PASOS = [
  { i: "🧮", t: "Calcula tu reforma", d: "Saca el presupuesto partida a partida en la app: es la cifra que vas a financiar." },
  { i: "🏦", t: "Compara bancos", d: "Mira qué préstamo o ampliación de hipoteca ofrece cada entidad para reformas." },
  { i: "📑", t: "Memoria técnica", d: "El banco suele pedirla firmada por un arquitecto; te ayudamos a prepararla con tu reformista." },
  { i: "✍️", t: "Firma y empieza", d: "Con la financiación aprobada, firmas la obra en la app y arranca la reforma." },
];

/** «Reforma en tu hipoteca»: simulador, comparativa de bancos y aval ICO para la entrada. */
export default function Hipoteca() {
  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <section className="bg-gradient-to-b from-teal-50 to-stone-50">
        <div className="mx-auto max-w-4xl px-4 pb-6 pt-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Financiación</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Reforma en tu hipoteca</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Si compras casa para reformarla, o ya tienes hipoteca, puedes financiar la obra junto con el préstamo de la vivienda y pagarla a largo plazo. Simula tu cuota y compara lo que ofrece cada banco.
          </p>
          <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PASOS.map((p, n) => (
              <li key={p.t} className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
                <div className="flex items-center gap-1.5"><span className="text-xl" aria-hidden>{p.i}</span><span className="text-xs font-semibold text-stone-400">{n + 1}</span></div>
                <div className="mt-1 text-sm font-semibold">{p.t}</div>
                <p className="mt-0.5 text-xs text-stone-600">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <main className="mx-auto max-w-4xl space-y-6 px-4 pb-16">
        <SimuladorHipoteca importe={40000} />

        <section id="aval-ico" className="scroll-mt-20 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
          <h2 className="font-semibold">🔑 Aval ICO para la entrada de tu primera vivienda</h2>
          <p className="mt-1 text-stone-600">El Estado avala hasta el 20 % del préstamo para que no tengas que reunir toda la entrada. Si compras para reformar, puedes juntar compra y reforma en la misma operación.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-600">
            <li>Para menores de 36 años y familias con menores a cargo, con límites de ingresos y de precio de la vivienda.</li>
            <li>Se pide a través de los bancos adheridos, que son quienes lo conceden.</li>
            <li>Te acompañamos en la solicitud; la concesión depende del banco y de los requisitos vigentes.</li>
          </ul>
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/nuevo" className="rounded-2xl bg-teal-700 p-4 text-center font-semibold text-white hover:bg-teal-800">Calcula el precio de tu reforma</Link>
          <Link href="/subvenciones" className="rounded-2xl bg-emerald-50 p-4 text-center font-semibold text-emerald-900 ring-1 ring-emerald-200 hover:bg-emerald-100">Mira antes las subvenciones activas</Link>
        </div>
      </main>
    </div>
  );
}
