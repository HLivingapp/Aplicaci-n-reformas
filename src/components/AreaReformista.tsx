"use client";

import { useEffect, useState } from "react";
import { euros } from "@/lib/calc";
import {
  aplicarTarifa, COMERCIALIZACION, descartarEncargo, enviarPresupuestoFinal, ESTADO_ENCARGO, fijarVisita, firmarReformista, guardarTarifa, IVA_REFORMA, referencia, tarifaDe, tarifaVacia, type Encargo,
} from "@/lib/encargos";
import type { TarifaReformista } from "@/lib/types";
import { ContratoEncargo } from "./ContratoEncargo";
import { useEncargos } from "./ComparativaRed";
import { EditorTarifas } from "./TarifasReformista";
import { Boton, inputCls, Tarjeta } from "./ui";

/** Tarifas del reformista: con ellas la app calcula su presupuesto a cada cliente de su zona. */
export function MisTarifas({ reformistaId, tarifaGuardada }: { reformistaId: string; tarifaGuardada?: TarifaReformista }) {
  const [t, setT] = useState<TarifaReformista | null>(null);
  const [guardado, setGuardado] = useState(false);
  useEffect(() => setT(tarifaDe({ id: reformistaId, tarifa: tarifaGuardada }) ?? tarifaVacia()), [reformistaId, tarifaGuardada]);
  if (!t) return null;
  return (
    <Tarjeta className="space-y-3">
      <div>
        <h2 className="font-semibold">Tus tarifas</h2>
        <p className="mt-1 text-sm text-stone-600">
          Con ellas la app calcula tu presupuesto para cada cliente de tu zona, partida a partida, y se lo enseña junto al de otros reformistas homologados. Tú no tienes que hacer nada más hasta que te pidan una visita.
        </p>
      </div>
      <EditorTarifas valor={t} onChange={(n) => { setT({ ...t, ...n }); setGuardado(false); }} />
      <div className="flex items-center gap-3">
        <Boton onClick={() => { guardarTarifa(reformistaId, t); setGuardado(true); }}>Guardar mis tarifas</Boton>
        {guardado && <span className="text-sm text-emerald-700">✓ Guardadas. Los clientes ya ven tus precios.</span>}
      </div>
    </Tarjeta>
  );
}

/** Visitas pedidas, presupuesto final tras la visita y firma del contrato. */
export function MisEncargos({ reformistaId }: { reformistaId: string }) {
  const encargos = useEncargos().filter((e) => e.reformistaId === reformistaId);
  return (
    <Tarjeta className="space-y-3">
      <h2 className="font-semibold">Clientes que quieren una visita</h2>
      {!encargos.length && <p className="text-sm text-stone-500">Todavía no te ha pedido visita nadie. Cuando un cliente te elija, lo verás aquí con su vivienda y tu presupuesto calculado.</p>}
      {encargos.map((e) => <EncargoReformista key={e.id} e={e} reformistaId={reformistaId} />)}
    </Tarjeta>
  );
}

