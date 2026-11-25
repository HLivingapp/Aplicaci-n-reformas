"use client";

import { AvisoMemoriaTecnica } from "./Beneficios";
import { useEffect, useState } from "react";
import { euros } from "@/lib/calc";
import {
  aplicarTarifa, AVISO_TARIFAS, LETRA_PEQUENA_TARIFAS, TEXTO_CITA_PROVEEDOR, PRECIO_CITA, estadisticasVenta, marcarResultado, marcarNoPresento, estadoNoPresento, creditosCita, HORAS_DESMENTIR, REGLA_FALTA_REFORMISTA, cancelarCitaReformista, desmentirReformistaNoVino, estadoReformistaNoVino, faltasReformista, vendido, importeVendido, descartarEncargo, ORIGEN_ENCARGO, enviarPresupuestoFinal, ESTADO_ENCARGO, fijarVisita, firmarReformista, guardarTarifa, IVA_REFORMA, referencia, tarifaDe, tarifaVacia, type Encargo,
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
import { conNube } from "@/lib/modo";
import { leerPresupuestoParaTarifa } from "@/lib/ia-nube";

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
          Con ellas la app calcula tu presupuesto para cada cliente de tu zona, partida a partida, y se lo enseña junto al de otros reformistas homologados. Tú no tienes que hacer nada más hasta que un cliente te escriba o te pida cita.
        </p>
        <p className="mt-2 rounded-lg bg-amber-100 p-2 text-sm font-semibold text-amber-950">💡 {AVISO_TARIFAS}.<span className="mt-0.5 block text-xs font-normal">{LETRA_PEQUENA_TARIFAS}</span></p>
      </div>
      {conNube && <LeerPresupuestoIA alLeer={(n) => { setT({ ...t, ...n }); setGuardado(false); }} />}
      {t.origen && <p className="rounded-lg bg-teal-50 p-2 text-xs text-teal-900">📑 Tienes precio propio en {t.origen.partidas} partidas, sacado de {t.origen.presupuestos} presupuestos tuyos. Los % de abajo se aplican al resto.</p>}
      <EditorTarifas valor={t} onChange={(n) => { setT({ ...t, ...n }); setGuardado(false); }} />
      <div className="flex items-center gap-3">
        <Boton onClick={() => { guardarTarifa(reformistaId, t); setGuardado(true); }}>Guardar mis tarifas</Boton>
        {guardado && <span className="text-sm text-emerald-700">✓ Guardadas. Los clientes ya ven tus precios.</span>}
      </div>
    </Tarjeta>
  );
}

/** Sube un presupuesto tuyo en PDF y la IA propone tus tarifas por capítulo (luego las revisas y guardas). */
function LeerPresupuestoIA({ alLeer }: { alLeer: (t: Pick<TarifaReformista, "general" | "capitulos">) => void }) {
  const [estado, setEstado] = useState<"inicio" | "leyendo" | "hecho">("inicio");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm">
      <p className="font-medium text-indigo-950">🤖 ¿Prefieres no rellenarlo a mano?</p>
      <p className="mt-0.5 text-indigo-900">Sube un presupuesto tuyo reciente en PDF y la IA calcula tus tarifas por capítulo comparándolas con la referencia. Después las revisas antes de guardar. Tapa antes los datos de tu cliente: el PDF no se guarda.</p>
      <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg bg-indigo-700 px-3 py-1.5 font-medium text-white hover:bg-indigo-800">
        {estado === "leyendo" ? "Leyendo el presupuesto…" : "Subir presupuesto (PDF)"}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={estado === "leyendo"}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setEstado("leyendo");
            setError(null);
            try {
              const r = await leerPresupuestoParaTarifa(f);
              alLeer(r.tarifa);
              setNotas(r.notas);
              setEstado("hecho");
            } catch (err) {
              setError(err instanceof Error ? err.message : "No se ha podido leer el presupuesto.");
              setEstado("inicio");
            }
          }}
        />
      </label>
      {estado === "hecho" && <p className="mt-2 text-indigo-950">✓ Tarifas propuestas abajo. {notas}</p>}
      {error && <p className="mt-2 text-red-700">{error}</p>}
    </div>
  );
}

