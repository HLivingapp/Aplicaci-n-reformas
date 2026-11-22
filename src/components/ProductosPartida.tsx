"use client";

import { MATERIALES_MEDIA_INICIALES } from "@/lib/gama-media";
import { srcImagen } from "./MaterialesMedia";

/** Productos concretos (foto, marca, modelo y precio público orientativo) con los que se calcula una partida. */
export function ProductosPartida({ ids }: { ids?: string[] }) {
  const prods = (ids ?? []).map((id) => MATERIALES_MEDIA_INICIALES.find((x) => x.id === id)).filter((x) => x != null);
  if (!prods.length) return null;
  return (
    <div className="mt-2">
      <div className="text-xs font-medium text-stone-700">Productos con los que se calcula</div>
      <ul className="mt-1 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {prods.map((x) => (
          <li key={x.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-stone-200 bg-white p-1.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-stone-100">
              {x.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={srcImagen(x.imagen)} alt={`${x.marca} ${x.nombre}`} loading="lazy" referrerPolicy="no-referrer" className={`absolute inset-0 h-full w-full ${x.encajar ? "bg-white object-contain p-0.5" : "object-cover"}`} />
              )}
            </div>
            <div className="min-w-0 text-xs leading-snug">
              <div className="truncate font-semibold text-stone-800">{x.marca} · {x.nombre}</div>
              <div className="truncate text-stone-500">{x.detalle}</div>
              {x.precio && <div className="text-amber-800">PVP orientativo: {x.precio.texto.replace(/^./, (c) => c.toLowerCase())}</div>}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[10px] text-stone-400">Selección de gama media. En la visita puedes cambiar cualquier producto por otro equivalente.</p>
    </div>
  );
}
