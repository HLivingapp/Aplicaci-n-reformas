import Link from "next/link";
import { publico } from "@/lib/base";
import { GUIA_AUDIO, seleccionPara, type CategoriaSeleccion } from "@/lib/seleccion";

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

function Categoria({ c }: { c: CategoriaSeleccion }) {
  return (
    <article className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4">
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
        {c.consejo && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">💡 {c.consejo}</p>}
      </div>
    </article>
  );
}

/** Audio de la guía para clientes (17 min); tampoco se descarga hasta darle al play. */
export function GuiaAudio() {
  return (
    <div className="rounded-2xl bg-stone-900 p-4 text-white">
      <div className="text-sm font-semibold">🎧 {GUIA_AUDIO.titulo}</div>
      <p className="mt-1 text-xs text-stone-300">El equipo de Human Living, empresa destacada, cuenta paso a paso cómo es una reforma. Escúchala cuando quieras ({GUIA_AUDIO.duracion}).</p>
      <audio controls preload="none" src={publico(GUIA_AUDIO.src)} className="mt-3 w-full" />
    </div>
  );
}

/**
 * Selección de productos recomendada (de Human Living, empresa destacada): vídeos de su equipo y catálogos de las marcas que usamos.
 * `grupos` filtra por acabados (p. ej. los de baño); sin él, se muestran todas las categorías.
 */
export function SeleccionProductos({ grupos, excluir, conGuia = false }: { grupos?: string[]; excluir?: string[]; conGuia?: boolean }) {
  const lista = seleccionPara(grupos, excluir);
  return (
    <div className="space-y-3">
      {conGuia && <GuiaAudio />}
      <div className="grid gap-3 xl:grid-cols-2">
        {lista.map((c) => (
          <Categoria key={c.id} c={c} />
        ))}
      </div>
      <Link href="/materiales" className="block rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-800 hover:bg-teal-50">🧱 Ver todos los materiales de gama media, con fotos →</Link>
      <p className="text-xs text-stone-400">Enlaces a los catálogos públicos de cada fabricante. Los precios de tu reforma son los de tu presupuesto.</p>
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
        <SeleccionProductos grupos={grupos} conGuia />
      </div>
    </details>
  );
}
