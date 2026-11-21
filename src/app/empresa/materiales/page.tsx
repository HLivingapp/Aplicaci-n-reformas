"use client";

import { useState } from "react";
import { FichaMaterial } from "@/components/MaterialesMedia";
import { Boton, Campo, inputCls, Tarjeta, Titulo } from "@/components/ui";
import { fotoSinUbicacion } from "@/lib/foto-segura";
import { CATEGORIAS_MEDIA, enlaceValido, guardarMaterialesMedia, leerMaterialesMedia, MATERIALES_MEDIA_INICIALES, useMaterialesMedia, type CategoriaMedia, type MaterialMedia } from "@/lib/gama-media";
import { hoy } from "@/lib/calc";
import { nuevoId } from "@/lib/id";
import { BASE } from "@/lib/base";

const vacio = (): Omit<MaterialMedia, "id" | "fecha" | "autor"> => ({ categoria: "cocina", marca: "", nombre: "", detalle: "", url: "", imagen: "" });

/** El equipo añade, edita y quita materiales de gama media (imagen + enlace al catálogo). */
export default function MaterialesEquipo() {
  const lista = useMaterialesMedia();
  const [f, setF] = useState(vacio());
  const [editando, setEditando] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<CategoriaMedia | "todas">("todas");

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const fallo = !f.marca.trim() || !f.nombre.trim() ? "Pon la marca y el nombre." : !enlaceValido(f.url) ? "El enlace al catálogo tiene que empezar por https://" : f.imagen && !f.imagen.startsWith("data:image/") && !enlaceValido(f.imagen) ? "El enlace de la imagen tiene que empezar por https://" : "";

  const guardar = () => {
    if (fallo) return setError(fallo);
    const limpio = { ...f, marca: f.marca.trim(), nombre: f.nombre.trim(), detalle: f.detalle.trim(), url: f.url?.trim() || undefined, imagen: f.imagen?.trim() || undefined };
    const actual = leerMaterialesMedia();
    const nueva = editando ? actual.map((x) => (x.id === editando ? { ...x, ...limpio } : x)) : [{ ...limpio, id: nuevoId(), autor: "Equipo", fecha: hoy() }, ...actual];
    try {
      guardarMaterialesMedia(nueva);
      setF(vacio());
      setEditando(null);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const editar = (x: MaterialMedia) => {
    setEditando(x.id);
    setF({ categoria: x.categoria, marca: x.marca, nombre: x.nombre, detalle: x.detalle, url: x.url ?? "", imagen: x.imagen ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const quitar = (x: MaterialMedia) => confirm(`¿Quitar «${x.marca} ${x.nombre}»?`) && guardarMaterialesMedia(leerMaterialesMedia().filter((y) => y.id !== x.id));
  const visibles = filtro === "todas" ? lista : lista.filter((x) => x.categoria === filtro);

  return (
    <>
      <Titulo accion={<a href={`${BASE}/materiales/`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal-800 underline">Ver la página pública ↗</a>}>Materiales de gama media</Titulo>
      <Tarjeta className="mb-6">
        <h2 className="mb-1 font-semibold">{editando ? "Editar material" : "Añadir material"}</h2>
        <p className="mb-3 text-sm text-stone-500">Foto y enlace al catálogo o ficha del fabricante. Nunca enlaces a tarifas ni pongas precios: lo ve el cliente.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Categoría">
            <select className={inputCls} value={f.categoria} onChange={(e) => set("categoria", e.target.value as CategoriaMedia)}>
              {CATEGORIAS_MEDIA.map((c) => <option key={c.id} value={c.id}>{c.icono} {c.texto}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Marca"><input className={inputCls} value={f.marca} onChange={(e) => set("marca", e.target.value)} placeholder="Salgar" /></Campo>
          <Campo etiqueta="Producto o modelo"><input className={inputCls} value={f.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Mueble de baño Noja 80 cm" /></Campo>
          <Campo etiqueta="Enlace al catálogo (https://…)"><input className={inputCls} value={f.url} onChange={(e) => set("url", e.target.value)} inputMode="url" /></Campo>
          <Campo etiqueta="Descripción corta" className="sm:col-span-2"><input className={inputCls} value={f.detalle} onChange={(e) => set("detalle", e.target.value)} placeholder="Colores, medidas o para qué es" /></Campo>
          <Campo etiqueta="Imagen: sube una foto…">
            <input type="file" accept="image/*" className="text-sm" onChange={async (e) => { const a = e.target.files?.[0]; if (a) set("imagen", await fotoSinUbicacion(a, 800)); }} />
          </Campo>
          <Campo etiqueta="…o pega el enlace de la imagen (https://…)">
            <input className={inputCls} value={f.imagen?.startsWith("data:") ? "(foto subida)" : f.imagen} onChange={(e) => set("imagen", e.target.value)} inputMode="url" />
          </Campo>
        </div>
        {f.imagen && (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.imagen} alt="Vista previa" className="h-20 w-28 rounded-lg object-cover" referrerPolicy="no-referrer" />
            <button type="button" className="text-sm text-stone-500 underline" onClick={() => set("imagen", "")}>Quitar imagen</button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Boton onClick={guardar}>{editando ? "Guardar cambios" : "Añadir material"}</Boton>
          {editando && <Boton variante="secundario" onClick={() => { setEditando(null); setF(vacio()); setError(""); }}>Cancelar</Boton>}
        </div>
      </Tarjeta>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {[{ id: "todas" as const, texto: "Todas", icono: "" }, ...CATEGORIAS_MEDIA].map((c) => (
          <button key={c.id} onClick={() => setFiltro(c.id)} className={`rounded-full px-3 py-1 text-sm ${filtro === c.id ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}>
            {c.icono} {c.texto} ({c.id === "todas" ? lista.length : lista.filter((x) => x.categoria === c.id).length})
          </button>
        ))}
        <button className="ml-auto text-xs text-stone-400 underline" onClick={() => confirm("¿Volver a la selección inicial? Se pierden los cambios.") && guardarMaterialesMedia(MATERIALES_MEDIA_INICIALES)}>Restablecer selección inicial</button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibles.map((x) => (
          <FichaMaterial
            key={x.id}
            x={x}
            acciones={
              <div className="mt-2 flex gap-3 border-t border-stone-100 pt-2 text-xs">
                <button className="font-medium text-stone-700 underline" onClick={() => editar(x)}>Editar</button>
                <button className="text-red-700 underline" onClick={() => quitar(x)}>Quitar</button>
                {!x.imagen && <span className="ml-auto text-amber-700">Sin foto</span>}
              </div>
            }
          />
        ))}
      </div>
    </>
  );
}
