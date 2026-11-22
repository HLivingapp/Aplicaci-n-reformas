"use client";

import { useState } from "react";
import { FichaMaterial } from "@/components/MaterialesMedia";
import { CATEGORIAS_MEDIA } from "@/lib/gama-media";
import { NIVELES_CATALOGO, catalogoDe, type NivelCatalogo } from "@/lib/catalogo-materiales";

/** Catálogo de materiales por nivel y categoría, con foto, PVP público, tienda y fecha. */
export function CatalogoMateriales({ inicial = "medio" }: { inicial?: NivelCatalogo }) {
  const [nivel, setNivel] = useState<NivelCatalogo>(inicial);
  const lista = catalogoDe(nivel);
  return (
    <section id="catalogo" className="rounded-2xl border border-stone-200 bg-white p-4">
      <h2 className="text-xl font-semibold">Catálogo de materiales con fotos y precios</h2>
      <p className="mt-1 max-w-2xl text-sm text-stone-600">Elige el nivel y compara productos reales. Los precios son PVP públicos con IVA de tiendas en internet, con enlace a la tienda y fecha de consulta. Son orientativos: el precio de tu reforma, con colocación, es el de tu presupuesto.</p>
      <div className="mt-3 grid grid-cols-3 gap-2" role="tablist">
        {NIVELES_CATALOGO.map((n) => (
          <button key={n.id} role="tab" aria-selected={nivel === n.id} onClick={() => setNivel(n.id)} className={`rounded-xl border p-2 text-left ${nivel === n.id ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100" : "border-stone-200"}`}>
            <div className="font-semibold">{n.texto}</div>
            <div className="text-xs text-stone-500">{n.detalle}</div>
          </button>
        ))}
      </div>
      {CATEGORIAS_MEDIA.map((c) => {
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
