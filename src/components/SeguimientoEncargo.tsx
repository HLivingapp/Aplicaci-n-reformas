"use client";

import { useState } from "react";
import { euros } from "@/lib/calc";
import { confirmarPago, IVA_REFORMA, pagosDe, publicarAvance, solicitarPago, type Encargo } from "@/lib/encargos";
import { HITOS } from "./ContratoEncargo";
import { inputCls } from "./ui";

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
const ESTADO = { pendiente: "Pendiente", solicitado: "Solicitado", pagado: "✓ Pagado" } as const;

/** Obra en curso: pagos por hitos (el reformista los pide, el cliente confirma) y avances con fecha. */
export function SeguimientoEncargo({ e, parte }: { e: Encargo; parte: "cliente" | "reformista" }) {
  const [texto, setTexto] = useState("");
  if (e.estado !== "firmado" || !e.final) return null;
  const total = e.final.importe * (1 + IVA_REFORMA / 100);
  const pagos = pagosDe(e);
  const pagado = pagos.reduce((s, p, i) => s + (p === "pagado" ? (total * HITOS[i].pct) / 100 : 0), 0);
  const pendientes = pagos.filter((p) => p === "solicitado").length;
  return (
    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">Obra en curso con {parte === "cliente" ? `el reformista ${e.codigo}` : e.cliente}</h3>
        <span className="text-xs text-stone-500">Pagado {euros(pagado)} de {euros(total)}</span>
      </div>
      {parte === "reformista" && (
        <p className={`rounded-lg p-2 text-xs ${pendientes ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}>
          {pendientes ? `${pendientes} pago${pendientes > 1 ? "s" : ""} solicitado${pendientes > 1 ? "s" : ""} sin confirmar. El cliente recibe un aviso cada vez que lo abre.` : "Cliente al día con los pagos."}
        </p>
      )}
      <ul className="space-y-1.5">
        {HITOS.map((h, i) => {
          const p = pagos[i];
          const importe = (total * h.pct) / 100;
          return (
            <li key={h.texto} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs">{h.pct} % · {h.texto} · <b>{euros(importe)}</b></span>
              <span className="flex items-center gap-2 text-xs">
                <span className={p === "pagado" ? "text-emerald-700" : p === "solicitado" ? "text-amber-700" : "text-stone-500"}>{ESTADO[p]}</span>
                {parte === "reformista" && p === "pendiente" && <button onClick={() => solicitarPago(e.id, i)} className="rounded-full border border-teal-700 px-2.5 py-1 text-teal-800">Solicitar pago</button>}
                {parte === "cliente" && p === "solicitado" && <button onClick={() => confirmarPago(e.id, i)} className="rounded-full bg-teal-700 px-2.5 py-1 font-medium text-white">Confirmar que he pagado</button>}
              </span>
            </li>
          );
        })}
      </ul>
      <div>
        <div className="font-medium">Avances de la obra</div>
        {parte === "reformista" && (
          <div className="mt-2 flex gap-2">
            <input className={`${inputCls} flex-1`} placeholder="Ej.: Terminada la demolición, mañana entra el fontanero" value={texto} onChange={(x) => setTexto(x.target.value)} />
            <button disabled={!texto.trim()} onClick={() => { publicarAvance(e.id, texto.trim()); setTexto(""); }} className="rounded-xl bg-teal-700 px-3 text-white disabled:opacity-50">Publicar</button>
          </div>
        )}
        {(e.avances ?? []).length ? (
          <ul className="mt-2 space-y-1">
            {e.avances!.map((a) => <li key={a.fecha} className="text-xs"><span className="text-stone-500">{fecha(a.fecha)} · </span>{a.texto}</li>)}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-stone-500">{parte === "reformista" ? "Publica cómo va cada fase: tu cliente lo verá en su enlace." : "Aquí verás lo que publique el reformista."}</p>
        )}
      </div>
    </div>
  );
}
