"use client";

import { useEffect, useState } from "react";
import { CATEGORIAS_MEDIA, type MaterialMedia } from "@/lib/gama-media";
import { materialPorId, useMiSeleccion } from "@/lib/mi-seleccion";
import { srcImagen } from "./MaterialesMedia";

/** Collage automático con las fotos de los materiales elegidos. Sin IA: solo código y las fotos del catálogo. */
export function Moodboard({ compacto = false }: { compacto?: boolean }) {
  const { materiales, ids, poner, vaciar } = useMiSeleccion();
  const [compartido, setCompartido] = useState<MaterialMedia[] | null>(null);
  const [aviso, setAviso] = useState("");

  // Un moodboard compartido llega como ?moodboard=id1,id2 en el enlace.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("moodboard");
    if (q) setCompartido(q.split(",").map(materialPorId).filter((x): x is MaterialMedia => x != null));
  }, []);

  const lista = compartido ?? materiales;
  const conFoto = lista.filter((x) => x.imagen);
  const enlace = () => `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}?moodboard=${(compartido ?? materiales).map((x) => x.id).join(",")}#moodboard`;

  const compartir = async () => {
    const url = enlace();
    try {
      if (navigator.share) await navigator.share({ title: "Mi moodboard de reforma", url });
      else {
        await navigator.clipboard.writeText(url);
        setAviso("Enlace copiado");
      }
    } catch {}
  };

  if (!lista.length)
    return compacto ? null : (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
        Pulsa «Añadir a mi reforma» en los productos que te gusten y aquí se montará tu moodboard. Lo que elijas aparecerá también escrito en tu presupuesto, en su partida.
      </div>
    );

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3">
      {compartido && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-teal-50 p-2 text-sm text-teal-900">
          <span>Estás viendo un moodboard compartido.</span>
          <button onClick={() => { poner([...ids, ...compartido.map((x) => x.id)]); setCompartido(null); }} className="rounded-full bg-teal-700 px-3 py-1 text-white">Usarlo en mi reforma</button>
        </div>
      )}
      <div className={`grid gap-1.5 ${conFoto.length > 4 ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2"}`}>
        {conFoto.map((x, i) => (
          <figure key={x.id} className={`relative overflow-hidden rounded-xl bg-stone-100 ${i === 0 && conFoto.length > 2 ? "col-span-2 row-span-2" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={srcImagen(x.imagen!)} alt={`${x.marca} ${x.nombre}`} loading="lazy" referrerPolicy="no-referrer" className={`aspect-square h-full w-full ${x.encajar ? "bg-white object-contain p-2" : "object-cover"}`} />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-[10px] font-medium leading-tight text-white">{x.marca} · {x.nombre}</figcaption>
          </figure>
        ))}
      </div>
      {!compacto && (
        <ul className="mt-3 space-y-1 text-sm">
          {CATEGORIAS_MEDIA.filter((c) => lista.some((x) => x.categoria === c.id)).map((c) => (
            <li key={c.id}><span className="font-medium">{c.icono} {c.texto}:</span> {lista.filter((x) => x.categoria === c.id).map((x) => `${x.marca} ${x.nombre}`).join(", ")}</li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={compartir} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white">Compartir moodboard</button>
        {!compartido && !compacto && <button onClick={vaciar} className="rounded-full px-4 py-2 text-sm text-stone-600 ring-1 ring-stone-200">Vaciar</button>}
        {aviso && <span className="self-center text-sm text-teal-800">{aviso}</span>}
      </div>
    </div>
  );
}

/** Botón para añadir o quitar un producto de la reforma del cliente. */
export function BotonAnadir({ id }: { id: string }) {
  const { tiene, alternar } = useMiSeleccion();
  const si = tiene(id);
  return (
    <button onClick={() => alternar(id)} aria-pressed={si} className={`mt-2 rounded-full px-3 py-1.5 text-sm font-medium ${si ? "bg-teal-700 text-white" : "bg-teal-50 text-teal-900 ring-1 ring-teal-200"}`}>
      {si ? "✓ En mi reforma" : "+ Añadir a mi reforma"}
    </button>
  );
}

/** Barra fija con el número de productos elegidos y acceso al moodboard. */
export function BarraSeleccion() {
  const { ids } = useMiSeleccion();
  if (!ids.length) return null;
  return (
    <a href="#moodboard" className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between rounded-full bg-stone-900 px-4 py-3 text-sm text-white shadow-lg">
      <span>🧩 {ids.length} {ids.length === 1 ? "producto elegido" : "productos elegidos"}</span>
      <span className="font-semibold">Ver mi moodboard →</span>
    </a>
  );
}