/** Solicitudes de cita, chat, cita aceptada (150 €), resultado de venta y, si quieren, contrato estándar. */
/** faltanDocs: documentos que aún tiene que subir para poder generar contratos (p. ej. un proveedor invitado). */
export function MisEncargos({ reformistaId, faltanDocs = [] }: { reformistaId: string; faltanDocs?: string[] }) {
  const encargos = useEncargos().filter((e) => e.reformistaId === reformistaId);
  return (
    <Tarjeta className="space-y-3">
      <h2 className="font-semibold">Tus clientes y obras</h2>
      <EstadisticasVenta encargos={encargos} />
      {encargos.length > 0 && <p className="text-xs text-stone-500">Con los clientes de la app pagas {TEXTO_CITA_PROVEEDOR}. Chatear con ellos es gratis y no cobramos comisión sobre la obra. Los clientes que tú traes invitándote no te cuestan nada.</p>}
      {!encargos.length && <p className="text-sm text-stone-500">Todavía no te ha escrito nadie. Cuando un cliente te elija, te avisamos por email y WhatsApp y lo verás aquí con su vivienda y tu presupuesto calculado.</p>}
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
          {e.aviso && <div className="mt-1 text-xs text-stone-400">📧 Email y 💬 WhatsApp enviados el {new Date(e.aviso.email).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>}
        </div>
        <div className="flex flex-wrap gap-1">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ORIGEN_ENCARGO[e.origen ?? "app"].cls}`}>{ORIGEN_ENCARGO[e.origen ?? "app"].texto}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_ENCARGO[e.estado].cls}`}>{ESTADO_ENCARGO[e.estado].texto}</span>
        </div>
      </div>

      {e.origen !== "invitado" && <ChatEncargo e={e} parte="reformista" />}

      {e.estado === "visita_pedida" && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs text-stone-600">Día y hora de la cita<input type="datetime-local" className={`${inputCls} mt-1`} value={fecha} onChange={(x) => setFecha(x.target.value)} /></label>
          <input className={`${inputCls} min-w-40 flex-1`} placeholder="Nota para el cliente (opcional)" value={nota} onChange={(x) => setNota(x.target.value)} />
          <Boton onClick={() => fijarVisita(e.id, new Date(fecha).toISOString(), nota)} disabled={!fecha}>{e.origen === "invitado" || e.desdeNoHomologado ? "Aceptar la cita" : `Aceptar la cita y pagar ${PRECIO_CITA}`}</Boton>
          <button onClick={() => descartarEncargo(e.id)} className="text-xs text-stone-500 underline">No puedo</button>
          {e.origen !== "invitado" && !e.desdeNoHomologado && creditosCita(e.reformistaId) > 0 && <p className="w-full text-xs font-semibold text-emerald-800">🎟️ Tienes {creditosCita(e.reformistaId)} cita{creditosCita(e.reformistaId) > 1 ? "s" : ""} gratis por clientes que no se presentaron: esta no la pagas.</p>}
          {e.cancelaReformista && <p className="w-full text-xs text-stone-600">Avisaste de que no podías ir: «{e.cancelaReformista.motivo}». Propón otra fecha: no vuelves a pagar.</p>}
          {e.origen !== "invitado" && <p className="w-full rounded-lg bg-amber-50 p-2 text-xs text-amber-950">⚠️ {REGLA_FALTA_REFORMISTA}</p>}
          <p className="w-full text-xs text-stone-500">Es un cliente cualificado: ha pagado su acceso, ha visto tu ficha y tu precio y te ha pedido cita. La cita cuesta {PRECIO_CITA} al aceptarla, vendas o no. Antes puedes chatear gratis para resolver dudas. Demo: pago simulado.</p>
        </div>
      )}

      {e.estado === "visita_fijada" && (
        <div className="mt-3">
          <p className="text-xs text-stone-600">
            {e.visita.fecha
              ? `Cita el ${new Date(e.visita.fecha).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}${e.visita.pagoReformista && e.origen !== "invitado" && !e.desdeNoHomologado ? ` (cita pagada: ${PRECIO_CITA})` : ""}. Ya podéis compartir teléfono o email por el chat. Después de la visita, marca si has vendido: es para tus estadísticas.`
              : "Tu cliente te ha invitado a la app. Si queréis, mete aquí la cifra acordada y la app genera un contrato estándar."}
          </p>
          {e.origen !== "invitado" && <FaltasCita e={e} />}
          {e.origen !== "invitado" && !estadoReformistaNoVino(e) && <ResultadoVenta e={e} />}
          {!editando && <button className="mt-2 text-xs text-teal-700 underline" onClick={() => setEditando(true)}>Opcional: generar un contrato estándar con la cifra acordada</button>}
        </div>
      )}
      {(editando || e.estado === "presupuesto_final") && e.estado !== "firmado_cliente" && e.estado !== "firmado" && e.estado !== "descartado" && (
        <PresupuestoFinal e={e} reformistaId={reformistaId} bloqueado={bloqueado} alEnviar={() => setEditando(false)} />
      )}

      {e.cancelaCliente && <p className="mt-3 rounded-lg bg-stone-100 p-2 text-xs text-stone-700">El cliente canceló la cita avisando: «{e.cancelaCliente.motivo}». Recuperas la cita como crédito para la siguiente.</p>}
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
      <p className="text-xs text-emerald-800">Sin comisión: la app no cobra nada sobre esta obra.</p>
      <Boton disabled={bloqueado} onClick={() => { enviarPresupuestoFinal(e.id, { importe: cifra, capitulos: capitulos(), plazoSemanas: plazo, notas }); alEnviar(); }}>
        {e.final ? "Actualizar presupuesto y contrato" : "Generar el contrato y enviárselo al cliente"}
      </Boton>
    </div>
  );
}

