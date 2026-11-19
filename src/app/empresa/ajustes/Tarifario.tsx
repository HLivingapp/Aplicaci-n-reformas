"use client";

import { useRef, useState } from "react";
import { euros } from "@/lib/calc";
import { useDatos } from "@/lib/store";
import { completarTarifas, esTarifas, recargoDe, tarifasPorDefecto } from "@/lib/tarifas";
import type { GrupoTarifa, Tarifas, TramoMedidas } from "@/lib/types";
import { Boton, Campo, inputCls, Tarjeta } from "@/components/ui";

const num = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const PARAMS: { k: keyof Tarifas; t: string; ayuda: string }[] = [
  { k: "recargoPct", t: "Recargo sobre coste (%)", ayuda: "Mano de obra y resto: venta = coste × (1 + recargo)" },
  { k: "recargoMaterialesPct", t: "Recargo sobre materiales (%)", ayuda: "Partidas de «Compras»" },
  { k: "coefUtil", t: "m² útiles por m² construido", ayuda: "Normalmente 0,75 – 0,85" },
  { k: "paramentosPorM2", t: "m² de pintura por m² construido", ayuda: "Paredes + techos" },
  { k: "m2AlicatadoBano", t: "m² de alicatado por baño", ayuda: "" },
  { k: "m2AlicatadoCocina", t: "m² de alicatado en cocina", ayuda: "Frente de cocina" },
  { k: "puntosAguaBano", t: "Puntos de agua por baño", ayuda: "" },
  { k: "puntosAguaCocina", t: "Puntos de agua por cocina", ayuda: "" },
  { k: "aniosMaxInstalacion", t: "Años máximos para mantener una instalación", ayuda: "Si es más antigua se obliga a cambiarla" },
  { k: "margenRangoPct", t: "Horquilla de la estimación (± %)", ayuda: "Rango que ve el cliente" },
];

const TRAMO_COLS: { k: keyof TramoMedidas; t: string }[] = [
  { k: "hastaM2", t: "Hasta m² útiles" },
  { k: "cocina", t: "Cocina" },
  { k: "salon", t: "Salón" },
  { k: "dormitorioPrincipal", t: "Dorm. principal" },
  { k: "dormitorio", t: "Dormitorio" },
  { k: "bano", t: "Baño" },
  { k: "pasilloPct", t: "Pasillo %" },
];

export function Tarifario() {
  const { datos, actualizar } = useDatos();
  const t = datos.tarifas;
  const archivo = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const mod = (fn: (x: Tarifas) => void) => actualizar((d) => fn(d.tarifas));
  const venta = (coste: number, grupo: GrupoTarifa) => Math.round(coste * recargoDe(t, grupo) * 100) / 100;

  const exportar = () => {
    const blob = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tarifario-${t.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importar = async (f: File) => {
    try {
      const j = JSON.parse(await f.text());
      if (!esTarifas(j)) throw new Error();
      actualizar((d) => { d.tarifas = completarTarifas(j); });
      setAviso(`Tarifario «${j.nombre}» importado con ${j.precios.length} partidas.`);
    } catch {
      setAviso("El archivo no es un tarifario válido.");
    }
  };

  const grupos = [...new Set(t.precios.map((p) => p.grupo))];

  return (
    <div className="space-y-4">
      <Tarjeta>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Campo etiqueta="Nombre del tarifario" className="min-w-60 flex-1">
            <input className={inputCls} value={t.nombre} onChange={(e) => mod((x) => { x.nombre = e.target.value; })} />
          </Campo>
          <div className="flex flex-wrap gap-2">
            <input ref={archivo} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} />
            <Boton variante="secundario" onClick={() => archivo.current?.click()}>Importar tarifario</Boton>
            <Boton variante="secundario" onClick={exportar}>Exportar</Boton>
            <Boton variante="fantasma" onClick={() => confirm("¿Volver al tarifario genérico de ejemplo?") && actualizar((d) => { d.tarifas = tarifasPorDefecto(); })}>Restablecer</Boton>
          </div>
        </div>
        {aviso && <p className="mt-2 text-sm text-teal-800">{aviso}</p>}
        <p className="mt-2 text-xs text-stone-500">Los importes son <b>costes</b>. La app suma el recargo para calcular el precio de venta.</p>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-3 font-semibold">Parámetros de cálculo</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {PARAMS.map((p) => (
            <Campo key={p.k} etiqueta={p.t}>
              <input className={inputCls} inputMode="decimal" defaultValue={String(t[p.k])} key={`${t.nombre}-${p.k}`} onChange={(e) => mod((x) => { (x[p.k] as number) = num(e.target.value); })} />
              {p.ayuda && <span className="mt-0.5 block text-xs text-stone-400">{p.ayuda}</span>}
            </Campo>
          ))}
          {(["basica", "media", "alta"] as const).map((k) => (
            <Campo key={k} etiqueta={`Factor acabados ${k === "basica" ? "básicos" : k === "media" ? "medios" : "altos"}`}>
              <input className={inputCls} inputMode="decimal" defaultValue={String(t.factorCalidad[k])} key={`${t.nombre}-f${k}`} onChange={(e) => mod((x) => { x.factorCalidad[k] = num(e.target.value); })} />
            </Campo>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-1 font-semibold">Medidas estándar de cada estancia (m²)</h2>
        <p className="mb-3 text-xs text-stone-500">Según los m² útiles del piso. El salón se queda con lo que sobra.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500">
                {TRAMO_COLS.map((c) => <th key={c.k} className="px-1 pb-1 font-medium">{c.t}</th>)}
              </tr>
            </thead>
            <tbody>
              {t.tramos.map((tr, i) => (
                <tr key={i}>
                  {TRAMO_COLS.map((c) => (
                    <td key={c.k} className="p-1">
                      <input className={`${inputCls} px-2 py-1`} inputMode="decimal" defaultValue={tr[c.k]} key={`${t.nombre}-${i}-${c.k}`} onChange={(e) => mod((x) => { x.tramos[i][c.k] = num(e.target.value); })} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      <Tarjeta>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Partidas ({t.precios.length})</h2>
          <input className={`${inputCls} max-w-64`} placeholder="Buscar partida…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
        </div>
        {grupos.map((g) => (
          <div key={g} className="mb-4">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">{g}</h3>
            <div className="divide-y divide-stone-100">
              {t.precios
                .map((p, i) => ({ p, i }))
                .filter(({ p }) => p.grupo === g && (p.descripcion + p.capitulo).toLowerCase().includes(filtro.toLowerCase()))
                .map(({ p, i }) => (
                  <div key={p.id} className="grid grid-cols-[1fr_6rem_6rem] items-center gap-2 py-1.5 text-sm sm:grid-cols-[10rem_1fr_6rem_6rem]">
                    <span className="hidden text-xs text-stone-500 sm:block">{p.capitulo}</span>
                    <span>
                      {p.descripcion}
                      {p.dependeCalidad && <span className="ml-1 text-xs text-stone-400">(según acabados)</span>}
                    </span>
                    <label className="flex items-center gap-1">
                      <input className={`${inputCls} px-2 py-1 text-right`} inputMode="decimal" defaultValue={p.coste} key={`${t.nombre}-${p.id}`} onChange={(e) => mod((x) => { x.precios[i].coste = num(e.target.value); })} aria-label={`Coste ${p.descripcion}`} />
                      <span className="text-xs text-stone-400">/{p.unidad}</span>
                    </label>
                    <span className="text-right text-xs text-stone-500">venta {euros(venta(p.coste, p.grupo))}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </Tarjeta>
    </div>
  );
}
