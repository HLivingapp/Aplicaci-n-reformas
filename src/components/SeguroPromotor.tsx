"use client";

import type { Encargo } from "@/lib/encargos";
import { contratarServicio, SERVICIOS_CLIENTE, useServiciosContratados } from "@/lib/servicios";

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long" });

/**
 * Servicios contratables online, con coste: tasación (Aesval) y seguro de promotor (MAPFRE).
 * Desde el 25/11/2026 el seguro ya no se regala.
 */
export function ServiciosContratables({ proyectoId }: { proyectoId: string }) {
  const c = useServiciosContratados(proyectoId);
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Contrata online desde la app</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {SERVICIOS_CLIENTE.map((s) => {
          const hecho = c[s.id];
          return (
            <div key={s.id} className="rounded-2xl bg-white p-4 text-sm ring-1 ring-stone-200">
              <div className="font-semibold">{s.i} {s.t}</div>
              <p className="mt-1 text-stone-600">{s.d}</p>
              {hecho ? (
                <p className="mt-2 text-xs font-medium text-emerald-800">✓ Contratado el {fecha(hecho)}. Te avisaremos en tu área.</p>
              ) : (
                <button onClick={() => contratarServicio(proyectoId, s.id)} className="mt-2 rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50">
                  Contratar (simulado)
                </button>
              )}
              <p className="mt-2 text-xs text-stone-400">{s.pendiente}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** En el contrato: el seguro de promotor se puede contratar online, con coste. */
export function SeguroPromotor({ e }: { e: Encargo }) {
  const c = useServiciosContratados(e.proyectoId);
  if (c.seguro) return <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">🛡️ Seguro de promotor contratado el {fecha(c.seguro)}.</p>;
  return (
    <button onClick={() => contratarServicio(e.proyectoId, "seguro")} className="rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50">
      🛡️ Contratar el seguro de promotor online (simulado)
    </button>
  );
}
