"use client";

import { publico } from "@/lib/base";
import { useParamsReales } from "@/lib/rutas";
import Link from "next/link";

import { useEffect, useState } from "react";
import { avanceFase, avanceObra, euros, fecha, finObra, totales } from "@/lib/calc";
import { textoDireccion } from "@/lib/proyecto";
import { cargarPortal, guardarMateriales } from "@/lib/publico-cliente";
import type { DatosPortal } from "@/lib/publico";
import { Cronograma } from "@/components/Cronograma";
import { VistaEstimacion } from "@/components/Estimacion";
import { FasesYParecidas } from "@/components/Galeria";
import { ElegirMateriales } from "@/components/Materiales";
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
          <div className="font-semibold">¡Gracias! Hemos recibido tu proyecto.</div>
          Te llamaremos para concertar una visita. <b>Guarda esta página en favoritos</b>: es tu enlace privado para seguir todo el proceso.
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
                  </div>
                </details>
              )}
              {p.estimacion && <FasesYParecidas e={p.estimacion} v={p.vivienda} r={p.reforma} plegado />}
              <PlanoBase m2={p.vivienda.m2} dormitorios={p.reforma.dormitoriosDeseados} banos={p.reforma.banosDeseados} cocinaAbierta={p.vivienda.cocinaAbierta} terrazas={p.vivienda.terrazas} />
            </Tarjeta>
          </section>
        );
      })}

      {!obras.length && !presupuestos.length && !proyectos.length && <Vacio>Todavía no hay nada que mostrar.</Vacio>}
      <p className="mt-8 text-center text-xs text-stone-400">
        Este enlace es personal: no lo compartas. ·{" "}
        <Link href="/privacidad" className="hover:underline">Privacidad</Link>
      </p>
    </main>
  );
}
