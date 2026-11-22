"use client";

import { useState } from "react";
import { FichaMaterial } from "@/components/MaterialesMedia";
import { CATEGORIAS_MEDIA, type CategoriaMedia } from "@/lib/gama-media";
import { NIVELES_CATALOGO, catalogoDe, type NivelCatalogo } from "@/lib/catalogo-materiales";

/** Zonas de la vivienda y las categorías de material que lleva cada una. */
export const ZONAS: { id: string; texto: string; icono: string; categorias: CategoriaMedia[] }[] = [
  { id: "todo", texto: "Toda la vivienda", icono: "🏠", categorias: CATEGORIAS_MEDIA.map((c) => c.id) },
  { id: "cocina", texto: "Cocina", icono: "🍳", categorias: ["cocina", "electrodomesticos", "encimeras", "griferia", "azulejos", "suelos"] },
  { id: "bano", texto: "Baño", icono: "🛁", categorias: ["bano", "sanitarios", "griferia", "azulejos", "suelos"] },
  { id: "salon", texto: "Salón y dormitorios", icono: "🛋️", categorias: ["suelos", "puertas", "armarios"] },
  { id: "ventanas", texto: "Ventanas", icono: "🪟", categorias: ["ventanas"] },
  { id: "instalaciones", texto: "Electricidad y clima", icono: "⚡", categorias: ["electricidad", "climatizacion"] },
];

/** Catálogo de materiales por zona, nivel y categoría, con foto, PVP público, tienda y fecha. */
/** Marcas que se enseñan primero dentro de su categoría. */
const DESTACADAS = ["Nais", "Vives", "Bestile"];
const prioridad = (m: string) => { const i = DESTACADAS.indexOf(m); return i < 0 ? 99 : i; };

type NivelFiltro = NivelCatalogo | "todas";
const OPCIONES: { id: NivelFiltro; texto: string; detalle: string }[] = [{ id: "todas", texto: "Todas", detalle: "Las tres gamas juntas" }, ...NIVELES_CATALOGO];
const ETIQUETA: Record<NivelCatalogo, string> = { basico: "Básico", medio: "Medio", premium: "Premium" };

export function CatalogoMateriales({ inicial = "todas" }: { inicial?: NivelFiltro }) {
  const [nivel, setNivel] = useState<NivelFiltro>(inicial);
  const [zona, setZona] = useState("todo");
  const cats = ZONAS.find((z) => z.id === zona)!.categorias;
  const niveles: NivelCatalogo[] = nivel === "todas" ? ["basico", "medio", "premium"] : [nivel];
  const lista = niveles.flatMap((n) => catalogoDe(n).filter((x) => cats.includes(x.categoria)).map((x) => ({ x, n })));
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
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist">
        {OPCIONES.map((n) => (
          <button key={n.id} role="tab" aria-selected={nivel === n.id} onClick={() => setNivel(n.id)} className={`rounded-xl border p-2 text-left ${nivel === n.id ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100" : "border-stone-200"}`}>
            <div className="font-semibold">{n.texto}</div>
            <div className="text-xs text-stone-500">{n.detalle}</div>
          </button>
        ))}
      </div>
      {lista.length === 0 && <p className="mt-6 text-center text-sm text-stone-500">Todavía no hay productos de este nivel en esta zona.</p>}
      {CATEGORIAS_MEDIA.filter((c) => cats.includes(c.id)).map((c) => {
        const items = lista.filter(({ x }) => x.categoria === c.id).map((y, i) => ({ ...y, i })).sort((a, b) => prioridad(a.x.marca) - prioridad(b.x.marca) || a.i - b.i);
        if (!items.length) return null;
        return (
          <div key={c.id} className="mt-5">
            <h3 className="font-semibold">{c.icono} {c.texto}</h3>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map(({ x, n }) => <FichaMaterial key={n + x.id} x={x} etiqueta={nivel === "todas" ? ETIQUETA[n] : undefined} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}
