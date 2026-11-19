"use client";

import { useEffect, useState } from "react";
import type { Estimacion } from "@/lib/estimacion";
import { planificarFases } from "@/lib/fases";
import { ESTANCIAS_FOTO, fotosPorFase, type GaleriaCliente } from "@/lib/galeria";
import { pedirGaleria } from "@/lib/publico-cliente";
import type { DatosReforma, Vivienda } from "@/lib/types";
import { VistaFases } from "./Fases";
import { Tarjeta } from "./ui";

const nombreEstancia = (v?: string) => ESTANCIAS_FOTO.find((e) => e.valor === v)?.texto ?? "";

/** Carga las fotos para este cliente; si falla o no hay fotos, no se muestra nada. */
export function useGaleria(v: Vivienda | null, r: DatosReforma | null) {
  const [g, setG] = useState<GaleriaCliente | null>(null);
  const clave = v && r ? JSON.stringify([v, r]) : "";
  useEffect(() => {
    if (!v || !r) return;
    let vivo = true;
    pedirGaleria(v, r).then((x) => vivo && setG(x)).catch(() => vivo && setG(null));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
  return g;
}

/** Cuadrícula de reformas terminadas parecidas a lo que pide el cliente. */
export function ReformasParecidas({ fotos }: { fotos: GaleriaCliente["parecidas"] }) {
  const [grande, setGrande] = useState<string | null>(null);
  if (!fotos.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {fotos.map((f) => (
          <button key={f.id} onClick={() => setGrande(f.url)} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt={nombreEstancia(f.estancias[0]) || "Reforma terminada"} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
            {f.estancias[0] && <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[11px] text-white">{nombreEstancia(f.estancias[0])}</span>}
          </button>
        ))}
      </div>
      {grande && (
        <button onClick={() => setGrande(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" aria-label="Cerrar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={grande} alt="" className="max-h-full max-w-full rounded" />
        </button>
      )}
    </>
  );
}

/** Fases de su obra (con fotos de obra reales) y reformas parecidas, para el asistente y el portal. */
export function FasesYParecidas({ e, v, r, plegado = false }: { e: Estimacion; v: Vivienda; r: DatosReforma; plegado?: boolean }) {
  const g = useGaleria(v, r);
  const fases = <VistaFases plan={planificarFases(e, v, r)} fotos={fotosPorFase(g)} />;
  const parecidas = g?.parecidas.length ? (
    <div>
      <h3 className="mb-1 font-semibold">Reformas parecidas que hemos hecho</h3>
      <p className="mb-3 text-sm text-stone-500">Fotos de obras terminadas con estancias y acabados parecidos a lo que nos pides.</p>
      <ReformasParecidas fotos={g.parecidas} />
    </div>
  ) : null;
  if (plegado)
    return (
      <>
        <details className="rounded-lg border border-stone-200 p-3">
          <summary className="cursor-pointer font-medium">Fases y plazos de tu obra</summary>
          <div className="mt-3">{fases}</div>
        </details>
        {parecidas}
      </>
    );
  return (
    <>
      <Tarjeta>
        <h3 className="mb-1 font-semibold">Cómo sería tu obra</h3>
        <p className="mb-3 text-sm text-stone-500">Estas son las fases según lo que nos has contado. Los plazos son aproximados y los cerramos contigo tras la visita.</p>
        {fases}
      </Tarjeta>
      {parecidas && <Tarjeta>{parecidas}</Tarjeta>}
    </>
  );
}
