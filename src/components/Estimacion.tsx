import { eurosRedondo as euros } from "@/lib/calc";
import type { Estimacion } from "@/lib/estimacion";

/** Resumen de la cotización automática. `detalle` muestra costes (solo empresa). */
export function VistaEstimacion({ e, detalle = false }: { e: Estimacion; detalle?: boolean }) {
  const capitulos = new Map<string, { precio: number; coste: number }>();
  for (const l of e.lineas) {
    const c = capitulos.get(l.capitulo) ?? { precio: 0, coste: 0 };
    c.precio += l.cantidad * l.precio;
    c.coste += l.cantidad * l.coste;
    capitulos.set(l.capitulo, c);
  }
  return (
    <div>
      <div className="rounded-xl bg-teal-700 p-4 text-white">
        <div className="text-sm opacity-80">Estimación orientativa</div>
        <div className="text-2xl font-semibold">
          {euros(e.minimo)} – {euros(e.maximo)}
        </div>
        <div className="text-xs opacity-80">+ IVA · se ajusta tras la visita y la elección de materiales</div>
      </div>
      <dl className="mt-3 divide-y divide-stone-100 text-sm">
        {[...capitulos.entries()].map(([k, v]) => (
          <div key={k} className="flex justify-between py-1.5">
            <dt className="text-stone-600">{k}</dt>
            <dd className="text-right">
              {euros(v.precio)}
              {detalle && <span className="ml-2 text-xs text-stone-400">coste {euros(v.coste)}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {detalle && (
        <div className="mt-2 flex justify-between rounded-lg bg-stone-50 p-2 text-sm">
          <span>Coste {euros(e.coste)}</span>
          <span className="font-semibold">Venta {euros(e.base)} sin IVA</span>
        </div>
      )}
      {e.avisos.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-amber-900">
          {e.avisos.map((a) => <li key={a} className="rounded bg-amber-50 p-2">⚠️ {a}</li>)}
        </ul>
      )}
    </div>
  );
}
