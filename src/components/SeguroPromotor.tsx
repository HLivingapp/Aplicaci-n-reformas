"use client";

import { esInvitado, type Encargo } from "@/lib/encargos";
import { contratarServicio, SERVICIOS_CLIENTE, useServiciosContratados } from "@/lib/servicios";

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long" });

/**
 * Servicios contratables online: tasación (Aesval) y seguro de promotor (MAPFRE).
 * El seguro va gratis si la obra se firma con un reformista de la app.
 */
export function ServiciosContratables({ proyectoId, encargos }: { proyectoId: string; encargos: Encargo[] }) {
  const c = useServiciosContratados(proyectoId);
  const obraApp = encargos.find((e) => (e.estado === "firmado" || e.estado === "firmado_cliente") && !esInvitado(e));
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Contrata online desde la app</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {SERVICIOS_CLIENTE.map((s) => {
          const gratis = s.id === "seguro" && obraApp;
          const hecho = c[s.id];
          return (
            <div key={s.id} className="rounded-2xl bg-white p-4 text-sm ring-1 ring-stone-200">
              <div className="font-semibold">{s.i} {s.t}</div>
              <p className="mt-1 text-stone-600">{s.d}</p>
              {gratis ? (
                <p className="mt-2 text-xs font-medium text-emerald-800">✓ Incluido gratis con tu contrato con el reformista {obraApp.codigo}</p>
              ) : hecho ? (
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

/** En el contrato con un reformista invitado: el seguro no es gratis, pero se puede contratar. */
export function SeguroPromotor({ e }: { e: Encargo }) {
  const c = useServiciosContratados(e.proyectoId);
  if (c.seguro) return <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">🛡️ Seguro de promotor contratado el {fecha(c.seguro)}.</p>;
  return (
    <button onClick={() => contratarServicio(e.proyectoId, "seguro")} className="rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50">
      🛡️ Contratar el seguro de promotor online (simulado)
    </button>
  );
}
