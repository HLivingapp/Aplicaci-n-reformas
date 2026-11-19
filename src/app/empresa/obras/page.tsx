"use client";

import Link from "next/link";
import { avanceObra, fecha, finObra } from "@/lib/calc";
import { useDatos } from "@/lib/store";
import { Barra, Tarjeta, Titulo, Vacio } from "@/components/ui";

export default function Obras() {
  const { datos } = useDatos();
  const nombre = (id: string) => datos.clientes.find((c) => c.id === id)?.nombre ?? "—";
  return (
    <>
      <Titulo>Obras</Titulo>
      <p className="mb-4 text-sm text-stone-500">Las obras se crean al aceptar un presupuesto.</p>
      {datos.obras.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {datos.obras.map((o) => {
            const pct = avanceObra(o);
            const actual = o.fases.find((f) => f.estado === "en_curso");
            return (
              <Link key={o.id} href={`/empresa/obras/${o.id}`}>
                <Tarjeta className="h-full hover:border-teal-600">
                  <div className="flex justify-between gap-2">
                    <div className="font-medium">{o.titulo}</div>
                    <div className="font-semibold text-teal-700">{pct}%</div>
                  </div>
                  <div className="text-sm text-stone-500">{nombre(o.clienteId)} · {o.direccion}</div>
                  <div className="my-3"><Barra pct={pct} /></div>
                  <div className="text-xs text-stone-500">
                    {fecha(o.inicio)} → {fecha(finObra(o))}
                    {actual && ` · Ahora: ${actual.nombre}`}
                    {pct === 100 && " · Terminada"}
                  </div>
                </Tarjeta>
              </Link>
            );
          })}
        </div>
      ) : (
        <Vacio>Aún no hay obras. Acepta un presupuesto para crear la primera.</Vacio>
      )}
    </>
  );
}
