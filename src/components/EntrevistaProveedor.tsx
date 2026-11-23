"use client";

import { useState } from "react";
import { Boton, Campo, inputCls } from "@/components/ui";
import { nuevoId } from "@/lib/id";
import type { EntrevistaCliente } from "@/lib/types";

const vacia = (): Omit<EntrevistaCliente, "id" | "fecha"> => ({ obra: "", loMejor: "", enQueFalla: "", cumplioPlazo: null, cumplioPresupuesto: null, recomendaria: "si" });

function SiNo({ valor, cambiar }: { valor: boolean | null; cambiar: (v: boolean | null) => void }) {
  return (
    <div className="flex gap-1.5 text-sm">
      {([[true, "Sí"], [false, "No"], [null, "No lo sabe"]] as const).map(([v, t]) => (
        <button key={t} type="button" onClick={() => cambiar(v)} className={`rounded-lg px-3 py-1.5 ${valor === v ? "bg-stone-900 text-white" : "bg-stone-100"}`}>{t}</button>
      ))}
    </div>
  );
}

/**
 * Entrevista al cliente al terminar la obra (uso interno). Se publica en la ficha del proveedor sin datos del cliente:
 * opiniones serias y documentadas en lugar de reseñas con estrellas.
 */
export function EntrevistaProveedor({ entrevistas, guardar }: { entrevistas: EntrevistaCliente[]; guardar: (lista: EntrevistaCliente[]) => void }) {
  const [e, setE] = useState(vacia);
  const set = <K extends keyof typeof e>(k: K, v: (typeof e)[K]) => setE((x) => ({ ...x, [k]: v }));
  const valida = e.obra.trim() && e.loMejor.trim() && e.enQueFalla.trim();
  return (
    <div className="space-y-3" data-testid="entrevista-form">
      <p className="text-sm text-stone-600">
        Llama al cliente al terminar la obra y pregúntale qué es lo mejor del proveedor y en qué falla. Se publica en su ficha sin nombre ni dirección del cliente.
      </p>
      <Campo etiqueta="Obra (sin dirección ni nombres) *">
        <input className={inputCls} placeholder="p. ej. Reforma integral de 90 m² en Chamberí" value={e.obra} onChange={(x) => set("obra", x.target.value.slice(0, 160))} />
      </Campo>
      <Campo etiqueta="¿Qué es lo mejor de este proveedor? *">
        <textarea rows={2} className={inputCls} value={e.loMejor} onChange={(x) => set("loMejor", x.target.value.slice(0, 800))} />
      </Campo>
      <Campo etiqueta="¿En qué falla o qué mejoraría? *">
        <textarea rows={2} className={inputCls} value={e.enQueFalla} onChange={(x) => set("enQueFalla", x.target.value.slice(0, 800))} />
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="¿Cumplió el plazo?"><SiNo valor={e.cumplioPlazo} cambiar={(v) => set("cumplioPlazo", v)} /></Campo>
        <Campo etiqueta="¿Cumplió el presupuesto?"><SiNo valor={e.cumplioPresupuesto} cambiar={(v) => set("cumplioPresupuesto", v)} /></Campo>
      </div>
      <Campo etiqueta="¿Lo recomendaría?">
        <div className="flex flex-wrap gap-1.5 text-sm">
          {([["si", "Sí"], ["con_reservas", "Con reservas"], ["no", "No"]] as const).map(([v, t]) => (
            <button key={v} type="button" onClick={() => set("recomendaria", v)} className={`rounded-lg px-3 py-1.5 ${e.recomendaria === v ? "bg-stone-900 text-white" : "bg-stone-100"}`}>{t}</button>
          ))}
        </div>
      </Campo>
      <Boton
        disabled={!valida}
        onClick={() => {
          guardar([{ ...e, obra: e.obra.trim(), loMejor: e.loMejor.trim(), enQueFalla: e.enQueFalla.trim(), id: nuevoId(), fecha: new Date().toISOString().slice(0, 10) }, ...entrevistas]);
          setE(vacia());
        }}
      >
        Publicar entrevista
      </Boton>
      {entrevistas.length > 0 && (
        <ul className="space-y-2 text-sm">
          {entrevistas.map((x) => (
            <li key={x.id} className="rounded-lg border border-stone-200 p-2">
              <div className="flex justify-between gap-2"><span className="font-medium">{x.obra}</span><span className="text-xs text-stone-400">{x.fecha}</span></div>
              <p className="text-xs"><b>Lo mejor:</b> {x.loMejor}</p>
              <p className="text-xs"><b>En qué falla:</b> {x.enQueFalla}</p>
              <button type="button" className="mt-1 text-xs text-red-700 underline" onClick={() => guardar(entrevistas.filter((y) => y.id !== x.id))}>Retirar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
