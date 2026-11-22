"use client";

import { FOTOS_CALIDAD } from "@/lib/fotos-calidad";
import type { NivelMaterial } from "@/lib/types";
import { srcImagen } from "./MaterialesMedia";

const NOMBRE: Record<NivelMaterial, string> = { basico: "básica", medio: "media", premium: "premium" };

/** Fotos de materiales de la gama elegida, para ver qué incluye cada calidad. */
export function FotosCalidad({ nivel }: { nivel: NivelMaterial }) {
  const fotos = FOTOS_CALIDAD[nivel];
  return (
    <div className="mt-3">
      <div className="text-xs font-medium text-stone-600">Así son los materiales de la gama {NOMBRE[nivel]}</div>
      <ul className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {fotos.map((f) => (
          <li key={f.src} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <div className="relative aspect-square bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={srcImagen(f.src)} alt={`${f.texto} (${f.credito})`} loading="lazy" referrerPolicy="no-referrer" className={`absolute inset-0 h-full w-full ${f.encajar ? "object-contain p-2" : "object-cover"}`} />
            </div>
            <div className="p-1.5 text-[11px] leading-tight">
              <div className="font-medium text-stone-800">{f.texto}</div>
              <div className="text-stone-500">{f.credito} o similar</div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[10px] text-stone-400">Fotos de la web de cada fabricante, como referencia de la gama. Las marcas son de sus titulares.</p>
    </div>
  );
}
