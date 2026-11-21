"use client";
import { TEXTO_COMERCIALIZADORA } from "@/lib/legal";

import { AvisoMemoriaTecnica } from "./Beneficios";
import { InvitaClientes } from "./InvitaClientes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { euros } from "@/lib/calc";
import { COMERCIALIZACION, pctReserva, reservaApp, TEXTO_RESERVA } from "@/lib/comercializacion";
import { alCambiar } from "@/lib/encargos";
import {
  descartarEncargoEstudio, enviarPropuesta, ESTADO_ESTUDIO, firmarPropuestaCliente, firmarPropuestaEstudio, guardarTarifaEstudio, leerEncargosEstudio, leerEstudios, precioServicio, SERVICIOS, solicitarEstudio,
  type EncargoEstudio, type Estudio, type Servicio, type TarifaEstudio,
} from "@/lib/estudios";
import { incluye, useSuscripcion } from "@/lib/suscripcion";
import { Muro } from "./Muro";
import { Boton, inputCls, Tarjeta } from "./ui";

const IVA = 21;
const conIva = (n: number) => n * (1 + IVA / 100);

function useDatosEstudios() {
  const [estudios, setEstudios] = useState<Estudio[]>([]);
  const [encargos, setEncargos] = useState<EncargoEstudio[]>([]);
  useEffect(() => {
    const leer = () => { setEstudios(leerEstudios()); setEncargos(leerEncargosEstudio()); };
    leer();
    return alCambiar(leer);
  }, []);
  return { estudios, encargos };
}

/** Para el cliente: el precio de cada estudio para su proyecto, licencia o legalización, y la propuesta para firmar. */
export function ServiciosArquitectura({ proyectoId, token, cliente, zona, m2 }: { proyectoId: string; token: string; cliente: string; zona: string; m2: number }) {
  const s = useSuscripcion();
  const suscrito = s ? incluye(s.plan, "basico") : false;
  const { estudios, encargos } = useDatosEstudios();
  const [servicio, setServicio] = useState<Servicio>("declaracion");
  const [nota, setNota] = useState("");
  const mios = encargos.filter((e) => e.proyectoId === proyectoId);
  const lista = estudios
    .map((e) => ({ e, precio: precioServicio(e.tarifa, servicio, m2) }))
    .filter((x): x is { e: Estudio; precio: number } => x.precio !== null)
    .sort((a, b) => a.precio - b.precio);
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">¿Necesitas arquitecto?</h2>
        <p className="text-sm text-stone-600">Proyecto, licencia, declaración responsable o legalización: estudios y arquitectos homologados han cargado sus precios. Elige el servicio y compara.</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SERVICIOS.map((x) => (
          <button key={x.id} onClick={() => setServicio(x.id)} className={`rounded-full px-3 py-1.5 text-sm ${servicio === x.id ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>{x.texto}</button>
        ))}
      </div>
      <p className="text-xs text-stone-500">{SERVICIOS.find((x) => x.id === servicio)?.detalle} Precio calculado para {m2} m².</p>
      {!suscrito && <Muro plan="basico" volver={`/p/${token}`} titulo="Compara estudios de arquitectura">Con el plan Básico ves quién es cada estudio, su precio para tu casa, y le pides la propuesta.</Muro>}
      {mios.filter((x) => x.origen === "invitado").map((enc) => (
        <div key={enc.id} className="space-y-2 rounded-2xl border border-violet-200 bg-violet-50/60 p-4 text-sm">
          <div className="font-semibold">Tu arquitecto {enc.codigo} · {SERVICIOS.find((x) => x.id === enc.servicio)?.texto}</div>
          <p className="text-xs text-stone-600">Te ha invitado él a la app: sin reserva. <span className={`ml-1 rounded-full px-2 py-0.5 font-medium ${ESTADO_ESTUDIO[enc.estado].cls}`}>{ESTADO_ESTUDIO[enc.estado].texto}</span></p>
          {enc.propuesta && <PropuestaEstudio e={enc} parte="cliente" />}
        </div>
      ))}
      <ul className="space-y-2">
        {lista.map(({ e, precio }) => {
          const enc = mios.find((x) => x.estudioId === e.id && x.servicio === servicio && x.estado !== "descartado" && x.origen !== "invitado");
          return (
            <li key={e.id} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{suscrito ? `${e.tipo === "estudio" ? "Estudio" : "Arquitecto/a"} ${e.codigo}` : "Arquitecto homologado"}</div>
                  <div className="text-xs text-stone-500">{e.colegio} · {e.encargosEnApp} encargos en la app{e.valoracion ? ` · ★ ${e.valoracion.media.toLocaleString("es-ES")}` : ""}{suscrito ? ` · ${e.zonas.slice(0, 2).join(", ")}` : ""}</div>
                  {suscrito && <p className="mt-1 text-sm text-stone-600">{e.presentacion}</p>}
                </div>
                <div className="sm:text-right">
                  <div className={`font-display text-xl font-semibold ${suscrito ? "" : "select-none blur-sm"}`}>{euros(conIva(precio))}</div>
                  <div className="text-xs text-stone-500">con IVA ({IVA} %)</div>
                </div>
              </div>
              {suscrito && !enc && (
                <button onClick={() => solicitarEstudio(e, { servicio, proyectoId, cliente, zona, m2, nota })} className="mt-3 rounded-full border border-teal-700 px-3 py-1.5 text-sm font-medium text-teal-800 hover:bg-teal-50">Pedir propuesta</button>
              )}
              {enc && (
                <div className="mt-3 space-y-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_ESTUDIO[enc.estado].cls}`}>{enc.firmas?.cliente && enc.estado === "propuesta" ? "Firmado por ti" : ESTADO_ESTUDIO[enc.estado].texto}</span>
                  {enc.propuesta && <PropuestaEstudio e={enc} parte="cliente" />}
                </div>
              )}
              {e.id.startsWith("ej-") && suscrito && <Link href={`/arquitectos/demo?e=${e.id}`} className="mt-2 block text-right text-xs text-stone-400 underline">Demo: verlo como el estudio</Link>}
            </li>
          );
        })}
      </ul>
      {suscrito && <input className={inputCls} placeholder="Nota para el estudio al pedir propuesta (opcional): qué quieres hacer, plazos…" value={nota} onChange={(x) => setNota(x.target.value)} />}
    </section>
  );
}

