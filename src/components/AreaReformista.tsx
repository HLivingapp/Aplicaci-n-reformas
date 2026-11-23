"use client";

import { AvisoMemoriaTecnica } from "./Beneficios";
import { useEffect, useState } from "react";
import { euros } from "@/lib/calc";
import {
  aplicarTarifa, COMERCIALIZACION, pctReserva, TEXTO_RESERVA, AVISO_TARIFAS, LETRA_PEQUENA_TARIFAS, TEXTO_VISITA_REFORMISTA, VISITAS, descartarEncargo, reservaApp, ORIGEN_ENCARGO, enviarPresupuestoFinal, ESTADO_ENCARGO, fijarVisita, firmarReformista, guardarTarifa, IVA_REFORMA, referencia, tarifaDe, tarifaVacia, type Encargo,
} from "@/lib/encargos";
import type { TarifaReformista } from "@/lib/types";
import { ContratoEncargo } from "./ContratoEncargo";
import { SeguimientoEncargo } from "./SeguimientoEncargo";
import { useEncargos } from "./ComparativaRed";
import { EditorTarifas } from "./TarifasReformista";
import { ChatEncargo } from "./ChatEncargo";
import { fotosSubidas, guardarFotos, MAX_FOTOS, reducirFoto, type FotoTrabajo } from "@/lib/fotos-trabajos";
import { publico } from "@/lib/base";
import { intentosReformista } from "@/lib/encargos";
import { Boton, inputCls, Tarjeta } from "./ui";
import type { FichaRed } from "@/lib/red";
import { PUNTOS, puntosVisibilidad, TEXTO_VISIBILIDAD } from "@/lib/visibilidad";

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
        <p className="mt-2 rounded-lg bg-amber-100 p-2 text-sm font-semibold text-amber-950">💡 {AVISO_TARIFAS}.<span className="mt-0.5 block text-xs font-normal">{LETRA_PEQUENA_TARIFAS}</span></p>
      </div>
      {t.origen && <p className="rounded-lg bg-teal-50 p-2 text-xs text-teal-900">📑 Tienes precio propio en {t.origen.partidas} partidas, sacado de {t.origen.presupuestos} presupuestos tuyos. Los % de abajo se aplican al resto.</p>}
      <EditorTarifas valor={t} onChange={(n) => { setT({ ...t, ...n }); setGuardado(false); }} />
      <div className="flex items-center gap-3">
        <Boton onClick={() => { guardarTarifa(reformistaId, t); setGuardado(true); }}>Guardar mis tarifas</Boton>
        {guardado && <span className="text-sm text-emerald-700">✓ Guardadas. Los clientes ya ven tus precios.</span>}
      </div>
    </Tarjeta>
  );
}

/** Visitas pedidas, presupuesto final tras la visita y firma del contrato. */
/** faltanDocs: documentos que aún tiene que subir para poder generar contratos (p. ej. un proveedor invitado). */
export function MisEncargos({ reformistaId, faltanDocs = [] }: { reformistaId: string; faltanDocs?: string[] }) {
  const encargos = useEncargos().filter((e) => e.reformistaId === reformistaId);
  return (
    <Tarjeta className="space-y-3">
      <h2 className="font-semibold">Tus clientes y obras</h2>
      {encargos.length > 0 && <p className="text-xs text-stone-500">Con los clientes de la app pagas {TEXTO_VISITA_REFORMISTA} (al confirmarla) y, si firman, la reserva que pagan ellos ({TEXTO_RESERVA}) es tu fee. Los clientes que tú traes invitándote no te cuestan nada.</p>}
      {!encargos.length && <p className="text-sm text-stone-500">Todavía no te ha pedido visita nadie. Cuando un cliente te elija, lo verás aquí con su vivienda y tu presupuesto calculado.</p>}
      {faltanDocs.length > 0 && encargos.length > 0 && (
        <p className="rounded-lg bg-amber-100 p-2 text-xs text-amber-900">Para generar el contrato antes tienes que subir: {faltanDocs.join("; ")}.</p>
      )}
      {encargos.map((e) => <EncargoReformista key={e.id} e={e} reformistaId={reformistaId} bloqueado={faltanDocs.length > 0} />)}
      <AvisoMemoriaTecnica />
    </Tarjeta>
  );
}

