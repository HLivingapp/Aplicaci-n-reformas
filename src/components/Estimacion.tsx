import { eurosRedondo as euros } from "@/lib/calc";
import { ALCANCE, cantidadLegible } from "@/lib/alcance";
import type { Estimacion, LineaEstimacion } from "@/lib/estimacion";

/** Resumen de la cotización automática. `detalle` muestra costes (solo empresa). */
export function VistaEstimacion({ e, detalle = false }: { e: Estimacion; detalle?: boolean }) {
  const capitulos = new Map<string, { precio: number; coste: number; lineas: LineaEstimacion[] }>();
  for (const l of e.lineas) {
    const c = capitulos.get(l.capitulo) ?? { precio: 0, coste: 0, lineas: [] };
    c.precio += l.cantidad * l.precio;
    c.coste += l.cantidad * l.coste;
    c.lineas.push(l);
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
      {e.estancias?.length > 0 && (
        <details className="mt-3 rounded-xl bg-stone-50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-stone-800">Medidas estándar de tu vivienda ({e.m2Utiles.toLocaleString("es-ES")} m² útiles)</summary>
          <p className="mt-1 text-xs text-stone-500">Calculamos las cantidades con el reparto típico de una vivienda de este tamaño. En la visita se miden de verdad.</p>
          <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {e.estancias.map((s) => (
              <div key={s.nombre} className="flex justify-between gap-2">
                <dt className="text-stone-600">{s.nombre}</dt>
                <dd className="whitespace-nowrap">{s.m2.toLocaleString("es-ES")} m²</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
      <p className="mt-3 text-xs text-stone-500">Pulsa en cada capítulo para ver qué incluye cada partida y cuánta cantidad hemos calculado.</p>
      <div className="mt-1 divide-y divide-stone-100 text-sm">
        {[...capitulos.entries()].map(([k, v]) => (
          <details key={k} className="group py-1.5">
            <summary className="flex cursor-pointer list-none justify-between gap-2">
              <span className="text-stone-700">
                <span className="mr-1 inline-block text-stone-400 transition group-open:rotate-90">›</span>
                {k}
              </span>
              <span className="text-right">
                {euros(v.precio)}
                {detalle && <span className="ml-2 text-xs text-stone-400">coste {euros(v.coste)}</span>}
              </span>
            </summary>
            <ul className="mt-2 space-y-2 pl-3">
              {v.lineas.map((l) => {
                const a = ALCANCE[l.tarifaId];
                return (
                  <li key={l.tarifaId} className="rounded-lg border border-stone-100 bg-white p-2">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-stone-800">{l.descripcion}</span>
                      <span className="shrink-0 text-stone-700">{euros(l.cantidad * l.precio)}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-stone-500">
                      {cantidadLegible(l.cantidad, l.unidad)}
                      {l.medicion ? ` · ${l.medicion}` : ""}
                    </div>
                    {a && <p className="mt-1 text-xs text-stone-600"><span className="font-medium">Incluye:</span> {a.incluye}</p>}
                    {a?.noIncluye && <p className="mt-0.5 text-xs text-stone-500"><span className="font-medium">No incluye:</span> {a.noIncluye}</p>}
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
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
