import Link from "next/link";
import { publico } from "@/lib/base";
import { PrecioMaterial, srcImagen } from "@/components/MaterialesMedia";
import { MATERIALES_MEDIA_INICIALES } from "@/lib/gama-media";
import { seleccionPara, type CategoriaSeleccion } from "@/lib/seleccion";

/** Vídeo vertical que no se descarga hasta que el cliente le da al play (no ralentiza el móvil). */
function Video({ c }: { c: CategoriaSeleccion }) {
  if (!c.video) return null;
  return (
    <figure className="w-36 shrink-0 sm:w-40">
      <video
        controls
        playsInline
        preload="none"
        poster={publico(c.video.poster)}
        className="aspect-[9/16] w-full rounded-xl bg-stone-200 object-cover"
        aria-label={c.video.titulo}
      >
        <source src={publico(c.video.src)} type="video/mp4" />
      </video>
      <figcaption className="mt-1 text-[11px] leading-tight text-stone-500">▶ {c.video.titulo} · {c.video.duracion} · Human Living</figcaption>
    </figure>
  );
}

/** Fotos y precio orientativo de los materiales de la categoría. */
function MiniFichas({ c }: { c: CategoriaSeleccion }) {
  const xs = MATERIALES_MEDIA_INICIALES.filter((m) => m.categoria === c.id && (m.imagen || m.precio));
  if (!xs.length) return null;
  return (
    <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
      {xs.map((m) => (
        <div key={m.id} className="w-36 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          {m.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={srcImagen(m.imagen)} alt={`${m.marca} ${m.nombre}`} loading="lazy" referrerPolicy="no-referrer" className={`aspect-[4/3] w-full bg-white ${m.encajar ? "object-contain p-1" : "object-cover"}`} />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-2xl opacity-50">{c.icono}</div>
          )}
          <div className="p-2">
            <div className="text-[10px] font-semibold uppercase text-stone-500">{m.marca}</div>
            <div className="text-xs font-medium leading-tight">{m.nombre}</div>
            <PrecioMaterial p={m.precio} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Categoria({ c }: { c: CategoriaSeleccion }) {
  return (
    <article className="flex min-w-0 gap-4 rounded-2xl border border-stone-200 bg-white p-4">
      <Video c={c} />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{c.icono} {c.titulo}</h3>
        <p className="mt-1 text-sm text-stone-600">{c.resumen}</p>
        {c.marcas.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm">
            {c.marcas.map((m) => (
              <li key={m.marca}>
                {m.url ? (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-800 underline decoration-teal-300 underline-offset-2 hover:text-teal-900">{m.marca} ↗</a>
                ) : (
                  <span className="font-medium">{m.marca}</span>
                )}
                <span className="block text-xs text-stone-500">{m.que}</span>
              </li>
            ))}
          </ul>
        )}
        <MiniFichas c={c} />
        {c.consejo && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">💡 {c.consejo}</p>}
      </div>
    </article>
  );
}

/**
 * Selección de productos recomendada (de Human Living, empresa destacada): vídeos de su equipo y catálogos de las marcas que usamos.
 * `grupos` filtra por acabados (p. ej. los de baño); sin él, se muestran todas las categorías.
 */
export function SeleccionProductos({ grupos, excluir }: { grupos?: string[]; excluir?: string[] }) {
  const lista = seleccionPara(grupos, excluir);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {lista.map((c) => (
          <Categoria key={c.id} c={c} />
        ))}
      </div>
      <Link href="/materiales" className="block rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-800 hover:bg-teal-50">🧱 Ver todos los materiales de gama media, con fotos →</Link>
      <p className="text-xs text-stone-400">Enlaces a los catálogos públicos de cada fabricante. Los precios orientativos son de venta al público en tiendas online, con IVA, en la fecha indicada; pueden cambiar. Los precios de tu reforma son los de tu presupuesto.</p>
    </div>
  );
}

/** Versión plegable para poner debajo de «Elige tus acabados». */
export function SeleccionPlegable({ grupos }: { grupos?: string[] }) {
  return (
    <details className="group mt-4 rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
      <summary className="cursor-pointer list-none font-semibold text-teal-900">
        🎬 Selección de productos recomendada: vídeos y catálogos <span className="text-sm font-normal text-teal-700 group-open:hidden">· ver</span>
      </summary>
      <div className="mt-3">
        <SeleccionProductos grupos={grupos} />
      </div>
    </details>
  );
}
