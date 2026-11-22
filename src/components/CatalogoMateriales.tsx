"use client";

import { useState } from "react";
import { FichaMaterial } from "@/components/MaterialesMedia";
import { CATEGORIAS_MEDIA, type CategoriaMedia } from "@/lib/gama-media";
import { NIVELES_CATALOGO, catalogoDe, type NivelCatalogo } from "@/lib/catalogo-materiales";

/** Zonas de la vivienda y las categorías de material que lleva cada una. */
export const ZONAS: { id: string; texto: string; icono: string; categorias: CategoriaMedia[] }[] = [
  { id: "todo", texto: "Toda la vivienda", icono: "🏠", categorias: CATEGORIAS_MEDIA.map((c) => c.id) },
  { id: "cocina", texto: "Cocina", icono: "🍳", categorias: ["cocina", "suelos"] },
  { id: "bano", texto: "Baño", icono: "🛁", categorias: ["bano", "suelos"] },
  { id: "salon", texto: "Salón y dormitorios", icono: "🛋️", categorias: ["suelos", "puertas", "armarios"] },
  { id: "ventanas", texto: "Ventanas", icono: "🪟", categorias: ["ventanas"] },
  { id: "instalaciones", texto: "Electricidad y clima", icono: "⚡", categorias: ["electricidad", "climatizacion"] },
];

/** Catálogo de materiales por zona, nivel y categoría, con foto, PVP público, tienda y fecha. */
export function CatalogoMateriales({ inicial = "medio" }: { inicial?: NivelCatalogo }) {
  const [nivel, setNivel] = useState<NivelCatalogo>(inicial);
  const [zona, setZona] = useState("todo");
  const cats = ZONAS.find((z) => z.id === zona)!.categorias;
  const lista = catalogoDe(nivel).filter((x) => cats.includes(x.categoria));
  return (
    <section id="catalogo" className="rounded-2xl border border-stone-200 bg-white p-4">
      <h2 className="text-xl font-semibold">Catálogo con fotos y precios</h2>
      <p className="mt-1 max-w-2xl text-sm text-stone-600">Elige la zona de tu casa y el nivel, y compara productos reales. Los precios son PVP públicos con IVA de tiendas en internet, con enlace a la tienda y fecha de consulta. Son orientativos: el precio de tu reforma, con colocación, es el de tu presupuesto.</p>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {ZONAS.map((z) => (
          <button key={z.id} onClick={() => setZona(z.id)} aria-pressed={zona === z.id} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${zona === z.id ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>
            {z.icono} {z.texto}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2" role="tablist">
        {NIVELES_CATALOGO.map((n) => (
          <button key={n.id} role="tab" aria-selected={nivel === n.id} onClick={() => setNivel(n.id)} className={`rounded-xl border p-2 text-left ${nivel === n.id ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100" : "border-stone-200"}`}>
            <div className="font-semibold">{n.texto}</div>
            <div className="text-xs text-stone-500">{n.detalle}</div>
          </button>
        ))}
      </div>
      {lista.length === 0 && <p className="mt-6 text-center text-sm text-stone-500">Todavía no hay productos de este nivel en esta zona.</p>}
      {CATEGORIAS_MEDIA.filter((c) => cats.includes(c.id)).map((c) => {
        const items = lista.filter((x) => x.categoria === c.id);
        if (!items.length) return null;
        return (
          <div key={c.id} className="mt-5">
            <h3 className="font-semibold">{c.icono} {c.texto}</h3>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((x) => <FichaMaterial key={x.id} x={x} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}
