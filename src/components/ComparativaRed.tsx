"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { euros, eurosRedondo } from "@/lib/calc";
import { alCambiar, esInvitado, ESTADO_ENCARGO, invitarProveedor, leerInvitaciones, type Invitacion, TEXTO_RESERVA, firmarCliente, IVA_REFORMA, leerEncargos, ofertas, pedirVisitas, referencia, type Encargo, type OfertaRed } from "@/lib/encargos";
import { conBaseDeDatos } from "@/lib/modo";
import { FICHAS_EJEMPLO, fichasRed, soloComunidades, type FichaRed } from "@/lib/red";
import { leerLocal } from "@/lib/store";
import { incluye, useSuscripcion } from "@/lib/suscripcion";
import type { DatosReforma, Vivienda } from "@/lib/types";
import { ContratoEncargo } from "./ContratoEncargo";
import { SeguimientoEncargo } from "./SeguimientoEncargo";
import { SimuladorHipoteca } from "./SimuladorHipoteca";
import { ServiciosContratables } from "./SeguroPromotor";
import { Muro } from "./Muro";
import { inputCls } from "./ui";

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
  const s = useSuscripcion();
  const fichas = useFichasRed();
  const encargos = useEncargos().filter((e) => e.proyectoId === proyectoId);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [preferencia, setPreferencia] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const suscrito = s ? incluye(s.plan, "basico") : false;
  const ref = useMemo(() => referencia(vivienda, reforma), [vivienda, reforma]);
  const lista = useMemo(() => (fichas ? ofertas(vivienda, reforma, fichas) : []), [fichas, vivienda, reforma]);
  const firmado = encargos.find((e) => e.estado === "firmado" || e.estado === "firmado_cliente");

  if (!fichas) return null;
  const datos = { proyectoId, tokenCliente: token, cliente, zona: vivienda.direccion.municipio || "Madrid", vivienda, reforma };

  const encargoDe = (id: string) => encargos.find((e) => e.reformistaId === id);
  const alternar = (id: string) => setElegidos((x) => (x.includes(id) ? x.filter((y) => y !== id) : x.length >= 3 ? x : [...x, id]));
  const pedir = () => {
    pedirVisitas(lista.filter((o) => elegidos.includes(o.ficha.id)), datos, preferencia);
    setElegidos([]);
  };

  return (
    <section id="reformistas" className="scroll-mt-4 space-y-3">
      <div>
        <h2 className="text-lg font-semibold">El presupuesto de cada reformista para tu casa</h2>
        <p className="text-sm text-stone-600">
          Cada reformista homologado ha cargado sus tarifas en la app, así que ya ves lo que te costaría con cada uno, partida a partida. Elige hasta 3, queda con ellos para una visita y, después, te mandan aquí su presupuesto final y el contrato. Al firmar pagas en la app una reserva ({TEXTO_RESERVA}) que se descuenta del precio, y te regalamos un seguro de promotor con responsabilidad civil y defensa jurídica.
        </p>
      </div>
      {!lista.length && <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">Todavía no hay reformistas homologados con tarifas en tu zona.</p>}
      {!suscrito && lista.length > 0 && (
        <Muro plan="basico" volver={`/p/${token}`} titulo={`${lista.length} reformistas homologados ya tienen precio para tu reforma`}>
          Desde {eurosRedondo(conIva(lista[0].e.base))} hasta {eurosRedondo(conIva(lista[lista.length - 1].e.base))} con IVA. Suscríbete para ver quién es cada uno, comparar sus partidas y quedar para una visita.
        </Muro>
      )}
      <ul className="space-y-2">
        {lista.map((o) => (
          <Oferta
            key={o.ficha.id}
            o={o}
            refBase={ref.base}
            suscrito={suscrito}
            encargo={encargoDe(o.ficha.id)}
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
          <div className="font-semibold">Pedir visita a {elegidos.length} reformista{elegidos.length > 1 ? "s" : ""}</div>
          <p className="text-xs text-stone-500">Vendrán a ver tu casa, medir y ajustar el presupuesto. Tu teléfono solo lo verán ellos.</p>
          <input className={`${inputCls} mt-2`} placeholder="¿Cuándo te viene bien? (p. ej. tardes entre semana)" value={preferencia} onChange={(e) => setPreferencia(e.target.value)} />
          <button onClick={pedir} className="mt-2 w-full rounded-xl bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800">Pedir visita</button>
        </div>
      )}
      <InvitaProveedor datos={datos} invitados={encargos.filter(esInvitado)} bloqueado={!!firmado} />
      {encargos.filter((e) => e.final && e.estado !== "descartado").map((e) => (
        <div key={e.id}>
          <h3 className="mb-2 font-semibold">Contrato con {esInvitado(e) ? "tu reformista" : "el reformista"} {e.codigo}</h3>
          {e.estado === "firmado" && <div className="mb-3"><SeguimientoEncargo e={e} parte="cliente" /></div>}
          <ContratoEncargo e={e} parte="cliente" alFirmar={() => firmarCliente(e.id)} />
        </div>
      ))}
      <SimuladorHipoteca importe={conIva(ref.base)} />
      <ServiciosContratables proyectoId={proyectoId} encargos={encargos} />
    </section>
  );
}

function Oferta({ o, refBase, suscrito, encargo, elegido, bloqueado, alElegir, abierto, alAbrir }: {
  o: OfertaRed; refBase: number; suscrito: boolean; encargo?: Encargo; elegido: boolean; bloqueado: boolean; alElegir: () => void; abierto: boolean; alAbrir: () => void;
}) {
  const f = o.ficha;
  const dif = refBase ? Math.round(((o.e.base - refBase) / refBase) * 100) : 0;
  const m = media(f);
  const capitulos = [...new Set(o.e.lineas.map((l) => l.capitulo))].map((c) => ({ c, importe: o.e.lineas.filter((l) => l.capitulo === c).reduce((s, l) => s + l.cantidad * l.precio, 0) }));
  return (
    <li className={`rounded-2xl border bg-white p-4 ${elegido ? "border-teal-600 ring-2 ring-teal-100" : "border-stone-200"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{suscrito ? `Reformista ${f.codigo}` : "Reformista homologado"}</div>
          <div className="text-xs text-stone-500">
            {suscrito ? `${f.zonas.slice(0, 2).join(", ")} · ` : ""}{f.obrasEnApp} obras en la app{m ? ` · ★ ${m.toLocaleString("es-ES", { maximumFractionDigits: 1 })}` : ""}
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
                {elegido ? "✓ Me interesa" : "Me interesa"}
              </button>
            )
          )}
          <button onClick={alAbrir} className="text-sm text-teal-700 underline">{abierto ? "Ocultar partidas" : "Ver por capítulos"}</button>
          {!f.id.startsWith("ej-") ? null : (
            <Link href={`/reformista/demo?r=${f.id}`} className="ml-auto text-xs text-stone-400 underline">Demo: verlo como el reformista</Link>
          )}
        </div>
      )}
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

/** «Invita a tu proveedor»: el cliente trae a su propio reformista. Sin reserva ni fee para ninguno de los dos. */
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
        Trae a tu propio reformista o proveedor para esta reforma: ninguno de los dos paga reserva ni comisión, y seguís usando la app con contrato, pagos por fases y avances. El seguro de promotor no va
        incluido gratis, pero puedes contratarlo online aquí mismo.
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
