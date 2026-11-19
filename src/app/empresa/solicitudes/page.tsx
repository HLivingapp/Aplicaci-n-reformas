"use client";

import Link from "next/link";
import { fecha } from "@/lib/calc";
import { textoDireccion } from "@/lib/proyecto";
import { useDatos } from "@/lib/store";
import { EstadoProyectoTag, Tarjeta, Titulo, Vacio } from "@/components/ui";

export default function Solicitudes() {
  const { datos } = useDatos();
  const nombre = (id: string) => datos.clientes.find((c) => c.id === id)?.nombre ?? "—";
  return (
    <>
      <Titulo accion={<Link href="/nuevo" className="text-sm text-teal-700 hover:underline">Ver el formulario del cliente →</Link>}>Solicitudes de reforma</Titulo>
      <p className="mb-4 text-sm text-stone-500">Proyectos que los clientes abren desde el formulario. Revisa los datos, agenda la visita y prepara el presupuesto.</p>
      {datos.proyectos.length ? (
        <div className="space-y-2">
          {datos.proyectos.map((p) => (
            <Link key={p.id} href={`/empresa/solicitudes/${p.id}`} className="block">
              <Tarjeta className="hover:border-teal-600">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-stone-400">{fecha(p.creado)}</div>
                    <div className="font-medium">{nombre(p.clienteId)} · Reforma {p.reforma.alcance}</div>
                    <div className="truncate text-sm text-stone-500">{textoDireccion(p.vivienda.direccion)}</div>
                    <div className="mt-1 text-xs text-stone-500">
                      {p.vivienda.m2 ?? "?"} m² · {p.vivienda.dormitorios} dorm. · {p.vivienda.banos} baño(s)
                      {p.reforma.presupuestoCliente && ` · ${p.reforma.presupuestoCliente}`}
                    </div>
                  </div>
                  <EstadoProyectoTag estado={p.estado} />
                </div>
              </Tarjeta>
            </Link>
          ))}
        </div>
      ) : (
        <Vacio>
          Todavía no hay solicitudes. Comparte el enlace <Link href="/nuevo" className="text-teal-700 underline">/nuevo</Link> con tus clientes.
        </Vacio>
      )}
    </>
  );
}
