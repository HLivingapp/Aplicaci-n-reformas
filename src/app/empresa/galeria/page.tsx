"use client";

import { useEffect, useMemo, useState } from "react";
import { hoy } from "@/lib/calc";
import { ESTANCIAS_FOTO, ETIQUETAS_FOTO, FASES_FOTO, publicable, reencodar } from "@/lib/galeria";
import { nuevoId } from "@/lib/id";
import { conBaseDeDatos } from "@/lib/modo";
import { useDatos } from "@/lib/store";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import type { FotoGaleria } from "@/lib/types";
import { Boton, inputCls, Tarjeta, Titulo, Vacio } from "@/components/ui";

type Filtro = "pendientes" | "publicadas" | "todas";

const aDataUrl = (b: Blob) =>
  new Promise<string>((ok, mal) => {
    const f = new FileReader();
    f.onload = () => ok(String(f.result));
    f.onerror = () => mal(f.error);
    f.readAsDataURL(b);
  });

/** En la base de datos las fotos están en un bucket privado: el equipo las ve con enlaces firmados. */
function useMiniaturas(fotos: FotoGaleria[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const rutas = fotos.map((f) => f.ruta).join("|");
  useEffect(() => {
    if (!conBaseDeDatos) return;
    const faltan = fotos.map((f) => f.ruta).filter((r) => !urls[r]);
    if (!faltan.length) return;
    supabaseNavegador()
      .storage.from("galeria")
      .createSignedUrls(faltan, 3600)
      .then(({ data }) => data && setUrls((u) => ({ ...u, ...Object.fromEntries(data.map((x) => [x.path ?? "", x.signedUrl ?? ""])) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rutas]);
  return (f: FotoGaleria) => (conBaseDeDatos ? urls[f.ruta] : f.ruta);
}

function Chips({ opciones, valores, cambiar }: { opciones: readonly { valor: string; texto: string }[]; valores: string[]; cambiar: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {opciones.map((o) => {
        const on = valores.includes(o.valor);
        return (
          <button
            key={o.valor}
            type="button"
            onClick={() => cambiar(on ? valores.filter((x) => x !== o.valor) : [...valores, o.valor])}
            className={`rounded-full px-2 py-0.5 text-xs ${on ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-600"}`}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}

export default function Galeria() {
  const { datos, actualizar } = useDatos();
  const [filtro, setFiltro] = useState<Filtro>("pendientes");
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const url = useMiniaturas(datos.fotos);

  const lista = useMemo(
    () => datos.fotos.filter((f) => (filtro === "todas" ? true : filtro === "publicadas" ? publicable(f) : !publicable(f))),
    [datos.fotos, filtro],
  );

  const cambiar = (id: string, fn: (f: FotoGaleria) => void) =>
    actualizar((d) => {
      const f = d.fotos.find((x) => x.id === id);
      if (f) fn(f);
    });

  async function subir(archivos: FileList | null) {
    if (!archivos?.length) return;
    setError(null);
    const nuevas: FotoGaleria[] = [];
    try {
      for (const [i, a] of [...archivos].entries()) {
        setSubiendo(`Subiendo ${i + 1} de ${archivos.length}…`);
        const id = nuevoId();
        let ruta: string;
        if (conBaseDeDatos) {
          const blob = await reencodar(a);
          ruta = `fotos/${id}.jpg`;
          const { error } = await supabaseNavegador().storage.from("galeria").upload(ruta, blob, { contentType: "image/jpeg" });
          if (error) throw error;
        } else {
          // Modo demostración: imagen pequeña guardada en el navegador
          ruta = await aDataUrl(await reencodar(a, 900, 0.7));
        }
        nuevas.push({ id, ruta, tipo: "resultado", estancias: [], etiquetas: [], aprobada: false, sinDatosUbicacion: false, nota: "", subida: hoy() });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto");
    } finally {
      if (nuevas.length) actualizar((d) => void d.fotos.unshift(...nuevas));
      setSubiendo(null);
      setFiltro("pendientes");
    }
  }

  async function borrar(f: FotoGaleria) {
    if (!confirm("¿Borrar esta foto de la galería? No se puede deshacer.")) return;
    if (conBaseDeDatos) {
      const { error } = await supabaseNavegador().storage.from("galeria").remove([f.ruta]);
      if (error) return setError(error.message);
    }
    actualizar((d) => void (d.fotos = d.fotos.filter((x) => x.id !== f.id)));
  }

  return (
    <>
      <Titulo
        accion={
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {subiendo ?? "＋ Subir fotos"}
            <input type="file" accept="image/*" multiple className="hidden" disabled={!!subiendo} onChange={(e) => subir(e.target.files).then(() => (e.target.value = ""))} />
          </label>
        }
      >
        Galería de fotos
      </Titulo>

      <Tarjeta className="mb-4 bg-amber-50 text-sm text-amber-950">
        <strong>Antes de publicar una foto</strong> comprueba que no se reconoce la dirección: nada de fachadas, vistas desde ventanas, portales, buzones,
        personas ni documentos. Al subirla se borran sus datos internos (GPS, cámara, fecha). Solo las fotos revisadas y aprobadas llegan a los clientes.
      </Tarjeta>
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="mb-4 flex gap-2">
        {(["pendientes", "publicadas", "todas"] as const).map((k) => (
          <button key={k} onClick={() => setFiltro(k)} className={`rounded-full px-3 py-1 text-sm capitalize ${filtro === k ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}>
            {k} ({datos.fotos.filter((f) => (k === "todas" ? true : k === "publicadas" ? publicable(f) : !publicable(f))).length})
          </button>
        ))}
      </div>

      {!lista.length && <Vacio>{datos.fotos.length ? "No hay fotos en este filtro." : "Sube fotos de reformas terminadas y de obra para enseñarlas a los clientes."}</Vacio>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((f) => (
          <Tarjeta key={f.id} className="space-y-3 p-3">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {url(f) && <img src={url(f)} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex gap-1 text-sm">
              {(["resultado", "obra"] as const).map((t) => (
                <button key={t} onClick={() => cambiar(f.id, (x) => void (x.tipo = t))} className={`flex-1 rounded-md py-1 ${f.tipo === t ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>
                  {t === "resultado" ? "Terminada" : "Durante la obra"}
                </button>
              ))}
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-stone-500">Estancia (la primera es la principal)</div>
              <Chips opciones={ESTANCIAS_FOTO} valores={f.estancias} cambiar={(v) => cambiar(f.id, (x) => void (x.estancias = v))} />
            </div>
            {f.tipo === "resultado" ? (
              <div>
                <div className="mb-1 text-xs font-medium text-stone-500">Qué se ve</div>
                <Chips opciones={ETIQUETAS_FOTO} valores={f.etiquetas} cambiar={(v) => cambiar(f.id, (x) => void (x.etiquetas = v))} />
              </div>
            ) : (
              <select className={inputCls} value={f.fase ?? ""} onChange={(e) => cambiar(f.id, (x) => void (x.fase = e.target.value || undefined))}>
                <option value="">Fase de obra…</option>
                {FASES_FOTO.map((o) => (
                  <option key={o.valor} value={o.valor}>{o.texto}</option>
                ))}
              </select>
            )}
            <input className={inputCls} placeholder="Nota interna (obra, observaciones)" value={f.nota} onChange={(e) => cambiar(f.id, (x) => void (x.nota = e.target.value.slice(0, 300)))} />
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-teal-700"
                checked={f.sinDatosUbicacion}
                onChange={(e) => cambiar(f.id, (x) => {
                  x.sinDatosUbicacion = e.target.checked;
                  if (!e.target.checked) x.aprobada = false;
                })}
              />
              <span>Revisada: no se reconoce la dirección</span>
            </label>
            <label className={`flex items-start gap-2 text-sm ${f.sinDatosUbicacion ? "" : "opacity-50"}`}>
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal-700" disabled={!f.sinDatosUbicacion} checked={f.aprobada} onChange={(e) => cambiar(f.id, (x) => void (x.aprobada = e.target.checked))} />
              <span>Mostrar a los clientes</span>
            </label>
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>{publicable(f) ? "✅ Visible para clientes" : "Oculta"}</span>
              <Boton variante="peligro" className="px-2 py-1 text-xs" onClick={() => borrar(f)}>Borrar</Boton>
            </div>
          </Tarjeta>
        ))}
      </div>
    </>
  );
}
