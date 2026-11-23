"use client";

import { useEffect, useState } from "react";
import { publico } from "@/lib/base";
import { useEncargos } from "./ComparativaRed";

export type PestanaPanel = { id: string; icono: string; texto: string; contenido: React.ReactNode; aviso?: number };

/**
 * Panel del reformista, visual y al grano: cifras grandes arriba, accesos con icono y el resto en pestañas.
 * `cabecera` va en la banda oscura (nombre, estado); `pestanas` agrupa lo demás.
 */
export function PanelReformista({ reformistaId, titulo, estado, cabecera, pestanas }: { reformistaId: string; titulo: string; estado?: React.ReactNode; cabecera?: React.ReactNode; pestanas: PestanaPanel[] }) {
  const encargos = useEncargos().filter((e) => e.reformistaId === reformistaId);
  const [activa, setActiva] = useState(pestanas[0]?.id);
  const ids = pestanas.map((p) => p.id).join(",");
  useEffect(() => {
    const leer = () => {
      const h = window.location.hash.slice(1);
      if (ids.split(",").includes(h)) setActiva(h);
    };
    leer();
    window.addEventListener("hashchange", leer);
    return () => window.removeEventListener("hashchange", leer);
  }, [ids]);
  const eligieron = encargos.filter((e) => e.estado !== "descartado").length;
  const visitas = encargos.filter((e) => e.estado === "visita_pedida" || e.estado === "visita_fijada").length;
  const obras = encargos.filter((e) => e.estado === "firmado").length;
  const cobros = encargos.reduce((s, e) => s + (e.pagos ?? []).filter((p) => p === "solicitado").length, 0);
  const cifras = [
    { n: eligieron, t: "Te han elegido", i: "🎯", cls: "bg-amber-400 text-stone-900", ir: "clientes" },
    { n: visitas, t: "Visitas pendientes", i: "📅", cls: "bg-sky-400 text-stone-900", ir: "clientes" },
    { n: obras, t: "Obras en curso", i: "🏗️", cls: "bg-emerald-400 text-stone-900", ir: "clientes" },
    { n: cobros, t: "Cobros por confirmar", i: "💶", cls: "bg-white text-stone-900", ir: "clientes" },
  ];
  const ir = (id: string) => {
    setActiva(id);
    history.replaceState(null, "", `#${id}`);
    document.getElementById("pestanas")?.scrollIntoView({ behavior: "smooth" });
  };
  const actual = pestanas.find((p) => p.id === activa) ?? pestanas[0];
  return (
    <div className="space-y-4" data-testid="panel-reformista">
      <section className="relative -mx-4 -mt-2 overflow-hidden bg-stone-950 px-4 pb-5 pt-5 text-white sm:rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={publico("/fotos/obra/salon-amplio.webp")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 to-stone-950" />
        <div className="relative">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs text-stone-300">Tu panel</div>
              <h1 className="font-display text-2xl font-semibold">{titulo}</h1>
            </div>
            {estado}
          </div>
          {cabecera}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {cifras.map((c) => (
              <button key={c.t} type="button" onClick={() => ir(c.ir)} className={`rounded-2xl p-3 text-left shadow-lg ${c.cls}`} data-cifra={c.t}>
                <div className="flex items-center justify-between"><span className="font-display text-3xl font-semibold">{c.n}</span><span className="text-2xl">{c.i}</span></div>
                <div className="text-xs font-medium">{c.t}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <nav id="pestanas" className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto bg-stone-50/95 px-4 py-2 backdrop-blur" aria-label="Secciones del panel">
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => ir(p.id)}
            className={`relative flex shrink-0 flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-medium ${p.id === actual.id ? "bg-teal-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}
            data-pestana={p.id}
          >
            <span className="text-xl">{p.icono}</span>
            {p.texto}
            {!!p.aviso && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">{p.aviso}</span>}
          </button>
        ))}
      </nav>
      <div className="space-y-4">{actual.contenido}</div>
    </div>
  );
}