function EncargoReformista({ e, reformistaId, bloqueado }: { e: Encargo; reformistaId: string; bloqueado: boolean }) {
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
        <div className="flex flex-wrap gap-1">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ORIGEN_ENCARGO[e.origen ?? "app"].cls}`}>{ORIGEN_ENCARGO[e.origen ?? "app"].texto}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_ENCARGO[e.estado].cls}`}>{ESTADO_ENCARGO[e.estado].texto}</span>
        </div>
      </div>

      {e.origen !== "invitado" && <ChatEncargo e={e} parte="reformista" />}

      {e.estado === "visita_pedida" && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs text-stone-600">Día y hora de la visita<input type="datetime-local" className={`${inputCls} mt-1`} value={fecha} onChange={(x) => setFecha(x.target.value)} /></label>
          <input className={`${inputCls} min-w-40 flex-1`} placeholder="Nota para el cliente (opcional)" value={nota} onChange={(x) => setNota(x.target.value)} />
          <Boton onClick={() => fijarVisita(e.id, new Date(fecha).toISOString(), nota)} disabled={!fecha}>Pagar {VISITAS.reformista} € y confirmar visita</Boton>
          <button onClick={() => descartarEncargo(e.id)} className="text-xs text-stone-500 underline">No puedo</button>
          <p className="w-full text-xs text-stone-500">Cada visita a un cliente de la app cuesta {VISITAS.reformista} € y se paga al confirmarla. El cliente ya ha pagado su parte para pedir visitas. Demo: pago simulado.</p>
        </div>
      )}

      {e.estado === "visita_fijada" && (
        <div className="mt-3">
          <p className="text-xs text-stone-600">
            {e.visita.fecha
              ? `Visita el ${new Date(e.visita.fecha).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}${e.visita.pagoReformista ? ` (visita pagada: ${VISITAS.reformista} €)` : ""}. Después de verla, mete aquí la cifra acordada y tus tarifas para esta obra: la app genera el contrato.`
              : "Tu cliente te ha invitado a la app. Mete aquí la cifra que habéis acordado y tus tarifas para esta obra: la app genera el contrato."}
          </p>
          {!editando && <Boton className="mt-2" onClick={() => setEditando(true)}>Meter el presupuesto acordado</Boton>}
        </div>
      )}
      {(editando || e.estado === "presupuesto_final") && e.estado !== "firmado_cliente" && e.estado !== "firmado" && e.estado !== "descartado" && (
        <PresupuestoFinal e={e} reformistaId={reformistaId} bloqueado={bloqueado} alEnviar={() => setEditando(false)} />
      )}

      {e.estado === "firmado" && <div className="mt-3"><SeguimientoEncargo e={e} parte="reformista" /></div>}
      {e.final && e.estado !== "descartado" && (
        <div className="mt-3">
          <ContratoEncargo e={e} parte="reformista" alFirmar={() => firmarReformista(e.id)} />
          {e.estado === "presupuesto_final" && <p className="mt-2 text-xs text-stone-500">Esperando a que el cliente revise y firme. Cuando firme, te tocará firmar a ti.</p>}
        </div>
      )}
    </div>
  );
}

function PresupuestoFinal({ e, reformistaId, bloqueado, alEnviar }: { e: Encargo; reformistaId: string; bloqueado: boolean; alEnviar: () => void }) {
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
      {e.origen === "invitado" ? (
        <p className="text-xs text-violet-900">{e.desdeNoHomologado ? "Te ha invitado este cliente a homologarte: en esta primera obra no pagas nada, ni visita ni fee. Las siguientes obras de la app van con las condiciones normales." : "Cliente tuyo: te ha invitado él, así que en esta obra no hay reserva ni fee."}</p>
      ) : (
        <p className="text-xs text-stone-600">Reserva del cliente al firmar, que es el fee de la app: <b>{euros(reservaApp(cifra))}</b> ({TEXTO_RESERVA}). Se descuenta de lo que cobras.</p>
      )}
      {e.origen !== "invitado" && reservaApp(cifra) > (cifra * COMERCIALIZACION.pct) / 100 && (
        <p className="rounded-lg bg-amber-100 p-2 text-xs text-amber-900">
          ⚠ Obra pequeña: el fee mínimo es de {euros(COMERCIALIZACION.minimo)}, que en esta obra supone un {pctReserva(cifra).toLocaleString("es-ES", { maximumFractionDigits: 1 })} % del importe (en vez del {COMERCIALIZACION.pct} %). Puedes generar el contrato igualmente.
        </p>
      )}
      <Boton disabled={bloqueado} onClick={() => { enviarPresupuestoFinal(e.id, { importe: cifra, capitulos: capitulos(), plazoSemanas: plazo, notas }); alEnviar(); }}>
        {e.final ? "Actualizar presupuesto y contrato" : "Generar el contrato y enviárselo al cliente"}
      </Boton>
    </div>
  );
}

