"use client";

import { publico } from "@/lib/base";
import { useParamsReales } from "@/lib/rutas";
import Link from "next/link";

import { useEffect, useState } from "react";
import { avanceFase, avanceObra, euros, fecha, finObra, totales } from "@/lib/calc";
import { textoDireccion } from "@/lib/proyecto";
import { cargarPortal, enviarAccionObra, guardarMateriales } from "@/lib/publico-cliente";
import { diferenciaReferencia, HitosPago, importeObra, ValorarFase } from "@/components/ContratoObra";
import type { AccionObraCliente } from "@/lib/obra";
import type { Obra, Presupuesto } from "@/lib/types";
import type { DatosPortal } from "@/lib/publico";
import { Cronograma } from "@/components/Cronograma";
import { VistaEstimacion } from "@/components/Estimacion";
import { ComparativaRed } from "@/components/ComparativaRed";
import { ServiciosArquitectura } from "@/components/Arquitectura";
import { FasesYParecidas } from "@/components/Galeria";
import { ElegirMateriales } from "@/components/Materiales";
import { SeleccionPlegable } from "@/components/SeleccionProductos";
import { PlanoBase } from "@/components/PlanoBase";
import { Barra, EstadoFaseTag, EstadoPresupuestoTag, Tarjeta, Vacio } from "@/components/ui";

const PASOS_PROYECTO = [
  { estado: "nuevo", texto: "Solicitud recibida" },
  { estado: "visita", texto: "Visita a tu casa" },
  { estado: "presupuestado", texto: "Presupuesto" },
];