const eur0 = (n: number) => `${Math.round(n).toLocaleString("es-ES", { useGrouping: true })} €`;
const fmtPct = (n: number | null) => (n === null ? "—" : `${n} %`);

/** Estadísticas de venta del reformista: lo que le rinden las citas que paga. */
export function EstadisticasVenta({ encargos }: { encargos: Encargo[] }) {
  const v = estadisticasVenta(encargos);
  const suspendido = encargos[0] ? faltasReformista(encargos[0].reformistaId).suspendidoHasta : undefined;
  const horas = v.horasRespuesta === null ? "—" : v.horasRespuesta < 1 ? "< 1 h" : `${Math.round(v.horasRespuesta)} h`;
  const fichas: { n: string; t: string; d?: string; fuerte?: boolean }[] = [
    { n: fmtPct(v.pctVendido), t: "de tus citas vendidas", d: `${v.ventas} de ${v.citas} citas`, fuerte: true },
    { n: v.costePorVenta === null ? "—" : eur0(v.costePorVenta), t: "coste por venta", d: `${eur0(v.gastado)} en citas` },
    { n: v.retorno === null ? "—" : `×${v.retorno.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`, t: "vendido por cada € en citas", d: `${eur0(v.facturado)} vendidos sin IVA` },
    { n: fmtPct(v.respuestaChat), t: "de chats respondidos", d: `respuesta media: ${horas}` },
    { n: String(v.solicitudes), t: "solicitudes recibidas", d: v.noShow ? `${v.noShow} cliente${v.noShow > 1 ? "s" : ""} no se present${v.noShow > 1 ? "aron" : "ó"}` : undefined },
    { n: fmtPct(v.aceptacion), t: "de solicitudes con cita", d: `${v.citas} citas aceptadas` },
  ];
  return (
    <div className="rounded-2xl bg-stone-900 p-4 text-white" data-estadisticas>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">📊 Tus estadísticas de venta</h3>
        {v.pctVendido !== null && <span className="text-sm text-stone-300">Llevas vendido el <b className="text-amber-300">{v.pctVendido} %</b> de tus citas</span>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {fichas.map((f) => (
          <div key={f.t} className={`rounded-xl p-3 ${f.fuerte ? "bg-amber-400 text-stone-900" : "bg-white/10"}`}>
            <div className="font-display text-2xl font-semibold">{f.n}</div>
            <div className={`text-xs ${f.fuerte ? "text-stone-800" : "text-stone-300"}`}>{f.t}</div>
            {f.d && <div className={`mt-0.5 text-[11px] ${f.fuerte ? "text-stone-700" : "text-stone-400"}`}>{f.d}</div>}
          </div>
        ))}
      </div>
      {v.faltas > 0 && <p className="mt-2 text-xs text-red-300">⚠ {v.faltas} falta{v.faltas > 1 ? "s" : ""} a citas sin avisar.{suspendido ? ` Suspendido hasta el ${new Date(suspendido).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}: no recibes clientes nuevos.` : ""}</p>}
      {v.pendientes > 0 && <p className="mt-2 text-xs text-amber-200">Tienes {v.pendientes} cita{v.pendientes > 1 ? "s" : ""} sin marcar si vendiste. Márcalas abajo para que tus números sean reales.</p>}
      <p className="mt-2 text-[11px] text-stone-400">Las ventas las marcas tú tras cada cita (la obra se contrata fuera de la app). Responder rápido en el chat sube tus opciones de que te pidan cita. Cada cita: {PRECIO_CITA}.</p>
    </div>
  );
}

/** Avisar de que no puedes ir, o responder si el cliente dice que no fuiste. */
function FaltasCita({ e }: { e: Encargo }) {
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const rnv = estadoReformistaNoVino(e);
  if (rnv === "pendiente")
    return (
      <div className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-900">
        El cliente dice que no fuiste a la cita. Si no es así, respóndelo en {HORAS_DESMENTIR} h; si no, cuenta como falta: pierdes la cita sin crédito, sale un aviso en tu ficha y restas puntos.{" "}
        <button onClick={() => desmentirReformistaNoVino(e.id)} className="font-semibold underline">Sí que fui</button>
      </div>
    );
  if (rnv === "confirmada") return <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-900">Falta sin avisar: perdiste la cita sin crédito y sale un aviso en tu ficha durante 90 días.</p>;
  if (estadoNoPresento(e) || e.resultado) return null;
  return cancelando ? (
    <div className="mt-2 flex flex-wrap gap-2 text-xs">
      <input className={`${inputCls} min-w-0 flex-1`} placeholder="Motivo (lo verá el cliente)" value={motivo} onChange={(x) => setMotivo(x.target.value)} />
      <button disabled={!motivo.trim()} onClick={() => cancelarCitaReformista(e.id, motivo.trim())} className="rounded-lg bg-stone-900 px-3 py-2 font-semibold text-white disabled:opacity-40">Avisar al cliente</button>
    </div>
  ) : (
    <button onClick={() => setCancelando(true)} className="mt-2 text-xs text-stone-600 underline">No puedo ir: avisar al cliente y cambiar la fecha</button>
  );
}

/** Tras la cita: ¿vendiste? */
function ResultadoVenta({ e }: { e: Encargo }) {
  const [importe, setImporte] = useState("");
  const [abierto, setAbierto] = useState(false);
  const ns = estadoNoPresento(e);
  if (ns === "pendiente") return <p className="mt-2 rounded-lg bg-stone-100 p-2 text-xs text-stone-700">🚪 Has marcado que el cliente no se presentó. Si no lo desmiente en {HORAS_DESMENTIR} h, recibes una cita gratis ({PRECIO_CITA} de crédito).</p>;
  if (ns === "credito") return <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-900">🎟️ El cliente no se presentó: te hemos devuelto la cita como crédito de {PRECIO_CITA} para la siguiente.</p>;
  if (e.resultado)
    return (
      <p className={`mt-2 rounded-lg p-2 text-xs ${e.resultado.vendido ? "bg-emerald-50 text-emerald-900" : "bg-stone-100 text-stone-600"}`}>
        {e.resultado.vendido ? `✓ Vendida${e.resultado.importe ? ` por ${eur0(e.resultado.importe)} sin IVA` : ""}` : "No vendida"} ·{" "}
        <button className="underline" onClick={() => marcarResultado(e.id, !e.resultado!.vendido)}>cambiar</button>
      </p>
    );
  return (
    <div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-950" data-resultado>
      <div className="font-semibold">¿Has vendido esta obra?</div>
      {abierto ? (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <input type="number" inputMode="decimal" className={`${inputCls} w-40`} placeholder="Importe sin IVA (opcional)" value={importe} onChange={(x) => setImporte(x.target.value)} />
          <Boton onClick={() => marcarResultado(e.id, true, Number(importe) || undefined)}>Guardar venta</Boton>
        </div>
      ) : (
        <div className="mt-1 flex gap-2">
          <button onClick={() => setAbierto(true)} className="rounded-lg bg-emerald-700 px-3 py-1.5 font-semibold text-white">Sí, vendida</button>
          <button onClick={() => marcarResultado(e.id, false)} className="rounded-lg border border-stone-300 px-3 py-1.5 font-semibold">No</button>
          {e.visita.pagoReformista && !e.desdeNoHomologado && ns !== "desmentido" && <button onClick={() => marcarNoPresento(e.id)} className="ml-auto text-stone-600 underline">El cliente no se presentó</button>}
        </div>
      )}
    </div>
  );
}

/** Puntos de visibilidad del reformista: los de su historial más lo que suma en la app (ventas y clientes que trae). */
export function MisPuntos({ reformistaId, ficha }: { reformistaId: string; ficha?: Pick<FichaRed, "facturacionApp" | "valoraciones" | "clientesTraidos"> }) {
  const encargos = useEncargos().filter((e) => e.reformistaId === reformistaId);
  const facturadoNuevo = encargos.filter(vendido).reduce((s, e) => s + importeVendido(e), 0);
  const traidosNuevos = encargos.filter((e) => e.origen === "invitado").length;
  const p = puntosVisibilidad({
    facturacionApp: (ficha?.facturacionApp ?? 0) + facturadoNuevo,
    valoraciones: ficha?.valoraciones,
    clientesTraidos: (ficha?.clientesTraidos ?? 0) + traidosNuevos,
    intentosContacto: encargos.length ? intentosReformista(reformistaId) : 0,
    faltas: faltasReformista(reformistaId).faltas,
  });
  const filas: [string, string, number][] = [
    ["💶", `Ventas a clientes de la app (${PUNTOS.porMilFacturado} por cada 1.000 € sin IVA)`, p.facturacion],
    ["⭐", "Valoraciones de tus clientes", p.valoraciones],
    ["🤝", `Clientes que traes o que te invitan (${PUNTOS.porClienteTraido} cada uno)`, p.clientes],
    ...(p.penalizacion ? [["🚫", `Intentos de compartir contactos antes de aceptar la cita (${PUNTOS.porIntentoContacto}) y faltas a citas sin avisar (${PUNTOS.porFalta})`, p.penalizacion] as [string, string, number]] : []),
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
      <p className="text-xs text-stone-500">{TEXTO_VISIBILIDAD} Los clientes que traes tú o que te invitan no pagan cita.</p>
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
        <li>Sin tu nombre, logo, rótulos, furgonetas rotuladas, teléfonos ni webs: tu ficha es anónima hasta que aceptas la cita.</li>
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