function EncargoReformista({ e, reformistaId }: { e: Encargo; reformistaId: string }) {
  const [fecha, setFecha] = useState("");
  const [nota, setNota] = useState("");
  const [editando, setEditando] = useState(false);
  return (
    <div className="rounded-xl border border-stone-200 p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-medium">{e.cliente} · {e.zona}</div>
          <div className="text-xs text-stone-500">
            {e.vivienda.m2 ?? "?"} m² · {e.reforma.alcance === "integral" ? "reforma integral" : "reforma parcial"} · calidad {e.reforma.calidad} · tu presupuesto calculado {euros(e.baseInicial)} sin IVA
          </div>
          {e.visita.preferencia && <div className="mt-1 text-xs text-stone-600">Prefiere: {e.visita.preferencia}</div>}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_ENCARGO[e.estado].cls}`}>{ESTADO_ENCARGO[e.estado].texto}</span>
      </div>

      {e.estado === "visita_pedida" && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs text-stone-600">Día y hora de la visita<input type="datetime-local" className={`${inputCls} mt-1`} value={fecha} onChange={(x) => setFecha(x.target.value)} /></label>
          <input className={`${inputCls} min-w-40 flex-1`} placeholder="Nota para el cliente (opcional)" value={nota} onChange={(x) => setNota(x.target.value)} />
          <Boton onClick={() => fijarVisita(e.id, new Date(fecha).toISOString(), nota)} disabled={!fecha}>Confirmar visita</Boton>
          <button onClick={() => descartarEncargo(e.id)} className="text-xs text-stone-500 underline">No puedo</button>
        </div>
      )}

      {e.estado === "visita_fijada" && (
        <div className="mt-3">
          <p className="text-xs text-stone-600">Visita el {new Date(e.visita.fecha!).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}. Después de verla, mete aquí la cifra acordada y tus tarifas para esta obra: la app genera el contrato.</p>
          {!editando && <Boton className="mt-2" onClick={() => setEditando(true)}>Meter el presupuesto acordado</Boton>}
        </div>
      )}
      {(editando || e.estado === "presupuesto_final") && e.estado !== "firmado_cliente" && e.estado !== "firmado" && e.estado !== "descartado" && (
        <PresupuestoFinal e={e} reformistaId={reformistaId} alEnviar={() => setEditando(false)} />
      )}

      {e.final && e.estado !== "descartado" && (
        <div className="mt-3">
          <ContratoEncargo e={e} parte="reformista" alFirmar={() => firmarReformista(e.id)} />
          {e.estado === "presupuesto_final" && <p className="mt-2 text-xs text-stone-500">Esperando a que el cliente revise y firme. Cuando firme, te tocará firmar a ti.</p>}
        </div>
      )}
    </div>
  );
}

function PresupuestoFinal({ e, reformistaId, alEnviar }: { e: Encargo; reformistaId: string; alEnviar: () => void }) {
  const inicial = e.final?.capitulos ? { general: 0, capitulos: e.final.capitulos } : (() => {
    const t = tarifaDe({ id: reformistaId }) ?? tarifaVacia();
    return { general: t.general, capitulos: t.capitulos };
  })();
  const [t, setT] = useState(inicial);
  const calculado = aplicarTarifa(referencia(e.vivienda, e.reforma), t).base;
  const [importe, setImporte] = useState<string>(e.final ? String(e.final.importe) : "");
  const [plazo, setPlazo] = useState(e.final?.plazoSemanas ?? 10);
  const [notas, setNotas] = useState(e.final?.notas ?? "");
  const cifra = Number(importe) || Math.round(calculado);
  // Los ajustes por capítulo se guardan resueltos (el general ya aplicado a cada capítulo)
  const capitulos = () => {
    const out: Record<string, number> = {};
    for (const l of referencia(e.vivienda, e.reforma).lineas) out[l.capitulo] = t.capitulos[l.capitulo] ?? t.general;
    return out;
  };
  return (
    <div className="mt-3 space-y-3 rounded-xl bg-stone-50 p-3">
      <div className="font-medium">Presupuesto tras la visita</div>
      <details>
        <summary className="cursor-pointer text-xs text-teal-700">Ajustar mis tarifas para esta obra</summary>
        <div className="mt-2"><EditorTarifas valor={t} onChange={setT} /></div>
      </details>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-stone-600">
          Cifra acordada con el cliente, sin IVA
          <input type="number" inputMode="decimal" className={`${inputCls} mt-1`} placeholder={String(Math.round(calculado))} value={importe} onChange={(x) => setImporte(x.target.value)} />
          <span className="mt-1 block text-stone-500">Con tus tarifas salen {euros(calculado)}. Con IVA ({IVA_REFORMA} %): {euros(cifra * (1 + IVA_REFORMA / 100))}</span>
        </label>
        <label className="text-xs text-stone-600">
          Plazo de la obra (semanas)
          <input type="number" min={1} className={`${inputCls} mt-1`} value={plazo} onChange={(x) => setPlazo(Math.max(1, Number(x.target.value)))} />
        </label>
      </div>
      <textarea rows={2} className={inputCls} placeholder="Condiciones particulares acordadas en la visita (opcional)" value={notas} onChange={(x) => setNotas(x.target.value)} />
      {COMERCIALIZACION.confirmado && cifra < COMERCIALIZACION.obraMinima && <p className="text-xs text-red-700">Las obras que se contratan por la app son de al menos {euros(COMERCIALIZACION.obraMinima)}.</p>}
      <Boton disabled={COMERCIALIZACION.confirmado && cifra < COMERCIALIZACION.obraMinima} onClick={() => { enviarPresupuestoFinal(e.id, { importe: cifra, capitulos: capitulos(), plazoSemanas: plazo, notas }); alEnviar(); }}>
        {e.final ? "Actualizar presupuesto y contrato" : "Generar el contrato y enviárselo al cliente"}
      </Boton>
    </div>
  );
}
