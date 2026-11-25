"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { euros, eurosRedondo } from "@/lib/calc";
import { alCambiar, esInvitado, ESTADO_ENCARGO, invitarProveedor, leerInvitaciones, type Invitacion, intentosReformista, COBRO, PRECIO_ACCESO, firmarCliente, estadoNoPresento, desmentirNoPresento, HORAS_DESMENTIR, faltasReformista, REGLA_FALTA_CLIENTE, cancelarCitaCliente, marcarReformistaNoVino, estadoReformistaNoVino, IVA_REFORMA, leerEncargos, ofertas, pedirVisitas, referencia, type Encargo, type OfertaRed } from "@/lib/encargos";
import { conBaseDeDatos } from "@/lib/modo";
import { FICHAS_EJEMPLO, fichasRed, soloComunidades, type FichaRed } from "@/lib/red";
import { leerLocal } from "@/lib/store";
import { GarantiaAcceso, PagoAcceso, useAcceso } from "./PagoAcceso";
import type { DatosReforma, Vivienda } from "@/lib/types";
import { ContratoEncargo } from "./ContratoEncargo";
import { SeguimientoEncargo } from "./SeguimientoEncargo";
import { SimuladorHipoteca } from "./SimuladorHipoteca";
import { ServiciosContratables } from "./SeguroPromotor";
import { inputCls } from "./ui";
import { cercania, mejoresPara, PUNTOS, puntosVisibilidad } from "@/lib/visibilidad";
import { CurriculumReformista } from "./CurriculumReformista";
import { ChatEncargo } from "./ChatEncargo";
import { NoHomologados } from "./NoHomologados";

const conServidor = conBaseDeDatos && process.env.NEXT_PUBLIC_ESTATICA !== "1";

/** Reformistas homologados de la red: los de la base de datos y, en la demo, los de ejemplo. */
export function useFichasRed() {
  const [fichas, setFichas] = useState<FichaRed[] | null>(null);
  useEffect(() => {
    if (conServidor) {
      fetch("/api/red", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => setFichas(j.fichas ?? []))
        .catch(() => setFichas([]));
    } else {
      setFichas([...fichasRed(leerLocal().proveedores).map((f) => ({ ...f, obrasEnApp: 1 })), ...FICHAS_EJEMPLO].filter((f) => !soloComunidades(f)));
    }
  }, []);
  return fichas;
}

export function useEncargos() {
  const [lista, setLista] = useState<Encargo[]>([]);
  useEffect(() => {
    const leer = () => setLista(leerEncargos());
    leer();
    return alCambiar(leer);
  }, []);
  return lista;
}

const media = (f: FichaRed) => (f.valoraciones?.length ? f.valoraciones.reduce((s, v) => s + v.media, 0) / f.valoraciones.length : null);
const conIva = (n: number) => n * (1 + IVA_REFORMA / 100);

interface Props {
  proyectoId: string;
  token: string;
  cliente: string;
  vivienda: Vivienda;
  reforma: DatosReforma;
}