export default function PortalCliente() {
  const { token } = useParamsReales<{ token: string }>();
  const [datos, setDatos] = useState<DatosPortal | null | undefined>(undefined);
  const [recienEnviado, setRecienEnviado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const elegir = async (proyectoId: string, actuales: Record<string, string> | undefined, grupo: string, opcion: string) => {
    setGuardando(true);
    try {
      if (await guardarMateriales(token, proyectoId, { ...actuales, [grupo]: opcion })) setDatos(await cargarPortal(token));
    } finally {
      setGuardando(false);
    }
  };
  useEffect(() => {
    cargarPortal(token).then(setDatos);
  }, [token]);
  useEffect(() => {
    setRecienEnviado(new URLSearchParams(window.location.search).has("enviado"));
  }, []);

  if (datos === undefined) return <main className="flex min-h-dvh items-center justify-center text-stone-500">Cargando…</main>;
  if (datos === null)
    return (
      <main className="p-6">
        <Vacio>Este enlace no es válido o ha caducado. Pide a la empresa que te envíe uno nuevo.</Vacio>
      </main>
    );
  const c = datos.cliente;
  const { proyectos, presupuestos, obras } = datos;
  const referencia = proyectos.find((p) => p.estimacion)?.estimacion?.base;

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 pb-12 pt-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publico("/icon.svg")} alt="" className="h-9 w-9" />
          <div>
            <div className="text-xs text-stone-500">{datos.empresa.nombre}</div>
            <div className="font-semibold">Hola, {c.nombre.split(" ")[0]}</div>
          </div>
        </div>
        <a href={`tel:${datos.empresa.telefono}`} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm">📞 Llamar</a>
      </div>

      {recienEnviado && (
        <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="font-semibold">Tu presupuesto está guardado aquí.</div>
          No te lo enviamos por email: lo tienes siempre en esta página. <b>Guárdala en favoritos</b>, es tu enlace privado. Cuando quieras,{" "}
          <button onClick={() => document.getElementById("reformistas")?.scrollIntoView({ behavior: "smooth" })} className="font-semibold underline">mira más abajo el presupuesto de cada reformista homologado</button>, calculado con sus tarifas.
        </div>
      )}

      {obras.map((o) => {
        const pct = avanceObra(o);
        const actual = o.fases.find((f) => f.estado === "en_curso");
        const novedades = o.novedades;
        return (
          <section key={o.id} className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Tu obra: {o.titulo}</h2>
            <Tarjeta>
              <div className="mb-1 flex justify-between text-sm">
                <span>{actual ? `Ahora: ${actual.nombre}` : pct === 100 ? "Obra terminada 🎉" : "Pendiente de empezar"}</span>
                <span className="font-semibold text-teal-700">{pct}%</span>
              </div>
              <Barra pct={pct} />
              <div className="mt-1 text-xs text-stone-500">Fecha prevista de fin: {fecha(finObra(o))}</div>
              <div className="mt-4"><Cronograma fases={o.fases} /></div>
              <ol className="mt-4 space-y-2">
                {o.fases.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>{f.nombre} <span className="text-xs text-stone-400">{fecha(f.inicio)} – {fecha(f.fin)}</span></span>
                    <span className="flex items-center gap-2"><span className="text-xs text-stone-500">{avanceFase(f)}%</span><EstadoFaseTag estado={f.estado} /></span>
                  </li>
                ))}
              </ol>
            </Tarjeta>
            <ContratoCliente o={o} pres={presupuestos.find((x) => x.id === o.presupuestoId)} accion={async (a) => { if (await enviarAccionObra(token, o.id, a)) setDatos(await cargarPortal(token)); }} />
            {novedades.length > 0 && (
              <>
                <h3 className="mb-2 mt-4 font-semibold">Novedades</h3>
                <div className="space-y-2">
                  {novedades.map((n) => (
                    <div key={n.id} className="rounded-lg border border-stone-200 bg-white p-3 text-sm">
                      <div className="text-xs text-stone-400">{fecha(n.fecha)}</div>
                      {n.texto}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        );
      })}

      {presupuestos.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Tus presupuestos</h2>
          <div className="space-y-2">
            {presupuestos.map((p) => (
              <Link key={p.id} href={`/p/${token}/presupuesto/${p.id}`} className="block">
                <Tarjeta className="hover:border-teal-600">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{p.titulo}</div>
                      <div className="text-xs text-stone-500">Nº {p.numero} · {fecha(p.fecha)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{euros(totales(p).total)}</div>
                      <EstadoPresupuestoTag estado={p.estado} />
                    </div>
                  </div>
                  {(p.referenciaBase ?? referencia) ? <Comparador base={totales(p).base} referencia={(p.referenciaBase ?? referencia)!} /> : null}
                  {p.estado === "enviado" && <div className="mt-2 text-sm font-medium text-teal-700">Revisar y responder →</div>}
                </Tarjeta>
              </Link>
            ))}
          </div>
        </section>
      )}

      {proyectos.map((p) => {
        const idx = PASOS_PROYECTO.findIndex((x) => x.estado === p.estado);
        return (
          <section key={p.id} className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Tu proyecto</h2>
            <Tarjeta className="space-y-4">
              <div className="text-sm text-stone-500">{textoDireccion(p.vivienda.direccion)}</div>
              <ol className="flex gap-2">
                {PASOS_PROYECTO.map((x, i) => (
                  <li key={x.estado} className="flex-1 text-center text-xs">
                    <div className={`mb-1 h-1.5 rounded-full ${i <= idx ? "bg-teal-600" : "bg-stone-200"}`} />
                    <span className={i === idx ? "font-semibold text-teal-800" : "text-stone-500"}>{x.texto}</span>
                  </li>
                ))}
              </ol>
              {p.estimacion && <VistaEstimacion e={p.estimacion} />}
              {p.estimacion && p.estimacion.materiales?.length > 0 && (
                <details className="rounded-xl border border-stone-200 p-3" open={!p.estimacion.materiales.some((m) => m.elegidaPorCliente)}>
                  <summary className="cursor-pointer font-semibold">Elige tus acabados</summary>
                  <div className="mt-3">
                    <ElegirMateriales materiales={p.estimacion.materiales} ocupado={guardando} onElegir={(g, o) => elegir(p.id, p.reforma.materiales, g, o)} />
                    <SeleccionPlegable />
                  </div>
                </details>
              )}
              {p.estimacion && <FasesYParecidas e={p.estimacion} v={p.vivienda} r={p.reforma} plegado />}
              <PlanoBase m2={p.vivienda.m2} dormitorios={p.reforma.dormitoriosDeseados} banos={p.reforma.banosDeseados} cocinaAbierta={p.vivienda.cocinaAbierta} terrazas={p.vivienda.terrazas} />
            </Tarjeta>
            {p.estimacion && (
              <Tarjeta className="mt-4">
                <ComparativaRed proyectoId={p.id} token={token} cliente={c.nombre} vivienda={p.vivienda} reforma={p.reforma} />
              </Tarjeta>
            )}
            {p.estimacion && (
              <Tarjeta className="mt-4">
                <ServiciosArquitectura proyectoId={p.id} token={token} cliente={c.nombre} zona={p.vivienda.direccion.municipio || "Madrid"} m2={p.vivienda.m2 ?? 80} />
              </Tarjeta>
            )}
          </section>
        );
      })}

      {!obras.length && (
        <section className="mb-6 grid gap-3 sm:grid-cols-2">
          <Link href="/red" className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm hover:border-teal-600">
            <div className="font-semibold text-teal-900">👷 Compara con otros reformistas homologados</div>
            <div className="mt-1 text-teal-900/80">Mira lo que te costaría con cada reformista de tu zona, calculado con sus tarifas, y queda con los que te interesen. Plan Básico, 5 €/mes.</div>
          </Link>
          <Link href="/asistente" className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm hover:border-indigo-600">
            <div className="font-semibold text-indigo-900">🤖 Pregunta al asistente IA de obra</div>
            <div className="mt-1 text-indigo-900/80">Revisa tu presupuesto, trámites en Madrid y dudas técnicas. Plan Pro, 30 €/mes.</div>
          </Link>
        </section>
      )}

      {!obras.length && !presupuestos.length && !proyectos.length && <Vacio>Todavía no hay nada que mostrar.</Vacio>}
      <p className="mt-8 text-center text-xs text-stone-400">
        Este enlace es personal: no lo compartas. ·{" "}
        <Link href="/privacidad" className="hover:underline">Privacidad</Link>
      </p>
    </main>
  );
}

/** Compara la oferta con el presupuesto de referencia calculado para la vivienda (sin IVA). */
function Comparador({ base, referencia }: { base: number; referencia: number }) {
  const dif = Math.round(((base - referencia) / referencia) * 100);
  const [cls, texto] =
    dif > 15 ? ["bg-amber-50 text-amber-900", "por encima de tu referencia: pregunta qué incluye de más"]
    : dif < -15 ? ["bg-amber-50 text-amber-900", "por debajo de tu referencia: comprueba que no falten partidas"]
    : ["bg-emerald-50 text-emerald-900", "dentro del rango de tu referencia"];
  return (
    <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${cls}`}>
      ⚖️ <b>{dif > 0 ? "+" : ""}{dif} %</b> {texto} ({euros(referencia)} sin IVA).
    </div>
  );
}

/** Pagos por hitos, cambios y extras, y valoraciones por fase de la obra del cliente. */
function ContratoCliente({ o, pres, accion }: { o: Obra; pres?: Presupuesto; accion: (a: AccionObraCliente) => Promise<void> }) {
  const [comentario, setComentario] = useState("");
  const total = pres ? importeObra(o, totales(pres).total, pres.ivaPct) : 0;
  const extras = o.extras ?? [];
  const porValorar = o.fases.filter((f) => f.estado === "terminada" && !o.valoraciones?.some((v) => v.faseId === f.id));
  return (
    <div className="mt-4 space-y-4">
      {extras.length > 0 && (
        <Tarjeta>
          <h3 className="mb-2 font-semibold">Cambios y extras</h3>
          <ul className="space-y-2">
            {extras.map((e) => {
              const dif = diferenciaReferencia(e);
              return (
                <li key={e.id} className="rounded-lg border border-stone-200 p-3 text-sm">
                  <div className="flex justify-between gap-2"><span className="font-medium">{e.descripcion}</span><span className="font-semibold">{euros(e.importe)} + IVA</span></div>
                  <div className="text-xs text-stone-500">Propuesto el {fecha(e.fecha)}{dif !== null ? ` · ${dif > 0 ? "+" : ""}${dif} % frente al precio de referencia (${euros(e.referencia!)})` : ""}</div>
                  {e.estado === "propuesto" ? (
                    <div className="mt-2 space-y-2">
                      <input value={comentario} onChange={(x) => setComentario(x.target.value)} placeholder="Comentario (opcional)" className="w-full rounded-md border border-stone-200 p-2 text-sm" />
                      <div className="flex gap-2">
                        <button onClick={() => accion({ tipo: "extra", extraId: e.id, acepta: true, comentario })} className="rounded-full bg-teal-700 px-4 py-1.5 text-sm font-medium text-white">Aceptar y firmar</button>
                        <button onClick={() => accion({ tipo: "extra", extraId: e.id, acepta: false, comentario })} className="rounded-full border border-stone-300 px-4 py-1.5 text-sm">Rechazar</button>
                      </div>
                    </div>
                  ) : (
                    <div className={`mt-1 text-xs font-medium ${e.estado === "aceptado" ? "text-emerald-700" : "text-stone-500"}`}>{e.estado === "aceptado" ? `✓ Aceptado el ${fecha(e.respuesta!.fecha)}: se suma al contrato` : "Rechazado"}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Tarjeta>
      )}
      {pres && (
        <Tarjeta>
          <h3 className="mb-2 font-semibold">Pagos del contrato</h3>
          <HitosPago o={o} total={total} accion={(id, estado) => estado === "solicitado" ? <button onClick={() => confirm("¿Confirmas que has pagado este hito al reformista?") && accion({ tipo: "pagado", hitoId: id })} className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white">Confirmar que he pagado</button> : null} />
        </Tarjeta>
      )}
      {porValorar.map((f) => (
        <ValorarFase key={f.id} nombre={f.nombre} alEnviar={(v) => accion({ tipo: "valorar", faseId: f.id, ...v })} />
      ))}
    </div>
  );
}
