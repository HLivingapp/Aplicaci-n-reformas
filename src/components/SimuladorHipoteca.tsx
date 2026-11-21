"use client";

import { useState } from "react";
import { euros } from "@/lib/calc";
import { ComparativaBancos } from "./ComparativaBancos";
import { inputCls } from "./ui";

/** «Reforma en tu hipoteca»: cuota orientativa para financiar la reforma. Simulación, sin compromiso. */
export function SimuladorHipoteca({ importe }: { importe: number }) {
  const [cantidad, setCantidad] = useState(Math.round(importe / 1000) * 1000);
  const [anos, setAnos] = useState(25);
  const [tin, setTin] = useState(3);
  const n = anos * 12;
  const i = tin / 100 / 12;
  const cuota = i ? (cantidad * i) / (1 - Math.pow(1 + i, -n)) : cantidad / n;
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm">
      <div className="font-semibold">🏦 Reforma en tu hipoteca</div>
      <p className="mt-1 text-stone-600">Financia la reforma junto con la compra o ampliando tu hipoteca con un banco colaborador. Haz una simulación:</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <label className="text-xs text-stone-600">Importe<input type="number" step={1000} className={`${inputCls} mt-1`} value={cantidad} onChange={(e) => setCantidad(Math.max(0, Number(e.target.value)))} /></label>
        <label className="text-xs text-stone-600">Plazo (años)<input type="number" min={1} max={40} className={`${inputCls} mt-1`} value={anos} onChange={(e) => setAnos(Math.min(40, Math.max(1, Number(e.target.value))))} /></label>
        <label className="text-xs text-stone-600">Interés de ejemplo (TIN %)<input type="number" step={0.1} min={0} className={`${inputCls} mt-1`} value={tin} onChange={(e) => setTin(Math.max(0, Number(e.target.value)))} /></label>
      </div>
      <div className="mt-3 text-lg">Cuota aproximada: <b>{euros(cuota)}/mes</b></div>
      <p className="mt-1 text-xs text-stone-500">Simulación orientativa con el interés que indiques: no es una oferta. El tipo, los gastos y la concesión los decide el banco.</p>
      <p className="mt-3 rounded-xl bg-white p-3 text-xs text-stone-600 ring-1 ring-stone-200">
        📑 Si financias la reforma con la hipoteca, el banco suele pedir una memoria técnica firmada por un arquitecto colegiado, que también sirve para legalizar la obra. Te ayudamos a prepararla con tu reformista y un arquitecto homologado de la app, junto con la documentación para el banco.
      </p>
      <ComparativaBancos />
    </div>
  );
}
