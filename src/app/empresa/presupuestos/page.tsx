"use client";

import Link from "next/link";
import { useState } from "react";
import { euros, fecha, totales } from "@/lib/calc";
import { useCrearPresupuesto } from "@/lib/acciones";
import { useDatos } from "@/lib/store";
import type { EstadoPresupuesto } from "@/lib/types";
import { Boton, EstadoPresupuestoTag, Tarjeta, Titulo, Vacio } from "@/components/ui";

const FILTROS: { valor: EstadoPresupuesto | "todos"; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "borrador", texto: "Borradores" },
  { valor: "enviado", texto: "Pendientes" },
  { valor: "aceptado", texto: "Aceptados" },
  { valor: "rechazado", texto: "Rechazados" },
];

export default function Presupuestos() {
  const { datos } = useDatos();
  const crear = useCrearPresupuesto();
  const [filtro, setFiltro] = useState<EstadoPresupuesto | "todos">("todos");
  const nombre = (id: string) => datos.clientes.find((c) => c.id === id)?.nombre ?? "Sin cliente";
  const lista = datos.presupuestos.filter((p) => filtro === "todos" || p.estado === filtro);

  return (
    <>
      <Titulo accion={<Boton onClick={() => crear()} disabled={!datos.clientes.length}>+ Nuevo presupuesto</Boton>}>Presupuestos</Titulo>
      {!datos.clientes.length && (
        <p className="mb-4 text-sm text-stone-500">
          Primero <Link href="/empresa/clientes" className="text-teal-700 underline">da de alta un cliente</Link>.
        </p>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${filtro === f.valor ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}
          >
            {f.texto}
          </button>
        ))}
      </div>

      {lista.length ? (
        <div className="space-y-2">
          {lista.map((p) => {
            const t = totales(p);
            return (
              <Link key={p.id} href={`/empresa/presupuestos/${p.id}`} className="block">
                <Tarjeta className="hover:border-teal-600">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-stone-400">Nº {p.numero} · {fecha(p.fecha)}</div>
                      <div className="truncate font-medium">{p.titulo}</div>
                      <div className="text-sm text-stone-500">{nombre(p.clienteId)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{euros(t.total)}</div>
                      <div className="mb-1 text-xs text-stone-400">margen {t.margenPct}%</div>
                      <EstadoPresupuestoTag estado={p.estado} />
                    </div>
                  </div>
                </Tarjeta>
              </Link>
            );
          })}
        </div>
      ) : (
        <Vacio>No hay presupuestos en este estado.</Vacio>
      )}
    </>
  );
}
