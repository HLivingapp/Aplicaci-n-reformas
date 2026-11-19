"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { avanceFase, avanceObra, euros, fecha, finObra, totales } from "@/lib/calc";
import { estimar } from "@/lib/estimacion";
import { textoDireccion } from "@/lib/proyecto";
import { useDatos } from "@/lib/store";
import { Cronograma } from "@/components/Cronograma";
import { VistaEstimacion } from "@/components/Estimacion";
import { PlanoBase } from "@/components/PlanoBase";
import { Barra, EstadoFaseTag, EstadoPresupuestoTag, Tarjeta, Vacio } from "@/components/ui";

const PASOS_PROYECTO = [
  { estado: "nuevo", texto: "Solicitud recibida" },
  { estado: "visita", texto: "Visita a tu casa" },
  { estado: "presupuestado", texto: "Presupuesto" },
];

export default function PortalCliente() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const { datos } = useDatos();
  const [recienEnviado, setRecienEnviado] = useState(false);
  useEffect(() => {
    setRecienEnviado(new URLSearchParams(window.location.search).has("enviado"));
  }, []);

  const c = datos.clientes.find((x) => x.id === clienteId);
  if (!c) return <main className="p-6"><Vacio>No encontramos tu acceso. <Link href="/cliente" className="text-teal-700 underline">Volver</Link></Vacio></main>;

  const proyectos = datos.proyectos.filter((p) => p.clienteId === c.id && p.estado !== "descartado");
  const presupuestos = datos.presupuestos.filter((p) => p.clienteId === c.id && p.estado !== "borrador");
  const obras = datos.obras.filter((o) => o.clienteId === c.id);

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 pb-12 pt-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-9 w-9" />
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
          Te llamaremos para concertar una visita. Desde esta página podrás seguir todo el proceso.
        </div>
      )}

      {obras.map((o) => {
        const pct = avanceObra(o);
        const actual = o.fases.find((f) => f.estado === "en_curso");
        const novedades = o.novedades.filter((n) => n.visibleCliente);
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
              <Link key={p.id} href={`/cliente/${c.id}/presupuesto/${p.id}`} className="block">
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
              {!p.presupuestoId && <VistaEstimacion e={estimar(p.vivienda, p.reforma, datos.tarifas)} />}
              <PlanoBase m2={p.vivienda.m2} dormitorios={p.reforma.dormitoriosDeseados} banos={p.reforma.banosDeseados} cocinaAbierta={p.vivienda.cocinaAbierta} terrazas={p.vivienda.terrazas} />
            </Tarjeta>
          </section>
        );
      })}

      {!obras.length && !presupuestos.length && !proyectos.length && <Vacio>Todavía no hay nada que mostrar.</Vacio>}
    </main>
  );
}
