"use client";

import Link from "next/link";
import { PLANES, type Plan } from "@/lib/suscripcion";

/** Aviso de pago: lo que hay detrás y el botón para suscribirse. */
export function Muro({ plan, volver, titulo, children }: { plan: Exclude<Plan, "gratis">; volver: string; titulo: string; children?: React.ReactNode }) {
  const p = PLANES.find((x) => x.id === plan)!;
  return (
    <div className={`rounded-2xl border p-5 ${plan === "pro" ? "border-indigo-200 bg-indigo-50" : "border-teal-200 bg-teal-50"}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Plan {p.nombre} · {p.precio} €/mes</div>
      <h2 className="mt-1 text-lg font-semibold">{titulo}</h2>
      {children && <div className="mt-1 text-sm text-stone-700">{children}</div>}
      <ul className="mt-3 space-y-1 text-sm text-stone-700">
        {p.incluye.slice(0, 4).map((x) => <li key={x}>✓ {x}</li>)}
      </ul>
      <Link href={`/suscripcion?volver=${encodeURIComponent(volver)}`} className={`mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white ${plan === "pro" ? "bg-indigo-700 hover:bg-indigo-800" : "bg-teal-700 hover:bg-teal-800"}`}>
        Suscribirme por {p.precio} €/mes
      </Link>
      <span className="ml-3 text-xs text-stone-500">Sin permanencia</span>
    </div>
  );
}