/** Propuesta del estudio con las condiciones del contrato y la firma de cada parte. */
function PropuestaEstudio({ e, parte }: { e: EncargoEstudio; parte: "cliente" | "estudio" }) {
  const p = e.propuesta!;
  const invitado = e.origen === "invitado";
  const reserva = invitado ? 0 : reservaApp(p.importe);
  const minimo = !invitado && reserva > (p.importe * COMERCIALIZACION.pct) / 100;
  const servicio = SERVICIOS.find((x) => x.id === e.servicio)!;
  const puedeFirmar = parte === "cliente" ? !e.firmas?.cliente && e.estado === "propuesta" : !!e.firmas?.cliente && !e.firmas?.estudio;
  return (
    <div className="space-y-2 rounded-xl bg-stone-50 p-3 text-sm">
      <div className="font-medium">Contrato de servicios de arquitectura · {servicio.texto}</div>
      <p className="text-xs text-stone-500">{TEXTO_COMERCIALIZADORA}</p>
      <ul className="space-y-1 text-stone-700">
        <li><b>Honorarios:</b> {euros(p.importe)} + IVA ({IVA} %) = {euros(conIva(p.importe))}</li>
        <li><b>Plazo:</b> {p.plazoSemanas} semanas</li>
        <li><b>Alcance:</b> {p.alcance || servicio.detalle}</li>
        <li><b>Pagos:</b> {invitado ? "cliente invitado por el arquitecto: sin reserva en la app; los honorarios se pagan directamente al arquitecto." : <>al firmar, reserva en la app de {euros(reserva)} ({TEXTO_RESERVA}), que se descuenta de los honorarios; el resto, directamente al arquitecto a la entrega.</>}</li>
      </ul>
      {parte === "estudio" && invitado && <p className="rounded-lg bg-violet-50 p-2 text-xs text-violet-900">Cliente tuyo: le invitaste tú, así que en este encargo no pagas fee.</p>}
      {parte === "estudio" && !invitado && (
        <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          Fee de comercialización: la reserva del cliente, {euros(reserva)}. Se descuenta de lo que cobras.
          {minimo && <b> Ojo: en este encargo se aplica el mínimo de {euros(COMERCIALIZACION.minimo)}, un {pctReserva(p.importe).toLocaleString("es-ES", { maximumFractionDigits: 1 })} % de los honorarios.</b>}
        </p>
      )}
      <div className="grid gap-1 text-xs text-stone-500 sm:grid-cols-2">
        <span>Cliente: {e.firmas?.cliente ? "✅ firmado" : "pendiente"}</span>
        <span>Arquitecto: {e.firmas?.estudio ? "✅ firmado" : "pendiente"}</span>
      </div>
      {puedeFirmar && (
        <button onClick={() => (parte === "cliente" ? firmarPropuestaCliente(e.id) : firmarPropuestaEstudio(e.id))} className="w-full rounded-xl bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800">
          Firmar el contrato en la app
        </button>
      )}
      <p className="text-xs text-stone-400">Modelo de contrato pendiente de revisión legal. En la demostración la firma es simulada.</p>
    </div>
  );
}

