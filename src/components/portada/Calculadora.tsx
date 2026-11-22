"use client";

import Link from "next/link";
import { useState } from "react";

/** Precios de referencia de una reforma integral en Madrid (€/m² construido, sin IVA). */
const NIVELES = [
  { id: "basica", texto: "Básica", precio: 950, detalle: "Laminado AC4, sanitarios Roca o similar, cocina laminada" },
  { id: "media", texto: "Media", precio: 1100, detalle: "Laminado Meister, sanitarios Roca, muebles Salgar y cocina Alvic con encimera Compac" },
  { id: "alta", texto: "Premium", precio: 1450, detalle: "Tarima de roble, ducha a ras de suelo, cocina lacada con inducción" },
];

const eur = (n: number) => `${(Math.round(n / 500) * 500).toLocaleString("es-ES")} €`;

export function Calculadora() {
  const [m2, setM2] = useState(80);
  const [nivel, setNivel] = useState("media");
  const n = NIVELES.find((x) => x.id === nivel)!;
  const base = m2 * n.precio;
  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-stone-200 sm:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="calc-m2" className="text-sm font-medium text-stone-600">Metros de tu casa</label>
        <span className="font-display text-3xl font-semibold text-stone-900">{m2} m²</span>
      </div>
      <input id="calc-m2" type="range" min={35} max={200} step={1} value={m2} onChange={(e) => setM2(Number(e.target.value))} className="mt-3 w-full accent-teal-700" />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {NIVELES.map((x) => (
          <button key={x.id} onClick={() => setNivel(x.id)} className={`rounded-2xl px-3 py-3 text-left text-sm transition ${nivel === x.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
            <div className="font-semibold">{x.texto}</div>
            <div className={`text-xs ${nivel === x.id ? "text-stone-300" : "text-stone-500"}`}>{x.precio.toLocaleString("es-ES")} €/m²</div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-500">{n.detalle}</p>
      <div className="mt-5 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 p-5 text-white">
        <div className="text-sm text-teal-100">Reforma integral, orientativo</div>
        <div className="font-display text-4xl font-semibold tracking-tight">{eur(base * 0.9)} – {eur(base * 1.1)}</div>
        <div className="text-xs text-teal-100">+ IVA (10 %) · el precio exacto sale partida a partida con tu vivienda</div>
      </div>
      <Link href="/nuevo" className="mt-4 block rounded-2xl bg-amber-400 py-3.5 text-center font-semibold text-stone-900 transition hover:bg-amber-300">Calcular el de mi casa →</Link>
      <p className="mt-2 text-center text-xs text-stone-500">Partida a partida y gratis con tu email. Lo ves al momento en la app.</p>
    </div>
  );
}
