"use client";

import Link from "next/link";
import { avanceObra, euros, fecha, totales } from "@/lib/calc";
import { useDatos } from "@/lib/store";
import { useCrearPresupuesto } from "@/lib/acciones";
import { Barra, Boton, EstadoPresupuestoTag, Tarjeta, Titulo, Vacio } from "@/components/ui";

export default function Panel() {
  const { datos } = useDatos();
  const crear = useCrearPresupuesto();
  const nombre = (id: string) => datos.clientes.find((c) => c.id === id)?.nombre ?? "—";
  const solicitudes = datos.proyectos.filter((p) => p.estado === "nuevo");
  const pendientes = datos.presupuestos.filter((p) => p.estado === "enviado");
  const borradores = datos.presupuestos.filter((p) => p.estado === "borrador");
  const aceptados = datos.presupuestos.filter((p) => p.estado === "aceptado");
  const enCurso = datos.obras.filter((o) => avanceObra(o) < 100);
  const importePendiente = pendientes.reduce((s, p) => s + totales(p).base, 0);
  const importeAceptado = aceptados.reduce((s, p) => s + totales(p).base, 0);

  return (
    <>
      <Titulo accion={<Boton onClick={() => crear()}>+ Nuevo presupuesto</Boton>}>Panel</Titulo>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Link href="/empresa/solicitudes"><Dato titulo="Solicitudes nuevas" valor={String(solicitudes.length)} sub="clientes por atender" /></Link>
        <Dato titulo="Obras en curso" valor={String(enCurso.length)} />
        <Dato titulo="Presupuestos pendientes" valor={String(pendientes.length)} sub={euros(importePendiente) + " sin IVA"} />
        <Dato titulo="Borradores" valor={String(borradores.length)} />
        <Dato titulo="Contratado" valor={euros(importeAceptado)} sub="sin IVA" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">Obras en curso</h2>
          {enCurso.length ? (
            <div className="space-y-3">
              {enCurso.map((o) => {
                const pct = avanceObra(o);
                const actual = o.fases.find((f) => f.estado === "en_curso");
                return (
                  <Link key={o.id} href={`/empresa/obras/${o.id}`} className="block">
                    <Tarjeta className="hover:border-teal-600">
                      <div className="flex justify-between gap-2">
                        <div>
                          <div className="font-medium">{o.titulo}</div>
                          <div className="text-sm text-stone-500">{nombre(o.clienteId)}</div>
                        </div>
                        <div className="text-right text-sm font-semibold text-teal-700">{pct}%</div>
                      </div>
                      <div className="mt-3">
                        <Barra pct={pct} />
                      </div>
                      {actual && <div className="mt-2 text-xs text-stone-500">Fase actual: {actual.nombre}</div>}
                    </Tarjeta>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Vacio>No hay obras en curso.</Vacio>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Esperando respuesta del cliente</h2>
          {pendientes.length ? (
            <div className="space-y-3">
              {pendientes.map((p) => (
                <Link key={p.id} href={`/empresa/presupuestos/${p.id}`} className="block">
                  <Tarjeta className="hover:border-teal-600">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-medium">{p.titulo}</div>
                        <div className="text-sm text-stone-500">
                          {nombre(p.clienteId)} · {fecha(p.fecha)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{euros(totales(p).total)}</div>
                        <EstadoPresupuestoTag estado={p.estado} />
                      </div>
                    </div>
                  </Tarjeta>
                </Link>
              ))}
            </div>
          ) : (
            <Vacio>Ningún presupuesto pendiente.</Vacio>
          )}
        </section>
      </div>
    </>
  );
}

function Dato({ titulo, valor, sub }: { titulo: string; valor: string; sub?: string }) {
  return (
    <Tarjeta>
      <div className="text-xs text-stone-500">{titulo}</div>
      <div className="mt-1 text-xl font-semibold">{valor}</div>
      {sub && <div className="text-xs text-stone-400">{sub}</div>}
    </Tarjeta>
  );
}
