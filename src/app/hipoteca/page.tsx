"use client";

import Link from "next/link";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { SimuladorHipoteca } from "@/components/SimuladorHipoteca";
import { ComparativaBancos } from "@/components/ComparativaBancos";
import { AVAL_ICO, ENTIDADES_AVAL_ICO, FUENTE_AVAL_ICO, TU_CASA } from "@/lib/ayudas-compra";
import { BANCOS_REFORMA } from "@/lib/beneficios";

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
        <SimuladorHipoteca importe={40000} conBancos={false} />

        <section className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
          <h2 className="text-lg font-semibold">1. Bancos con producto para financiar la reforma</h2>
          <p className="mt-1 text-stone-600">Entidades que tienen un producto pensado para reformas: incluida en la hipoteca, o con un préstamo específico.</p>
          <ComparativaBancos soloTipo="Préstamo hipotecario" titulo="🏠 Reforma incluida en la hipoteca" id="reforma-en-hipoteca" />
          <ComparativaBancos soloTipo="Préstamo personal" titulo="🧾 Préstamo específico para reformas" id="prestamo-reforma" />
        </section>

        <section id="ayudas-compra" className="scroll-mt-20 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
          <h2 className="text-lg font-semibold">2. Bancos sin producto de reforma que dan acceso a ayudas para comprar tu primera vivienda</h2>
          <p className="mt-1 text-stone-600">Si compras para reformar, estas ayudas públicas se piden a través del banco junto con la hipoteca.</p>

          <div className="mt-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
            <h3 className="font-semibold text-amber-950">💶 {TU_CASA.titulo}</h3>
            <p className="mt-1 rounded-lg bg-white/70 px-2 py-1 text-xs font-medium text-amber-900">Estado: {TU_CASA.estado}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
              {TU_CASA.puntos.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <a href={TU_CASA.fuente} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-teal-700 underline">Texto en el BOE (Real Decreto-ley 29/2026, art. 19)</a>
          </div>

          <div id="aval-ico" className="mt-3 scroll-mt-20 rounded-xl bg-stone-50 p-3 ring-1 ring-stone-200">
            <h3 className="font-semibold">🔑 {AVAL_ICO.titulo}</h3>
            <p className="mt-1 text-stone-600">{AVAL_ICO.resumen}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-600">
              {AVAL_ICO.puntos.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>

          <h3 className="mt-4 font-semibold">Entidades con el aval ICO operativo ({ENTIDADES_AVAL_ICO.length})</h3>
          <p className="mt-0.5 text-xs text-stone-500">Según el ICO a 22/11/2026. Son también el canal previsible para el préstamo TU CASA cuando se abra, aunque todavía no hay lista oficial para él. ✓ = además tiene producto de reforma (apartado 1).</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {ENTIDADES_AVAL_ICO.map((n) => {
              const conReforma = BANCOS_REFORMA.some((b) => b.banco.toLowerCase().includes(n.toLowerCase().replace(" banco", "")) || n.toLowerCase().includes(b.banco.toLowerCase()));
              return (
                <li key={n} className={`rounded-full px-2.5 py-1 text-xs ${conReforma ? "bg-teal-50 font-medium text-teal-900 ring-1 ring-teal-200" : "bg-stone-50 text-stone-700 ring-1 ring-stone-200"}`}>
                  {conReforma && "✓ "}{n}
                </li>
              );
            })}
          </ul>
          <a href={FUENTE_AVAL_ICO} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-teal-700 underline">Listado oficial del ICO</a>
          <p className="mt-2 text-xs text-stone-500">Información pública orientativa. La concesión, los requisitos exactos y las condiciones los deciden el ICO y cada banco. La app no tiene acuerdo con estas entidades.</p>
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/nuevo" className="rounded-2xl bg-teal-700 p-4 text-center font-semibold text-white hover:bg-teal-800">Calcula el precio de tu reforma</Link>
          <Link href="/subvenciones" className="rounded-2xl bg-emerald-50 p-4 text-center font-semibold text-emerald-900 ring-1 ring-emerald-200 hover:bg-emerald-100">Mira antes las subvenciones activas</Link>
        </div>
      </main>
    </div>
  );
}
