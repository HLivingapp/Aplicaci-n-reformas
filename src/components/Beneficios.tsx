import { TarjetaVideo } from "./portada/TarjetaVideo";
import type { Beneficio } from "@/lib/beneficios";

/** Tarjetas de beneficios, con detalle desplegable y nota de lo que está pendiente. */
export function ListaBeneficios({ items, columnas = 3 }: { items: Beneficio[]; columnas?: 2 | 3 }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${columnas === 3 ? "lg:grid-cols-3" : ""}`}>
      {items.map((b) => {
        const contenido = (
          <>
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
          {b.tema && <p className="mt-3 text-sm font-semibold text-teal-700 group-hover:underline">▶ Ver vídeo</p>}
          </>
        );
        return b.tema && b.href ? (
          <TarjetaVideo key={b.t} tema={b.tema} titulo={b.t} href={b.href} area={b.area ?? b.t} className="group block w-full rounded-3xl bg-white p-6 ring-1 ring-stone-200 transition hover:shadow-xl hover:ring-teal-600">{contenido}</TarjetaVideo>
        ) : (
          <div key={b.t} className="rounded-3xl bg-white p-6 ring-1 ring-stone-200">{contenido}</div>
        );
      })}
    </div>
  );
}

/** Aviso en las áreas de profesionales: ayuda con la memoria técnica y la financiación. */
export function AvisoMemoriaTecnica() {
  return (
    <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-950 ring-1 ring-indigo-100">
      <div className="font-semibold">📑 ¿Tu cliente financia la reforma con hipoteca?</div>
      <p className="mt-1">El banco y la legalización piden una memoria técnica firmada por arquitecto colegiado. Te ayudamos a preparar la memoria y la documentación de la financiación con tu cliente. Escríbenos desde el encargo.</p>
    </div>
  );
}
