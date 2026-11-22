"use client";

import { useState } from "react";
import { BLOQUES_DETALLE, respondidas, totalPreguntas, type DetalleReforma, type Pregunta } from "@/lib/detalle-reforma";

const eur = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 0, useGrouping: "always" } as Intl.NumberFormatOptions) + " €";

const boton = (activo: boolean) =>
  `rounded-lg border px-3 py-1.5 text-sm transition ${activo ? "border-teal-700 bg-teal-700 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-teal-600"}`;

function PreguntaDetalle({ p, valor, onCambio }: { p: Pregunta; valor: unknown; onCambio: (x: unknown) => void }) {
  const noSe = valor == null;
  return (
    <div className="py-3" data-pregunta={p.id}>
      <p className="text-sm font-medium text-stone-800">{p.titulo}</p>
      {p.ayuda && <p className="mt-0.5 text-xs text-stone-500">{p.ayuda}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {p.tipo === "opciones" &&
          p.opciones.map((op) => (
            <button key={String(op.v)} type="button" className={boton(valor === op.v)} onClick={() => onCambio(op.v)} title={op.ayuda}>
              {op.texto}
              {op.ayuda && <span className="block text-[11px] opacity-75">{op.ayuda}</span>}
            </button>
          ))}
        {p.tipo === "numero" && (
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Menos" className={boton(false)} onClick={() => onCambio(Math.max(0, (typeof valor === "number" ? valor : 1) - 1))}>−</button>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={p.max}
              aria-label={p.titulo}
              className="w-20 rounded-lg border border-stone-300 px-2 py-1.5 text-center text-sm"
              value={typeof valor === "number" ? valor : ""}
              placeholder="—"
              onChange={(e) => onCambio(e.target.value === "" ? null : Math.max(0, Math.min(p.max, Math.round(Number(e.target.value)))))}
            />
            <button type="button" aria-label="Más" className={boton(false)} onClick={() => onCambio(Math.min(p.max, (typeof valor === "number" ? valor : 0) + 1))}>+</button>
            {p.unidad && <span className="ml-1 text-sm text-stone-500">{p.unidad}</span>}
          </div>
        )}
        <button type="button" className={`${boton(noSe)} ${noSe ? "!border-stone-500 !bg-stone-500" : ""}`} onClick={() => onCambio(null)}>
          No lo sé
        </button>
      </div>
    </div>
  );
}

/**
 * Descripción detallada opcional: el cliente contesta lo que sepa y cada respuesta ajusta su partida.
 * `rapida` es el total de la estimación rápida y `ajustada` el total con las respuestas.
 */
export function DetalleReformaForm({
  detalle,
  onCambio,
  rapida,
  ajustada,
  ocupado,
}: {
  detalle?: DetalleReforma;
  onCambio: (d: DetalleReforma) => void;
  rapida?: number;
  ajustada?: number;
  ocupado?: boolean;
}) {
  const [abierto, setAbierto] = useState(!!detalle && respondidas(detalle) > 0);
  const [bloque, setBloque] = useState(0);
  const d = detalle ?? {};
  const n = respondidas(detalle);
  const cambiar = (id: keyof DetalleReforma, x: unknown) => onCambio({ ...d, [id]: x } as DetalleReforma);
  const dif = rapida != null && ajustada != null ? ajustada - rapida : null;

  if (!abierto)
    return (
      <div>
        <h3 className="font-semibold">🔍 ¿Quieres un presupuesto más ajustado?</h3>
        <p className="mt-1 text-sm text-stone-600">
          Contesta unas preguntas sencillas sobre tu reforma (demoliciones, tabiques, cocina, gamas…) y afinamos cada partida. Todas son opcionales: si no sabes algo, marca «No lo sé».
        </p>
        <button type="button" className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800" onClick={() => setAbierto(true)}>
          Describir mi reforma en detalle
        </button>
      </div>
    );

  const b = BLOQUES_DETALLE[bloque];
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">🔍 Descripción detallada de tu reforma</h3>
        <span className="text-xs text-stone-500" data-testid="contador-detalle">{n} de {totalPreguntas} contestadas</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {BLOQUES_DETALLE.map((x, i) => (
          <button key={x.titulo} type="button" className={boton(i === bloque)} onClick={() => setBloque(i)}>
            {x.icono} {x.titulo}
          </button>
        ))}
      </div>
      <div className="mt-2 divide-y divide-stone-100">
        {b.preguntas.map((p) => (
          <PreguntaDetalle key={p.id} p={p} valor={d[p.id]} onCambio={(x) => cambiar(p.id, x)} />
        ))}
      </div>
      {bloque === BLOQUES_DETALLE.length - 1 && (
        <label className="mt-3 block">
          <span className="text-sm font-medium text-stone-800">Otras observaciones</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm"
            rows={3}
            maxLength={2000}
            placeholder="Cualquier cosa que debamos saber: mascotas, horarios, piezas que quieres conservar…"
            value={d.observaciones ?? ""}
            onChange={(e) => onCambio({ ...d, observaciones: e.target.value })}
          />
        </label>
      )}
      <div className="mt-3 flex justify-between">
        <button type="button" className={boton(false)} disabled={bloque === 0} onClick={() => setBloque(bloque - 1)}>← Anterior</button>
        {bloque < BLOQUES_DETALLE.length - 1 && <button type="button" className={boton(true)} onClick={() => setBloque(bloque + 1)}>Siguiente →</button>}
      </div>
      {rapida != null && (
        <div className="mt-4 rounded-xl bg-stone-50 p-3 text-sm" data-testid="comparacion-detalle">
          <div className="flex justify-between"><span>Estimación rápida</span><span>{eur(rapida)}</span></div>
          <div className="flex justify-between font-semibold"><span>Presupuesto ajustado</span><span>{ocupado ? "Calculando…" : ajustada != null ? eur(ajustada) : "—"}</span></div>
          {dif != null && !ocupado && n > 0 && (
            <p className={`mt-1 text-right text-xs font-medium ${dif > 0 ? "text-amber-700" : dif < 0 ? "text-teal-700" : "text-stone-500"}`}>
              {dif === 0 ? "Sin diferencia" : `${dif > 0 ? "+" : "−"}${eur(Math.abs(dif))} respecto a la estimación rápida`}
            </p>
          )}
          <p className="mt-1 text-xs text-stone-500">Precios sin IVA. El presupuesto de arriba ya incluye tus respuestas.</p>
        </div>
      )}
    </div>
  );
}