/** El presupuesto de cada reformista homologado para esta casa, calculado con sus tarifas. */
export function ComparativaRed({ proyectoId, token, cliente, vivienda, reforma }: Props) {
  const fichas = useFichasRed();
  const encargos = useEncargos().filter((e) => e.proyectoId === proyectoId);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [preferencia, setPreferencia] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [verMas, setVerMas] = useState(false);
  // Ven fichas, tarifas, chat y cita quienes han pagado el acceso único de 29,90 €
  const suscrito = useAcceso();
  const ref = useMemo(() => referencia(vivienda, reforma), [vivienda, reforma]);
  const municipio = vivienda.direccion.municipio || "Madrid";
  const cp = vivienda.direccion.codigoPostal ?? "";
  // La app propone los 3 reformistas con mejor encaje (cercanía + puntos de visibilidad); se mantienen los que ya tienen encargo.
  const lista = useMemo(() => {
    if (!fichas) return [];
    // Los reformistas suspendidos por faltar a citas no reciben clientes nuevos (sí siguen los que ya tienen encargo)
    const todas = ofertas(vivienda, reforma, fichas.map((f) => ({ ...f, intentosContacto: intentosReformista(f.id), faltas: faltasReformista(f.id).faltas }))).filter(
      (o) => !faltasReformista(o.ficha.id).suspendidoHasta || encargos.some((e) => e.reformistaId === o.ficha.id),
    );
    const top = mejoresPara(todas, municipio, cp, verMas ? COBRO.maxCitas : PUNTOS.propuestos);
    const conEncargo = todas.filter((o) => !top.includes(o) && encargos.some((e) => e.reformistaId === o.ficha.id));
    return [...top, ...conEncargo].sort((a, b) => a.e.base - b.e.base);
  }, [fichas, vivienda, reforma, municipio, cp, encargos, verMas]);
  // Lo que ve gratis cualquier cliente: cuántos proveedores trabajan en su zona y el presupuesto medio con sus tarifas
  const zona = useMemo(() => {
    if (!fichas) return { n: 0, media: 0 };
    const enZona = ofertas(vivienda, reforma, fichas).filter((o) => cercania(o.ficha, municipio, cp).puntos > 0);
    return { n: enZona.length, media: enZona.length ? enZona.reduce((t, o) => t + conIva(o.e.base), 0) / enZona.length : 0 };
  }, [fichas, vivienda, reforma, municipio, cp]);
  const firmado = encargos.find((e) => e.estado === "firmado" || e.estado === "firmado_cliente");

  if (!fichas) return null;
  const datos = { proyectoId, tokenCliente: token, cliente, zona: vivienda.direccion.municipio || "Madrid", vivienda, reforma };

  const encargoDe = (id: string) => encargos.find((e) => e.reformistaId === id);
  const pedidas = encargos.filter((e) => e.origen !== "invitado").length;
  const quedan = Math.max(0, COBRO.maxCitas - pedidas);
  const alternar = (id: string) => setElegidos((x) => (x.includes(id) ? x.filter((y) => y !== id) : x.length >= quedan ? x : [...x, id]));
  const pedir = () => {
    pedirVisitas(lista.filter((o) => elegidos.includes(o.ficha.id)), datos, preferencia);
    setElegidos([]);
  };

  return (
    <section id="reformistas" className="scroll-mt-4 space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Los reformistas de tu zona y su precio para tu casa</h2>
        <p className="text-sm text-stone-600">
          Cada reformista homologado ha cargado sus tarifas en la app, así que su presupuesto para tu casa sale al momento. Gratis ves cuántos hay en tu zona y el presupuesto medio. Con el acceso
          único de {PRECIO_ACCESO} ves la ficha y el precio de cada uno, chateas con ellos y les pides cita en tu casa. Después contratas directamente con quien elijas: la app no cobra nada sobre la obra.
        </p>
      </div>
      {zona.n > 0 && (
        <div className="grid grid-cols-2 gap-2" data-zona>
          <div className="rounded-2xl bg-stone-900 p-4 text-white">
            <div className="font-display text-3xl font-semibold">{zona.n}</div>
            <div className="text-xs text-stone-300">reformistas homologados trabajan en {municipio}</div>
          </div>
          <div className="rounded-2xl bg-teal-700 p-4 text-white">
            <div className="font-display text-3xl font-semibold">{eurosRedondo(zona.media)}</div>
            <div className="text-xs text-teal-100">presupuesto medio de tu reforma con sus tarifas (IVA incluido)</div>
          </div>
        </div>
      )}
      {lista.length > 0 && suscrito && (
        <p className="rounded-xl bg-teal-50 p-3 text-xs text-teal-900">
          🎯 Te proponemos los {PUNTOS.propuestos} reformistas homologados con mejor encaje para tu casa: que trabajan en tu zona y tienen más puntos de visibilidad (obras vendidas a clientes de la app y valoraciones).
          {!verMas && (
            <> Puedes pedir cita a {COBRO.maxCitas}. <button type="button" onClick={() => setVerMas(true)} className="font-semibold underline">Ver {COBRO.maxCitas - PUNTOS.propuestos} más</button></>
          )}
          {pedidas > 0 && <> Te quedan {quedan} de {COBRO.maxCitas} citas.</>}
        </p>
      )}
      {!lista.length && <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">Todavía no hay reformistas homologados con tarifas en tu zona.</p>}
      {!suscrito && lista.length > 0 && <PagoAcceso />}
      {suscrito && <GarantiaAcceso />}
      <ul className="space-y-2">
        {lista.map((o) => (
          <Oferta
            key={o.ficha.id}
            o={o}
            refBase={ref.base}
            suscrito={suscrito}
            encargo={encargoDe(o.ficha.id)}
            municipio={municipio}
            cp={cp}
            elegido={elegidos.includes(o.ficha.id)}
            bloqueado={!!firmado}
            alElegir={() => alternar(o.ficha.id)}
            abierto={abierto === o.ficha.id}
            alAbrir={() => setAbierto(abierto === o.ficha.id ? null : o.ficha.id)}
          />
        ))}
      </ul>
      {suscrito && elegidos.length > 0 && (
        <div className="sticky bottom-20 rounded-2xl border border-teal-600 bg-white p-4 shadow-lg">
          <div className="font-semibold">Pedir cita a {elegidos.length} reformista{elegidos.length > 1 ? "s" : ""}</div>
          <p className="text-xs text-stone-500">Les avisamos al momento por email y WhatsApp. Podéis chatear aquí y, cuando acepten la cita, vendrán a ver tu casa, medir y ajustar el presupuesto.</p>
          <input className={`${inputCls} mt-2`} placeholder="¿Cuándo te viene bien? (p. ej. tardes entre semana)" value={preferencia} onChange={(e) => setPreferencia(e.target.value)} />
          <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-900">✓ Ya tienes el acceso: pedir cita no te cuesta nada más.</p>
          <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-950">⚠️ {REGLA_FALTA_CLIENTE}</p>
          <button onClick={pedir} className="mt-2 w-full rounded-xl bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800">Avisar y pedir cita</button>
        </div>
      )}
      {!firmado && <NoHomologados zona={datos.zona} datos={datos} />}
      <InvitaProveedor datos={datos} invitados={encargos.filter(esInvitado)} bloqueado={!!firmado} />
      {encargos.filter((e) => e.final && e.estado !== "descartado").map((e) => (
        <div key={e.id}>
          <h3 className="mb-2 font-semibold">Contrato con {esInvitado(e) ? "tu reformista" : "el reformista"} {e.codigo}</h3>
          {e.estado === "firmado" && <div className="mb-3"><SeguimientoEncargo e={e} parte="cliente" /></div>}
          <ContratoEncargo e={e} parte="cliente" alFirmar={() => firmarCliente(e.id)} />
        </div>
      ))}
      <SimuladorHipoteca importe={conIva(ref.base)} />
      <ServiciosContratables proyectoId={proyectoId} />
    </section>
  );
}

function Oferta({ o, refBase, suscrito, encargo, municipio, cp, elegido, bloqueado, alElegir, abierto, alAbrir }: {
  o: OfertaRed; refBase: number; municipio: string; cp: string; suscrito: boolean; encargo?: Encargo; elegido: boolean; bloqueado: boolean; alElegir: () => void; abierto: boolean; alAbrir: () => void;
}) {
  const f = o.ficha;
  const [cv, setCv] = useState(false);
  const dif = refBase ? Math.round(((o.e.base - refBase) / refBase) * 100) : 0;
  const m = media(f);
  const capitulos = [...new Set(o.e.lineas.map((l) => l.capitulo))].map((c) => ({ c, importe: o.e.lineas.filter((l) => l.capitulo === c).reduce((s, l) => s + l.cantidad * l.precio, 0) }));
  const faltas = faltasReformista(f.id).faltas;
  return (
    <li className={`rounded-2xl border bg-white p-4 ${elegido ? "border-teal-600 ring-2 ring-teal-100" : "border-stone-200"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{suscrito ? `Reformista ${f.codigo}` : "Reformista homologado"}</div>
          <div className="text-xs text-stone-500">
            {suscrito ? `${f.zonas.slice(0, 2).join(", ")} · ` : ""}{f.obrasEnApp} obras en la app{m ? ` · ★ ${m.toLocaleString("es-ES", { maximumFractionDigits: 1 })}` : ""}
          </div>
          <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-800 ring-1 ring-teal-200">📍 {cercania(f, municipio, cp).texto}</span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-900 ring-1 ring-amber-200">⭐ {puntosVisibilidad({ ...f, faltas }).total.toLocaleString("es-ES")} puntos de visibilidad</span>
            {faltas > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-800 ring-1 ring-red-200">⚠ Faltó a {faltas} cita{faltas > 1 ? "s" : ""} sin avisar (últimos 90 días)</span>}
          </div>
        </div>
        <div className="sm:text-right">
          <div className={`font-display text-2xl font-semibold tracking-tight ${suscrito ? "" : "blur-sm select-none"}`}>{eurosRedondo(conIva(o.e.base))}</div>
          <div className="text-xs text-stone-500">con IVA · {dif === 0 ? "igual que la referencia" : `${dif > 0 ? "+" : ""}${dif} % sobre la referencia`}</div>
        </div>
      </div>
      {suscrito && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {encargo ? (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_ENCARGO[encargo.estado].cls}`}>
              {ESTADO_ENCARGO[encargo.estado].texto}
              {encargo.visita.fecha ? ` · ${new Date(encargo.visita.fecha).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}
              {encargo.final ? ` · ${euros(conIva(encargo.final.importe))}` : ""}
            </span>
          ) : (
            !bloqueado && (
              <button onClick={alElegir} className={`rounded-full px-3 py-1.5 text-sm font-medium ${elegido ? "bg-teal-700 text-white" : "border border-teal-700 text-teal-800 hover:bg-teal-50"}`}>
                {elegido ? "✓ Pedir cita" : "Pedir cita"}
              </button>
            )
          )}
          <button onClick={() => setCv(!cv)} className="text-sm font-medium text-teal-700 underline">{cv ? "Ocultar currículum" : "Ver currículum y fotos"}</button>
          <button onClick={alAbrir} className="text-sm text-teal-700 underline">{abierto ? "Ocultar partidas" : "Ver por capítulos"}</button>
          {!f.id.startsWith("ej-") ? null : (
            <Link href={`/reformista/demo?r=${f.id}`} className="ml-auto text-xs text-stone-400 underline">Demo: verlo como el reformista</Link>
          )}
        </div>
      )}
      {suscrito && cv && <CurriculumReformista f={f} />}
      {encargo && estadoNoPresento(encargo) === "pendiente" && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-950">
          El reformista dice que no pudo hacer la cita porque no estabas. Si no es así, avísanos en {HORAS_DESMENTIR} h.{" "}
          <button onClick={() => desmentirNoPresento(encargo.id)} className="font-semibold underline">Sí que estuve</button>
        </div>
      )}
      {encargo && encargo.origen !== "invitado" && <CitaCliente e={encargo} />}
      {suscrito && encargo && encargo.origen !== "invitado" && <ChatEncargo e={encargo} parte="cliente" />}
      {suscrito && abierto && (
        <table className="mt-3 w-full text-xs">
          <tbody>
            {capitulos.map((x) => (
              <tr key={x.c} className="border-t border-stone-100"><td className="py-1">{x.c}</td><td className="py-1 text-right">{euros(x.importe)}</td></tr>
            ))}
            <tr className="border-t border-stone-300 font-semibold"><td className="py-1">Total sin IVA</td><td className="py-1 text-right">{euros(o.e.base)}</td></tr>
          </tbody>
        </table>
      )}
    </li>
  );
}

/** Cita aceptada: avisar si no puedes ir, o marcar que el reformista no vino. Con las reglas de faltas a la vista. */
function CitaCliente({ e }: { e: Encargo }) {
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const rnv = estadoReformistaNoVino(e);
  if (e.cancelaCliente) return <p className="mt-3 rounded-xl bg-stone-100 p-3 text-xs text-stone-700">Cancelaste la cita avisando: «{e.cancelaCliente.motivo}». Sin penalización.</p>;
  if (rnv === "pendiente") return <p className="mt-3 rounded-xl bg-stone-100 p-3 text-xs text-stone-700">Has avisado de que el reformista no vino. Tiene {HORAS_DESMENTIR} h para explicarlo; si no, cuenta como falta en su ficha.</p>;
  if (rnv === "confirmada") return <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-900">El reformista no vino ni avisó: cuenta como falta en su ficha.</p>;
  if (e.estado === "visita_pedida" && e.cancelaReformista)
    return <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-950">El reformista ha avisado de que no puede ir: «{e.cancelaReformista.motivo}». Te propondrá otra fecha.</p>;
  if (e.estado !== "visita_fijada" || estadoNoPresento(e)) return null;
  return (
    <div className="mt-3 rounded-xl border border-stone-200 p-3 text-xs" data-cita>
      <p className="text-stone-600">⚠️ {REGLA_FALTA_CLIENTE}</p>
      {cancelando ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <input className={`${inputCls} min-w-0 flex-1`} placeholder="Motivo (lo verá el reformista)" value={motivo} onChange={(x) => setMotivo(x.target.value)} />
          <button disabled={!motivo.trim()} onClick={() => cancelarCitaCliente(e.id, motivo.trim())} className="rounded-lg bg-stone-900 px-3 py-2 font-semibold text-white disabled:opacity-40">Avisar y cancelar</button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-3">
          <button onClick={() => setCancelando(true)} className="font-semibold text-teal-800 underline">No puedo ir: avisar</button>
          <button onClick={() => marcarReformistaNoVino(e.id)} className="text-stone-600 underline">El reformista no vino</button>
        </div>
      )}
    </div>
  );
}

/** «Invita a tu proveedor»: el cliente trae a su propio reformista. Gratis para los dos. */
function InvitaProveedor({ datos, invitados, bloqueado }: { datos: Invitacion["datos"]; invitados: Encargo[]; bloqueado: boolean }) {
  const [nombre, setNombre] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [mias, setMias] = useState<Invitacion[]>([]);
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    const f = () => setMias(leerInvitaciones().filter((i) => i.datos.proyectoId === datos.proyectoId));
    f();
    return alCambiar(f);
  }, [datos.proyectoId]);
  const enlace = (i: Invitacion) => `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/reformistas/?invita=${i.codigo}`;
  const pendiente = mias.find((i) => !i.encargoId);
  const copiar = async (i: Invitacion) => {
    try {
      await navigator.clipboard.writeText(enlace(i));
      setCopiado(true);
    } catch {
      /* sin portapapeles */
    }
  };
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 text-sm">
      <div className="font-semibold">🤝 ¿Ya tienes tu reformista? Invítalo a la app</div>
      <p className="mt-1 text-stone-700">
        Trae a tu propio reformista o proveedor para esta reforma: ninguno de los dos paga nada, y podéis usar la app para el presupuesto, el contrato estándar, los pagos por fases y los avances.
      </p>
      {invitados.map((e) => (
        <p key={e.id} className="mt-2 text-xs text-violet-900">✓ Tu reformista {e.codigo} ya está en la app · {ESTADO_ENCARGO[e.estado].texto}</p>
      ))}
      {pendiente ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-stone-600">Invitación para <b>{pendiente.proveedor}</b>. Mándale este enlace por WhatsApp o email: al darse de alta, la obra aparece en su área.</p>
          <div className="flex flex-wrap gap-2">
            <input readOnly className={`${inputCls} min-w-0 flex-1 text-xs`} value={enlace(pendiente)} />
            <button onClick={() => copiar(pendiente)} className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white">{copiado ? "✓ Copiado" : "Copiar enlace"}</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Te invito a llevar mi reforma con la app: ${enlace(pendiente)}`)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-violet-700 px-3 py-2 text-xs font-semibold text-violet-800">WhatsApp</a>
          </div>
          <Link href={`/reformistas/?invita=${pendiente.codigo}`} className="text-xs text-stone-400 underline">Demo: abrir el enlace como el reformista</Link>
        </div>
      ) : (
        !bloqueado &&
        (abierto ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <input className={`${inputCls} min-w-0 flex-1`} placeholder="Nombre o empresa de tu reformista" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <button disabled={!nombre.trim()} onClick={() => { invitarProveedor(datos, nombre.trim()); setNombre(""); }} className="rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white disabled:opacity-40">Crear invitación</button>
          </div>
        ) : (
          <button onClick={() => setAbierto(true)} className="mt-3 rounded-lg border border-violet-700 px-3 py-1.5 font-medium text-violet-800 hover:bg-violet-100">Invitar a mi proveedor</button>
        ))
      )}
    </div>
  );
}