/** Área del estudio: tarifas por servicio y encargos recibidos. */
export function AreaEstudio({ estudioId }: { estudioId: string }) {
  const { estudios, encargos } = useDatosEstudios();
  const est = estudios.find((x) => x.id === estudioId);
  const [t, setT] = useState<TarifaEstudio | null>(null);
  const [ok, setOk] = useState(false);
  useEffect(() => { if (est && !t) setT(est.tarifa); }, [est, t]);
  if (!est || !t) return <p className="text-sm text-stone-500">Cargando…</p>;
  const mios = encargos.filter((e) => e.estudioId === estudioId);
  const poner = (s: Servicio, campo: "fijo" | "porM2", v: string) => {
    const actual = t[s] ?? { fijo: 0, porM2: 0 };
    setT({ ...t, [s]: { ...actual, [campo]: Math.max(0, Number(v)) } });
    setOk(false);
  };
  return (
    <div className="space-y-4">
      <InvitaClientes tipo="estudio" id={est.id} codigo={est.codigo} />
      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">Encargos de clientes</h2>
        {!mios.length && <p className="text-sm text-stone-500">Todavía no te ha pedido propuesta nadie. Cuando un cliente te elija, lo verás aquí con su vivienda y tu precio calculado.</p>}
        {mios.map((e) => <EncargoEstudioFila key={e.id} e={e} />)}
        <AvisoMemoriaTecnica />
      </Tarjeta>
      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">Tus precios</h2>
        <p className="text-sm text-stone-600">Una parte fija y otra por m² de vivienda, sin IVA. Con ellos la app calcula tu precio para cada cliente. Deja en blanco lo que no ofreces.</p>
        {SERVICIOS.map((s) => (
          <div key={s.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm">
            <span>{s.texto}</span>
            <label className="text-xs text-stone-500">Fijo €<input type="number" className={`${inputCls} w-24 py-1`} value={t[s.id]?.fijo ?? ""} onChange={(x) => poner(s.id, "fijo", x.target.value)} /></label>
            <label className="text-xs text-stone-500">€/m²<input type="number" step={0.5} className={`${inputCls} w-20 py-1`} value={t[s.id]?.porM2 ?? ""} onChange={(x) => poner(s.id, "porM2", x.target.value)} /></label>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Boton onClick={() => { guardarTarifaEstudio(estudioId, t); setOk(true); }}>Guardar mis precios</Boton>
          {ok && <span className="text-sm text-emerald-700">✓ Guardados</span>}
        </div>
      </Tarjeta>
    </div>
  );
}

function EncargoEstudioFila({ e }: { e: EncargoEstudio }) {
  const [importe, setImporte] = useState(String(e.propuesta?.importe ?? e.precioCalculado));
  const [plazo, setPlazo] = useState(e.propuesta?.plazoSemanas ?? 4);
  const [alcance, setAlcance] = useState(e.propuesta?.alcance ?? "");
  const servicio = SERVICIOS.find((x) => x.id === e.servicio)!;
  const cifra = Number(importe) || 0;
  return (
    <div className="rounded-xl border border-stone-200 p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-medium">{e.cliente} · {e.zona} · {servicio.texto}</div>
          <div className="text-xs text-stone-500">{e.m2} m² · tu precio calculado {euros(e.precioCalculado)} sin IVA</div>
          {e.nota && <div className="mt-1 text-xs text-stone-600">Nota: {e.nota}</div>}
        </div>
        <div className="flex flex-wrap gap-1">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${e.origen === "invitado" ? "bg-violet-50 text-violet-800 ring-1 ring-violet-200" : "bg-teal-50 text-teal-800 ring-1 ring-teal-200"}`}>{e.origen === "invitado" ? "Cliente tuyo (le invitaste)" : "Cliente de la app"}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_ESTUDIO[e.estado].cls}`}>{ESTADO_ESTUDIO[e.estado].texto}</span>
        </div>
      </div>
      {(e.estado === "solicitado" || (e.estado === "propuesta" && !e.firmas?.cliente)) && (
        <div className="mt-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-stone-600">Honorarios sin IVA<input type="number" className={`${inputCls} mt-1`} value={importe} onChange={(x) => setImporte(x.target.value)} /></label>
            <label className="text-xs text-stone-600">Plazo (semanas)<input type="number" min={1} className={`${inputCls} mt-1`} value={plazo} onChange={(x) => setPlazo(Math.max(1, Number(x.target.value)))} /></label>
          </div>
          <textarea rows={2} className={inputCls} placeholder={`Alcance (por defecto: ${servicio.detalle})`} value={alcance} onChange={(x) => setAlcance(x.target.value)} />
          {e.origen !== "invitado" && cifra > 0 && reservaApp(cifra) > (cifra * COMERCIALIZACION.pct) / 100 && (
            <p className="rounded-lg bg-amber-100 p-2 text-xs text-amber-900">⚠ Encargo pequeño: el fee mínimo es de {euros(COMERCIALIZACION.minimo)}, un {pctReserva(cifra).toLocaleString("es-ES", { maximumFractionDigits: 1 })} % de los honorarios. Puedes enviar la propuesta igualmente.</p>
          )}
          <div className="flex gap-2">
            <Boton disabled={!cifra} onClick={() => enviarPropuesta(e.id, { importe: cifra, plazoSemanas: plazo, alcance })}>{e.propuesta ? "Actualizar propuesta" : "Enviar propuesta y contrato"}</Boton>
            {e.estado === "solicitado" && <button onClick={() => descartarEncargoEstudio(e.id)} className="text-xs text-stone-500 underline">No puedo</button>}
          </div>
        </div>
      )}
      {e.propuesta && e.estado !== "descartado" && <div className="mt-3"><PropuestaEstudio e={e} parte="estudio" /></div>}
    </div>
  );
}
