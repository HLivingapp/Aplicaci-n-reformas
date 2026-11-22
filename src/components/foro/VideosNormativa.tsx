import { publico } from "@/lib/base";
import { VIDEOS_NORMATIVA, type VideoNormativa } from "@/lib/videos-normativa";

/** Vídeos cortos de normativa y técnica. No se descargan hasta darle al play. */
export function VideosNormativa({
  soloLegal = false,
  videos = VIDEOS_NORMATIVA,
  carpeta = "normativa",
  titulo = "Vídeos: normativa y técnica en 90 segundos",
  texto = "Lo que más nos preguntáis, con los artículos y las cifras. Contenido orientativo: consulta siempre tu caso concreto.",
}: { soloLegal?: boolean; videos?: VideoNormativa[]; carpeta?: string; titulo?: string; texto?: string }) {
  const lista = soloLegal ? videos.filter((v) => v.legal) : videos;
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
      <p className="mt-1 text-sm text-stone-600">{texto}</p>
      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
        {lista.map((v) => (
          <figure key={v.id} className="w-72 shrink-0 snap-start rounded-2xl border border-stone-200 bg-white p-2 sm:w-80">
            <video
              controls
              playsInline
              preload="none"
              poster={publico(`/videos/${carpeta}/${v.id}.jpg`)}
              className="aspect-video w-full rounded-xl bg-stone-200 object-cover"
              aria-label={v.titulo}
            >
              <source src={publico(`/videos/${carpeta}/${v.id}.mp4`)} type="video/mp4" />
            </video>
            <figcaption className="px-1 pt-2">
              <div className="text-sm font-semibold leading-snug">{v.titulo} <span className="font-normal text-stone-400">· {v.duracion}</span></div>
              <div className="mt-0.5 text-xs text-stone-500">{v.resumen}</div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="text-[11px] text-stone-400">Vídeos generados con inteligencia artificial.</p>
    </section>
  );
}
