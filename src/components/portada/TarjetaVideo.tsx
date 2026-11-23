"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publico } from "@/lib/base";
import { VIDEOS_PORTADA, archivoMini, type TemaPortada } from "@/lib/videos-portada";

/** Bloque de la portada que, al pincharlo, abre el mini vídeo de su tema y un botón para ir a esa área. */
export function TarjetaVideo({
  tema,
  titulo,
  href,
  area,
  className,
  children,
}: {
  tema: TemaPortada;
  titulo: string;
  href: string;
  area: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const v = VIDEOS_PORTADA[tema];
  // Primero el mini vídeo propio del tema; si no existe todavía, el provisional; si tampoco, el hueco
  const fuentes = [archivoMini(tema), ...(v.video ? [v.video] : [])];
  const [intento, setIntento] = useState(0);
  const actual = fuentes[intento];
  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);
  return (
    <>
      <button type="button" data-tema={tema} onClick={() => { setTerminado(false); setIntento(0); setAbierto(true); }} className={`cursor-pointer text-left ${className ?? ""}`}>
        {children}
      </button>
      {abierto && (
        <div role="dialog" aria-modal="true" aria-label={titulo} className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 p-4" onClick={() => setAbierto(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white text-stone-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 p-4 pb-2">
              <h3 className="font-display text-xl font-semibold">{titulo}</h3>
              <button type="button" aria-label="Cerrar" className="rounded-full px-2 text-2xl leading-none text-stone-400 hover:text-stone-700" onClick={() => setAbierto(false)}>×</button>
            </div>
            {actual ? (
              <>
                <video
                  key={actual}
                  className="aspect-video w-full bg-black"
                  controls
                  autoPlay
                  playsInline
                  poster={publico(`/videos/${actual}.jpg`)}
                  src={publico(`/videos/${actual}.mp4`)}
                  data-fuente={actual}
                  onError={() => setIntento((i) => i + 1)}
                  onEnded={() => setTerminado(true)}
                />
                <p className="px-4 pt-1 text-[11px] text-stone-400">Vídeo generado con inteligencia artificial. Contenido orientativo.</p>
              </>
            ) : (
              <div className="mx-4 flex aspect-video flex-col items-center justify-center rounded-2xl bg-stone-100 text-center text-stone-500" data-testid="video-pendiente">
                <span className="text-4xl">🎬</span>
                <span className="mt-2 font-medium">Vídeo explicativo en preparación</span>
                <span className="text-sm">«{v.guion}»</span>
              </div>
            )}
            <div className={`m-4 rounded-2xl p-4 transition ${terminado ? "bg-teal-700 text-white" : "bg-teal-50"}`}>
              <p className={`text-sm ${terminado ? "text-teal-50" : "text-stone-600"}`}>{terminado ? "¿Lo trabajamos ya?" : "Cuando quieras, trabaja este tema en la app:"}</p>
              <Link href={href} className={`mt-2 inline-block rounded-xl px-5 py-3 font-semibold ${terminado ? "bg-white text-teal-800" : "bg-teal-700 text-white hover:bg-teal-800"}`}>
                Ir a {area} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
