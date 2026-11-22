"use client";

import Link from "next/link";
import { GuiaEleccion } from "@/components/GuiaEleccion";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { MaterialesMedia } from "@/components/MaterialesMedia";
import { CatalogoMateriales } from "@/components/CatalogoMateriales";
import { VideosNormativa } from "@/components/foro/VideosNormativa";
import { VIDEOS_DECISIONES } from "@/lib/videos-normativa";

/** Materiales de gama media recomendados, con foto y catálogo. */
export default function Materiales() {
  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Materiales: catálogo con fotos y precios</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Productos básicos, medios y premium con foto y precio público de tienda, y debajo la selección de gama media, la más elegida. La selección inicial es de Human Living, empresa destacada de la app. Cada ficha enlaza al catálogo del fabricante para que veas colores y modelos. El precio de tu reforma es el de tu presupuesto.
        </p>
        <div className="mt-6"><CatalogoMateriales /></div>
        <div className="mt-6">
          <VideosNormativa videos={VIDEOS_DECISIONES} carpeta="decisiones" titulo="Vídeos: decide tus acabados a tiempo" texto="El orden de la obra y qué elegir en cada momento: grifería, cocina, baño, suelos, puertas y armarios. Contenido orientativo." />
          <MaterialesMedia />
        </div>
        <div className="mt-10"><GuiaEleccion /></div>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">¿Quieres ver los vídeos del equipo?</div>
            <p className="mt-1 text-sm text-stone-600">Te explicamos cocina, ventanas, puertas, armarios, electricidad y climatización en vídeos cortos.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/disena#seleccion" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Ver vídeos y selección</Link>
              <Link href="/nuevo" className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50">Calcular mi reforma</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
