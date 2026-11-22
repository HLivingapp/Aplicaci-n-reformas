"use client";

import { useState } from "react";
import type { PrecioOrientativo } from "@/lib/gama-media";
import { publico } from "@/lib/base";
import { CATEGORIAS_MEDIA, useMaterialesMedia, type CategoriaMedia, type MaterialMedia } from "@/lib/gama-media";

const cat = (id: CategoriaMedia) => CATEGORIAS_MEDIA.find((c) => c.id === id)!;

/** Las fotos propias de la app van con la ruta base; las subidas (data:) o https, tal cual. */
export const srcImagen = (s: string) => (s.startsWith("/") ? publico(s) : s);

const fechaCorta = (iso: string) => new Date(iso).toLocaleDateString("es-ES", { month: "short", year: "numeric" });

/** Precio orientativo público con su fuente y fecha. */
export function PrecioMaterial({ p }: { p?: PrecioOrientativo }) {
  if (!p) return null;
  return (
    <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-950">
      <span className="font-semibold">💶 {p.texto}</span>
      <span className="block text-[10px] text-amber-800">
        PVP orientativo con IVA en {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline">{p.fuente}</a> : p.fuente}, {fechaCorta(p.fecha)}
      </span>
    </p>
  );
}

/** Ficha de un material: imagen (o icono de la categoría), marca, nombre y enlace al catálogo. */
export function FichaMaterial({ x, acciones, etiqueta }: { x: MaterialMedia; acciones?: React.ReactNode; etiqueta?: string }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-stone-100">
        {x.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={srcImagen(x.imagen)} alt={`${x.marca} ${x.nombre}`} loading="lazy" referrerPolicy="no-referrer" className={`absolute inset-0 h-full w-full ${x.encajar ? "bg-white object-contain p-2" : "object-cover"}`} />
        ) : (
          <span className="text-4xl opacity-60" aria-hidden>{cat(x.categoria).icono}</span>
        )}
        {etiqueta && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-stone-700 shadow-sm">{etiqueta}</span>}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{x.marca}</div>
        <h3 className="font-medium leading-snug">{x.nombre}</h3>
        <p className="mt-1 flex-1 text-xs text-stone-500">{x.detalle}</p>
        <PrecioMaterial p={x.precio} />
        {x.credito && <p className="mt-1 text-[10px] text-stone-400">{x.credito}</p>}
        {x.url && (
          <a href={x.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm font-medium text-teal-800 underline decoration-teal-300 underline-offset-2">Ver catálogo ↗</a>
        )}
        {acciones}
      </div>
    </article>
  );
}

/** Rejilla de materiales de gama media con filtro por categoría. */
export function MaterialesMedia({ inicial }: { inicial?: CategoriaMedia }) {
  const lista = useMaterialesMedia();
  const [filtro, setFiltro] = useState<CategoriaMedia | "todas">(inicial ?? "todas");
  const visibles = filtro === "todas" ? lista : lista.filter((x) => x.categoria === filtro);
  const presentes = CATEGORIAS_MEDIA.filter((c) => lista.some((x) => x.categoria === c.id));
  return (
    <div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {[{ id: "todas" as const, texto: "Todas", icono: "✨" }, ...presentes].map((c) => (
          <button key={c.id} onClick={() => setFiltro(c.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${filtro === c.id ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>
            {c.icono} {c.texto}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibles.map((x) => (
          <FichaMaterial key={x.id} x={x} />
        ))}
      </div>
      {visibles.length === 0 && <p className="mt-6 text-center text-sm text-stone-500">Todavía no hay materiales en esta categoría.</p>}
    </div>
  );
}
