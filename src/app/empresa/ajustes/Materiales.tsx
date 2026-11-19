"use client";

import { useRef, useState } from "react";
import { euros } from "@/lib/calc";
import { completarMateriales, materialesPorDefecto, NIVELES } from "@/lib/materiales";
import { useDatos } from "@/lib/store";
import type { GrupoMaterial } from "@/lib/types";
import { Boton, inputCls, Tarjeta } from "@/components/ui";

const num = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const esCatalogo = (x: unknown): x is GrupoMaterial[] =>
  Array.isArray(x) && x.every((g) => g && typeof g.id === "string" && Array.isArray(g.tarifaIds) && Array.isArray(g.opciones));

/** Catálogo de acabados que elige el cliente: textos y cuánto encarece o abarata cada opción. */
export function CatalogoMateriales() {
  const { datos, actualizar } = useDatos();
  const t = datos.tarifas;
  const archivo = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const mod = (fn: (g: GrupoMaterial[]) => void) => actualizar((d) => fn(d.tarifas.materiales));

  const importar = async (f: File) => {
    try {
      const j = JSON.parse(await f.text());
      const lista = Array.isArray(j) ? j : j?.materiales;
      if (!esCatalogo(lista)) throw new Error();
      actualizar((d) => { d.tarifas.materiales = completarMateriales(lista); });
      setAviso(`Catálogo importado con ${lista.length} grupos de acabados.`);
    } catch {
      setAviso("El archivo no es un catálogo de acabados válido.");
    }
  };

  return (
    <Tarjeta>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Acabados que elige el cliente</h2>
        <div className="flex flex-wrap gap-2">
          <input ref={archivo} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} />
          <Boton variante="secundario" onClick={() => archivo.current?.click()}>Importar catálogo</Boton>
          <Boton variante="fantasma" onClick={() => confirm("¿Volver al catálogo genérico de acabados?") && actualizar((d) => { d.tarifas.materiales = materialesPorDefecto(); })}>Restablecer</Boton>
        </div>
      </div>
      {aviso && <p className="mb-2 text-sm text-teal-800">{aviso}</p>}
      <p className="mb-4 text-xs text-stone-500">
        El factor multiplica el coste de la partida del tarifario (1 = el coste tal cual). Si el cliente no elige, se usa el nivel de su calidad general.
      </p>
      <div className="space-y-5">
        {t.materiales.map((g, gi) => {
          const partidas = g.tarifaIds.map((id) => t.precios.find((p) => p.id === id)).filter(Boolean);
          return (
            <div key={g.id}>
              <input className={`${inputCls} mb-1 font-medium`} value={g.nombre} onChange={(e) => mod((m) => { m[gi].nombre = e.target.value; })} aria-label="Nombre del grupo" />
              <p className="mb-2 text-xs text-stone-400">Partidas: {partidas.map((p) => `${p!.descripcion} (${euros(p!.coste)}/${p!.unidad})`).join(", ") || "ninguna"}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {g.opciones.map((o, oi) => (
                  <div key={o.id} className="space-y-1 rounded-lg border border-stone-200 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{NIVELES.find((n) => n.valor === o.nivel)?.texto}</span>
                      <label className="flex items-center gap-1 text-xs text-stone-500">
                        factor
                        <input className={`${inputCls} w-16 px-2 py-1 text-right`} inputMode="decimal" defaultValue={o.factor} key={`${t.nombre}-${o.id}-f`} onChange={(e) => mod((m) => { m[gi].opciones[oi].factor = num(e.target.value); })} />
                      </label>
                    </div>
                    <input className={`${inputCls} px-2 py-1`} value={o.nombre} onChange={(e) => mod((m) => { m[gi].opciones[oi].nombre = e.target.value; })} aria-label="Nombre de la opción" />
                    <textarea className={`${inputCls} px-2 py-1 text-xs`} rows={2} value={o.detalle} onChange={(e) => mod((m) => { m[gi].opciones[oi].detalle = e.target.value; })} aria-label="Detalle de la opción" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Tarjeta>
  );
}
