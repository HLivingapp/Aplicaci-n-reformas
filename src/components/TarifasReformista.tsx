"use client";

import { euros } from "@/lib/calc";
import { CAPITULOS, partidasCapitulo } from "@/lib/encargos";
import type { TarifaReformista } from "@/lib/types";
import { inputCls } from "./ui";

/**
 * Editor de tarifas del reformista: un ajuste general y, si quiere, uno por capítulo,
 * en % sobre los precios de referencia. Debajo de cada capítulo ve sus precios por unidad.
 */
export function EditorTarifas({ valor, onChange }: { valor: Pick<TarifaReformista, "general" | "capitulos">; onChange: (t: Pick<TarifaReformista, "general" | "capitulos">) => void }) {
  const pct = (cap?: string) => (cap ? (valor.capitulos[cap] ?? valor.general) : valor.general);
  const ponerCap = (cap: string, n: number | null) => {
    const capitulos = { ...valor.capitulos };
    if (n === null) delete capitulos[cap];
    else capitulos[cap] = n;
    onChange({ ...valor, capitulos });
  };
  return (
    <div className="space-y-3">
      <label className="flex flex-wrap items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm">
        <span className="font-medium">Ajuste general sobre la referencia</span>
        <Porcentaje valor={valor.general} onChange={(n) => onChange({ ...valor, general: n ?? 0 })} />
        <span className="text-xs text-stone-500">Se aplica a todos los capítulos que no ajustes aparte.</span>
      </label>
      <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200">
        {CAPITULOS.map((cap) => {
          const propio = valor.capitulos[cap] !== undefined;
          const k = 1 + pct(cap) / 100;
          return (
            <li key={cap} className="p-3">
              <details>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="text-sm font-medium">{cap}</span>
                  <span className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                    {propio && <button className="text-xs text-stone-500 underline" onClick={() => ponerCap(cap, null)}>Quitar</button>}
                    <Porcentaje valor={propio ? valor.capitulos[cap] : null} placeholder={`${valor.general}`} onChange={(n) => ponerCap(cap, n)} />
                  </span>
                </summary>
                <table className="mt-2 w-full text-xs">
                  <thead>
                    <tr className="text-stone-500"><th className="text-left font-normal">Partida</th><th className="text-right font-normal">Referencia</th><th className="text-right font-normal">Tu precio</th></tr>
                  </thead>
                  <tbody>
                    {partidasCapitulo(cap).map((p) => (
                      <tr key={p.id}>
                        <td className="py-0.5 pr-2">{p.descripcion}</td>
                        <td className="whitespace-nowrap text-right text-stone-500">{euros(p.precio)}/{p.unidad}</td>
                        <td className="whitespace-nowrap text-right font-medium">{euros(p.precio * k)}/{p.unidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-stone-500">Precios de venta sin IVA. Toca un capítulo para ver tus precios por unidad. En 0 % cobras como la referencia; en −10 %, un 10 % menos.</p>
    </div>
  );
}

function Porcentaje({ valor, onChange, placeholder }: { valor: number | null; onChange: (n: number | null) => void; placeholder?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        inputMode="decimal"
        step={1}
        min={-50}
        max={100}
        className={`${inputCls} w-20 py-1 text-right`}
        value={valor ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? null : Math.max(-50, Math.min(100, Number(e.target.value))))}
      />
      <span className="text-sm text-stone-500">%</span>
    </span>
  );
}
