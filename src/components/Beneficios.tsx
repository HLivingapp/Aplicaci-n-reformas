import type { Beneficio } from "@/lib/beneficios";

/** Tarjetas de beneficios, con detalle desplegable y nota de lo que está pendiente. */
export function ListaBeneficios({ items, columnas = 3 }: { items: Beneficio[]; columnas?: 2 | 3 }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${columnas === 3 ? "lg:grid-cols-3" : ""}`}>
      {items.map((b) => (
        <div key={b.t} className="rounded-3xl bg-white p-6 ring-1 ring-stone-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-50 text-2xl ring-1 ring-stone-200">{b.i}</div>
          <h3 className="mt-3 text-lg font-semibold">{b.t}</h3>
          <p className="mt-1 text-stone-600">{b.d}</p>
          {b.mas && (
            <ul className="mt-2 space-y-1 text-sm text-stone-600">
              {b.mas.map((m) => (
                <li key={m} className="flex gap-2"><span className="text-teal-700">✓</span>{m}</li>
              ))}
            </ul>
          )}
          {b.pendiente && <p className="mt-2 text-xs text-stone-400">{b.pendiente}</p>}
        </div>
      ))}
    </div>
  );
}