/** Puntos de visibilidad del reformista: los de su historial más lo que suma en la app (obras firmadas y clientes que trae). */
export function MisPuntos({ reformistaId, ficha }: { reformistaId: string; ficha?: Pick<FichaRed, "facturacionApp" | "valoraciones" | "clientesTraidos"> }) {
  const encargos = useEncargos().filter((e) => e.reformistaId === reformistaId);
  const facturadoNuevo = encargos.filter((e) => e.estado === "firmado" && e.final).reduce((s, e) => s + (e.final?.importe ?? 0), 0);
  const traidosNuevos = encargos.filter((e) => e.origen === "invitado").length;
  const p = puntosVisibilidad({
    facturacionApp: (ficha?.facturacionApp ?? 0) + facturadoNuevo,
    valoraciones: ficha?.valoraciones,
    clientesTraidos: (ficha?.clientesTraidos ?? 0) + traidosNuevos,
    intentosContacto: encargos.length ? intentosReformista(reformistaId) : 0,
  });
  const filas: [string, string, number][] = [
    ["💶", `Facturación en la app (${PUNTOS.porMilFacturado} por cada 1.000 € sin IVA)`, p.facturacion],
    ["⭐", "Valoraciones de tus clientes", p.valoraciones],
    ["🤝", `Clientes que traes o que te invitan (${PUNTOS.porClienteTraido} cada uno)`, p.clientes],
    ...(p.penalizacion ? [["🚫", `Intentos de compartir contactos antes de firmar (${PUNTOS.porIntentoContacto} cada uno)`, p.penalizacion] as [string, string, number]] : []),
  ];
  return (
    <Tarjeta className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold">Tus puntos de visibilidad</h2>
        <span className="font-display text-2xl font-semibold text-amber-700">{p.total.toLocaleString("es-ES")}</span>
      </div>
      <ul className="space-y-1 text-sm">
        {filas.map(([i, t, n]) => (
          <li key={t} className="flex justify-between gap-2"><span>{i} {t}</span><span className="font-medium">{n.toLocaleString("es-ES")}</span></li>
        ))}
      </ul>
      <p className="text-xs text-stone-500">{TEXTO_VISIBILIDAD} Las obras con clientes que traes tú o que te invitan no pagan visitas ni reserva.</p>
    </Tarjeta>
  );
}

/** Fotos de trabajos del reformista: las ve el cliente en su currículum, sin nombre ni contactos. */
export function MisFotosTrabajos({ reformistaId }: { reformistaId: string }) {
  const [fotos, setFotos] = useState<FotoTrabajo[]>([]);
  const [confirmo, setConfirmo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setFotos(fotosSubidas(reformistaId)), [reformistaId]);
  const guardar = (n: FotoTrabajo[]) => {
    if (guardarFotos(reformistaId, n)) { setFotos(n); setError(null); } else setError("No caben más fotos en esta demo: borra alguna.");
  };
  const subir = async (files: FileList | null) => {
    if (!files) return;
    const nuevas: FotoTrabajo[] = [];
    for (const f of [...files].slice(0, MAX_FOTOS - fotos.length)) {
      try { nuevas.push({ src: await reducirFoto(f), texto: "" }); } catch { setError("Alguna foto no se pudo leer."); }
    }
    guardar([...fotos, ...nuevas]);
  };
  return (
    <Tarjeta className="space-y-3">
      <div>
        <h2 className="font-semibold">Fotos de tus trabajos</h2>
        <p className="mt-1 text-sm text-stone-600">Salen en tu currículum cuando la app te propone a un cliente. Hasta {MAX_FOTOS} fotos.</p>
      </div>
      <ul className="list-disc space-y-0.5 rounded-lg bg-amber-50 p-3 pl-7 text-xs text-amber-950">
        <li>Solo interiores: nada donde se reconozca la dirección (fachadas, portales, números, vistas desde la ventana).</li>
        <li>Sin tu nombre, logo, rótulos, furgonetas rotuladas, teléfonos ni webs: tu ficha es anónima hasta que el cliente firma.</li>
        <li>Sin personas reconocibles ni datos de tus clientes.</li>
      </ul>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal-700" checked={confirmo} onChange={(e) => setConfirmo(e.target.checked)} />
        <span>Confirmo que mis fotos cumplen estas normas. Si alguna no las cumple, la app puede retirarla.</span>
      </label>
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {fotos.map((x, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.src.startsWith("/") ? publico(x.src) : x.src} alt={`Trabajo ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => guardar(fotos.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white" aria-label="Quitar foto">✕</button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
      {fotos.length < MAX_FOTOS && (
        <label className={`inline-block rounded-xl px-4 py-2 text-sm font-semibold ${confirmo ? "cursor-pointer bg-teal-700 text-white hover:bg-teal-800" : "cursor-not-allowed bg-stone-200 text-stone-400"}`}>
          ＋ Subir fotos
          <input type="file" accept="image/*" multiple disabled={!confirmo} className="sr-only" onChange={(e) => { subir(e.target.files); e.target.value = ""; }} />
        </label>
      )}
    </Tarjeta>
  );
}
