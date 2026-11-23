"use client";

import { useMemo, useState } from "react";
import { Boton, inputCls, Tarjeta } from "./ui";
import { euros } from "@/lib/calc";
import { conBaseDeDatos } from "@/lib/modo";
import { guardarTarifa, tarifaDe } from "@/lib/encargos";
import {
  deducirPartidas, leerPresupuesto, partidasReferencia, PRESUPUESTOS_RECOMENDADOS, presupuestosEjemplo, tarifaDesdePartidas, type PartidaDeducida, type PresupuestoLeido,
} from "@/lib/tarifario-presupuestos";

const aBase64 = (f: File) =>
  new Promise<string>((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] ?? "");
    r.onerror = () => mal(new Error("No se pudo leer el archivo"));
    r.readAsDataURL(f);
  });

/**
 * Tarifario a partir de sus presupuestos: el reformista sube unos 20 presupuestos que haya hecho,
 * la app saca sus partidas y precios (sin datos de sus clientes), él los revisa y se guardan como su tarifario.
 */
export function TarifarioPresupuestos({ reformistaId, token }: { reformistaId: string; token?: string }) {
  const ref = useMemo(() => partidasReferencia(), []);
  const [leidos, setLeidos] = useState<PresupuestoLeido[]>([]);
  const [correcciones, setCorrecciones] = useState<Record<string, number>>({});
  const [pegado, setPegado] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const iaDisponible = conBaseDeDatos && !!token;

  const anadir = (textos: string[]) => {
    setLeidos((xs) => [...xs, ...textos.map((t, i) => leerPresupuesto(t, xs.length + i + 1, ref))]);
    setGuardado(false);
  };

  async function subir(files: FileList | null) {
    if (!files?.length) return;
    setOcupado(true);
    setAviso(null);
    const textos: string[] = [];
    const fallos: string[] = [];
    for (const f of Array.from(files)) {
      const nombre = f.name.toLowerCase();
      try {
        if (/\.(csv|tsv|txt)$/.test(nombre) || f.type.startsWith("text/")) textos.push(await f.text());
        else if (/\.(pdf|jpe?g|png)$/.test(nombre)) {
          if (!iaDisponible) { fallos.push(`${f.name}: en la demo solo se leen CSV o texto (los PDF y fotos se leen con IA en la versión real)`); continue; }
          const mediaType = nombre.endsWith(".pdf") ? "application/pdf" : nombre.endsWith(".png") ? "image/png" : "image/jpeg";
          const r = await fetch("/api/tarifario", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, mediaType, base64: await aBase64(f) }) });
          const j = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(j.error ?? "No se pudo leer");
          textos.push(String(j.lineas ?? ""));
        } else fallos.push(`${f.name}: guarda el Excel como CSV o copia y pega sus líneas`);
      } catch (e) {
        fallos.push(`${f.name}: ${e instanceof Error ? e.message : "no se pudo leer"}`);
      }
    }
    if (textos.length) anadir(textos);
    if (fallos.length) setAviso(fallos.join(" · "));
    setOcupado(false);
  }

  const asignar = (pid: string, i: number, partidaId: string) =>
    setLeidos((xs) => xs.map((p) => (p.id !== pid ? p : { ...p, lineas: p.lineas.map((l, j) => (j === i ? { ...l, partidaId: partidaId || null } : l)) })));

  const deducidas: PartidaDeducida[] = useMemo(
    () => deducirPartidas(leidos, ref).map((p) => (correcciones[p.partidaId] ? { ...p, precio: correcciones[p.partidaId], manual: true } : p)),
    [leidos, ref, correcciones],
  );
  const sinEmparejar = leidos.flatMap((p) => p.lineas.map((l, i) => ({ p, l, i })).filter((x) => !x.l.partidaId));
  const totalLineas = leidos.reduce((s, p) => s + p.lineas.length, 0);
  const capitulos = [...new Set(deducidas.map((d) => d.capitulo))];

  function guardar() {
    const nueva = tarifaDesdePartidas(deducidas, leidos.length);
    const previa = tarifaDe({ id: reformistaId });
    // Lo que había ajustado a mano por capítulo se mantiene donde sus presupuestos no dicen nada
    guardarTarifa(reformistaId, { ...nueva, capitulos: { ...(previa?.capitulos ?? {}), ...nueva.capitulos } });
    setGuardado(true);
  }

  return (
    <Tarjeta>
      <div className="space-y-4" data-testid="tarifario-presupuestos">
      <div>
        <h2 className="font-semibold">Tu tarifario a partir de tus presupuestos</h2>
        <p className="mt-1 text-sm text-stone-600">
          Sube unos {PRESUPUESTOS_RECOMENDADOS} presupuestos que hayas hecho a clientes. La app saca de ellos tus partidas y tus precios, los revisas y queda tu tarifario detallado. Con él calculamos tu presupuesto en cada proyecto.
        </p>
        <p className="mt-2 rounded-lg bg-teal-50 p-2 text-xs text-teal-900">
          🔒 Tus clientes no se exponen: solo leemos las líneas de obra. Nombres, direcciones, teléfonos, emails y NIF se quitan al leer, y el documento no se guarda.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className={`cursor-pointer rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 ${ocupado ? "opacity-60" : ""}`}>
            {ocupado ? "Leyendo…" : "Subir presupuestos"}
            <input type="file" multiple accept=".pdf,.csv,.tsv,.txt,.jpg,.jpeg,.png" className="hidden" disabled={ocupado} onChange={(e) => { void subir(e.target.files); e.target.value = ""; }} />
          </label>
          {!conBaseDeDatos && (
            <Boton variante="secundario" onClick={() => anadir(presupuestosEjemplo())}>Probar con {PRESUPUESTOS_RECOMENDADOS} presupuestos de ejemplo</Boton>
          )}
        </div>
        <p className="text-xs text-stone-500">PDF o foto{iaDisponible ? "" : " (con IA, en la versión real)"}, o CSV. Del Excel: «Guardar como CSV», o copia y pega las líneas aquí:</p>
        <textarea rows={3} className={inputCls} placeholder={"Descripción · unidad · cantidad · precio · importe\nAlicatado de paredes de baño  m2  24,5  32,00  784,00"} value={pegado} onChange={(e) => setPegado(e.target.value)} />
        <Boton variante="secundario" disabled={!pegado.trim()} onClick={() => { anadir([pegado]); setPegado(""); }}>Añadir estas líneas</Boton>
        {aviso && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">{aviso}</p>}
      </div>

      {leidos.length > 0 && (
        <>
          <div className="rounded-xl bg-stone-50 p-3 text-sm" data-testid="resumen-tarifario">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <b>{leidos.length} de {PRESUPUESTOS_RECOMENDADOS} presupuestos</b>
              <span className="text-xs text-stone-500">{totalLineas} líneas · {deducidas.length} partidas con tu precio · {sinEmparejar.length} sin emparejar</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-stone-200"><div className="h-1.5 rounded-full bg-teal-600" style={{ width: `${Math.min(100, (leidos.length / PRESUPUESTOS_RECOMENDADOS) * 100)}%` }} /></div>
            <p className="mt-2 text-xs text-stone-500">Datos personales quitados: {leidos.reduce((s, p) => s + p.descartadas, 0)} líneas de cabecera, cliente, dirección o totales descartadas.</p>
          </div>

          {sinEmparejar.length > 0 && (
            <details className="rounded-xl border border-stone-200 p-3 text-sm">
              <summary className="cursor-pointer font-medium">Líneas sin emparejar ({sinEmparejar.length}): dinos a qué partida corresponden</summary>
              <ul className="mt-2 space-y-2">
                {sinEmparejar.slice(0, 40).map(({ p, l, i }) => (
                  <li key={`${p.id}-${i}`} className="grid gap-1 sm:grid-cols-[1fr_16rem]">
                    <span className="text-xs">{l.descripcion} · {l.cantidad} {l.unidad} a {euros(l.precio)}</span>
                    <select className={`${inputCls} text-xs`} value="" onChange={(e) => asignar(p.id, i, e.target.value)}>
                      <option value="">No es ninguna</option>
                      {ref.filter((r) => r.unidad === l.unidad || (r.unidad.startsWith("m²") && l.unidad.startsWith("m²"))).map((r) => <option key={r.id} value={r.id}>{r.capitulo}: {r.descripcion.slice(0, 60)}</option>)}
                    </select>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Revisa tus precios por partida (sin IVA)</h3>
            {capitulos.map((cap) => (
              <div key={cap}>
                <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{cap}</div>
                <ul className="mt-1 divide-y divide-stone-100 text-sm">
                  {deducidas.filter((d) => d.capitulo === cap).map((d) => {
                    const dif = Math.round((d.precio / d.referencia - 1) * 100);
                    return (
                      <li key={d.partidaId} className="grid items-center gap-2 py-1.5 sm:grid-cols-[1fr_7rem_8rem]" data-partida={d.partidaId}>
                        <span className="text-xs">
                          {d.descripcion}
                          <span className="block text-stone-400">{d.muestras} vez{d.muestras === 1 ? "" : "es"} en tus presupuestos · de {euros(d.min)} a {euros(d.max)} · referencia {euros(d.referencia)}/{d.unidad}</span>
                        </span>
                        <span className={`text-xs ${dif > 0 ? "text-amber-700" : "text-teal-700"}`}>{dif > 0 ? "+" : ""}{dif} % sobre la referencia</span>
                        <label className="flex items-center gap-1 text-xs">
                          <input type="number" min={0} step="0.01" className={`${inputCls} py-1 text-right`} value={d.precio} onChange={(e) => { setCorrecciones((c) => ({ ...c, [d.partidaId]: Number(e.target.value) || 0 })); setGuardado(false); }} />
                          €/{d.unidad}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Boton disabled={!deducidas.length} onClick={guardar}>Guardar como mi tarifario</Boton>
            {guardado && <span className="text-sm text-emerald-700">✓ Guardado. En cada proyecto usamos tus precios en estas {deducidas.length} partidas y tu % por capítulo en el resto.</span>}
            {leidos.length < PRESUPUESTOS_RECOMENDADOS && <span className="text-xs text-stone-500">Cuantos más presupuestos subas, más fino sale tu precio.</span>}
          </div>
        </>
      )}
      </div>
    </Tarjeta>
  );
}
