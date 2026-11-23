"use client";

import { useEffect, useState } from "react";
import { publico } from "@/lib/base";

/** Comprueba una vez por sesión si existe el mini vídeo de un tema (public/videos/mini/<tema>.mp4). */
const existe = new Map<string, Promise<boolean>>();
function hayVideo(tema: string) {
  if (!existe.has(tema)) existe.set(tema, fetch(publico(`/videos/mini/${tema}.mp4`), { method: "HEAD" }).then((r) => r.ok && !(r.headers.get("content-type") ?? "").includes("text/html")).catch(() => false));
  return existe.get(tema)!;
}

/**
 * Botón «▶ Vídeo» que solo aparece cuando el mini vídeo del tema existe. Abre el vídeo en una ventana.
 * Para publicarlo basta con dejar <tema>.mp4 (y <tema>.jpg de portada) en public/videos/mini/.
 */
export function MiniVideo({ tema, titulo, oscuro }: { tema: string; titulo: string; oscuro?: boolean }) {
  const [hay, setHay] = useState(false);
  const [abierto, setAbierto] = useState(false);
  useEffect(() => {
    let vivo = true;
    hayVideo(tema).then((x) => vivo && setHay(x));
    return () => { vivo = false; };
  }, [tema]);
  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);
  if (!hay) return null;
  return (
    <>
      <button type="button" data-video={tema} onClick={() => setAbierto(true)} className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${oscuro ? "bg-white/10 text-amber-200 hover:bg-white/20" : "bg-teal-50 text-teal-800 hover:bg-teal-100"}`}>
        ▶ Ver vídeo
      </button>
      {abierto && (
        <div role="dialog" aria-modal="true" aria-label={titulo} className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 p-4" onClick={() => setAbierto(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 p-4 pb-2">
              <h3 className="font-semibold text-stone-900">{titulo}</h3>
              <button type="button" aria-label="Cerrar" className="px-2 text-2xl leading-none text-stone-400 hover:text-stone-700" onClick={() => setAbierto(false)}>×</button>
            </div>
            <video className="max-h-[75vh] w-full bg-black" controls autoPlay playsInline poster={publico(`/videos/mini/${tema}.jpg`)} src={publico(`/videos/mini/${tema}.mp4`)} />
            <p className="p-3 text-[11px] text-stone-400">Vídeo generado con inteligencia artificial. Contenido orientativo.</p>
          </div>
        </div>
      )}
    </>
  );
}
