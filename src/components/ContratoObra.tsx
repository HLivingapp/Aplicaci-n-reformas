"use client";

import { useState } from "react";
import { euros, fecha } from "@/lib/calc";
import { hitosDe } from "@/lib/obra";
import type { Extra, Obra } from "@/lib/types";

/** Importe con IVA de la obra: presupuesto firmado más los extras aceptados. */
export function importeObra(o: Obra, totalPresupuesto: number, ivaPct: number) {
  const extras = (o.extras ?? []).filter((e) => e.estado === "aceptado").reduce((s, e) => s + e.importe, 0);
  return Math.round((totalPresupuesto + extras * (1 + ivaPct / 100)) * 100) / 100;
}

export function diferenciaReferencia(e: Extra) {
  return e.referencia ? Math.round(((e.importe - e.referencia) / e.referencia) * 100) : null;
}

/** Hitos de pago con su importe y estado. `accion` decide qué botón ve cada parte. */
export function HitosPago({ o, total, accion }: { o: Obra; total: number; accion?: (hitoId: string, estado: string) => React.ReactNode }) {
  const hitos = hitosDe(o);
  const pagado = hitos.filter((h) => h.estado === "pagado").reduce((s, h) => s + h.pct, 0);
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-stone-500">
        <span>Pagado {pagado} % · {euros((total * pagado) / 100)}</span>
        <span>Total {euros(total)} con IVA</span>
      </div>
      <ol className="space-y-2">
        {hitos.map((h) => (
          <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 p-2.5 text-sm">
            <div>
              <div className="font-medium">{h.nombre} · {h.pct} %</div>
              <div className="text-xs text-stone-500">
                {euros((total * h.pct) / 100)} ·{" "}
                {h.estado === "pagado" ? `✓ Pagado el ${fecha(h.pagado!)}` : h.estado === "solicitado" ? `Solicitado el ${fecha(h.solicitado!)}` : "Pendiente"}
              </div>
            </div>
            {accion?.(h.id, h.estado)}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-stone-400">El pago se hace directamente al reformista. Aquí ambas partes lo dejáis confirmado, con el avance de la obra.</p>
    </div>
  );
}

/** Formulario de puntuación de una fase terminada (1 a 5 en tres aspectos). */
export function ValorarFase({ nombre, alEnviar }: { nombre: string; alEnviar: (v: { puntualidad: number; limpieza: number; cumplimiento: number; comentario: string }) => void }) {
  const [v, setV] = useState({ puntualidad: 0, limpieza: 0, cumplimiento: 0, comentario: "" });
  const listo = v.puntualidad && v.limpieza && v.cumplimiento;
  const Estrellas = ({ k, texto }: { k: "puntualidad" | "limpieza" | "cumplimiento"; texto: string }) => (
    <div className="flex items-center justify-between gap-2">
      <span className="text-stone-600">{texto}</span>
      <span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} de 5`} onClick={() => setV({ ...v, [k]: n })} className={`text-lg ${n <= v[k] ? "text-amber-500" : "text-stone-300"}`}>★</button>
        ))}
      </span>
    </div>
  );
  return (
    <div className="space-y-1 rounded-lg bg-amber-50 p-3 text-sm">
      <div className="font-medium">¿Qué tal la fase «{nombre}»?</div>
      <Estrellas k="puntualidad" texto="Puntualidad y plazos" />
      <Estrellas k="limpieza" texto="Limpieza y orden" />
      <Estrellas k="cumplimiento" texto="Lo acordado y la calidad" />
      <textarea rows={2} maxLength={1000} value={v.comentario} onChange={(e) => setV({ ...v, comentario: e.target.value })} placeholder="Comentario (opcional)" className="mt-1 w-full rounded-md border border-stone-200 p-2 text-sm" />
      <button disabled={!listo} onClick={() => alEnviar(v)} className="rounded-full bg-stone-900 px-4 py-1.5 text-sm text-white disabled:opacity-40">Enviar valoración</button>
    </div>
  );
}
