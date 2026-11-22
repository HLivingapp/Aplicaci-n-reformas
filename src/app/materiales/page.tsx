"use client";

import Link from "next/link";
import { GuiaEleccion } from "@/components/GuiaEleccion";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { CatalogoMateriales } from "@/components/CatalogoMateriales";
import { FotosCalidad } from "@/components/FotosCalidad";
import { SeleccionProductos } from "@/components/SeleccionProductos";
import { VideosNormativa } from "@/components/foro/VideosNormativa";
import { VIDEOS_DECISIONES } from "@/lib/videos-normativa";
import type { NivelMaterial } from "@/lib/types";

const NIVELES: { n: NivelMaterial; t: string }[] = [
  { n: "basico", t: "Básico" },
  { n: "medio", t: "Medio" },
  { n: "premium", t: "Premium" },
];

/** Área de materiales de toda la vivienda: catálogo por zona y nivel, gamas, selección recomendada, vídeos y guía. */
export default function Materiales() {
  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Materiales para toda tu vivienda</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Cocina, baño, suelos, puertas, armarios, ventanas, electricidad y climatización. Productos básicos, medios y premium con foto, precio público de tienda y enlace, para que sepas qué entra en cada calidad antes de pedir presupuesto.
        </p>
        <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 text-sm">
          {[["#catalogo", "🛒 Catálogo"], ["#gamas", "🎚️ Las tres gamas"], ["#videos", "🎬 Vídeos"], ["#seleccion", "⭐ Selección recomendada"], ["#guia", "🗓️ Qué elegir y cuándo"]].map(([h, t]) => (
            <a key={h} href={h} className="shrink-0 rounded-full bg-white px-3 py-1.5 ring-1 ring-stone-200 hover:bg-stone-100">{t}</a>
          ))}
        </nav>

        <div className="mt-6"><CatalogoMateriales /></div>

        <section id="gamas" className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight">Así es cada gama</h2>
          <p className="mt-1 max-w-2xl text-stone-600">Las marcas de referencia de cada calidad, con fotos de la web de cada fabricante.</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            {NIVELES.map((x) => (
              <div key={x.n} className="rounded-2xl border border-stone-200 bg-white p-3">
                <div className="font-semibold">{x.t}</div>
                <FotosCalidad nivel={x.n} />
              </div>
            ))}
          </div>
        </section>

        <div id="videos" className="mt-10">
          <VideosNormativa videos={VIDEOS_DECISIONES} carpeta="decisiones" titulo="Vídeos: decide tus acabados a tiempo" texto="El orden de la obra y qué elegir en cada momento: grifería, cocina, baño, suelos, puertas y armarios. Contenido orientativo." />
        </div>

        <section id="seleccion" className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight">Selección de productos recomendada</h2>
          <p className="mt-1 max-w-2xl text-stone-600">Lo que pone en sus obras Human Living, empresa destacada de la app, explicado por su equipo en vídeos cortos, con el catálogo de cada marca.</p>
          <div className="mt-4"><SeleccionProductos /></div>
        </section>

        <div id="guia" className="mt-10"><GuiaEleccion /></div>

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-4">
          <div className="font-semibold">¿Ya sabes qué calidad quieres?</div>
          <p className="mt-1 text-sm text-stone-600">Calcula tu reforma con esa gama y ve el presupuesto al momento, partida a partida.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/nuevo" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Calcular mi reforma</Link>
            <Link href="/disena" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50">Diseñar mi baño o cocina</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
