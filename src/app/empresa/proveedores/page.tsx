"use client";

import Link from "next/link";
import { useState } from "react";
import { Tarjeta, Titulo, Vacio } from "@/components/ui";
import { avisosCaducidad, cumpleRequisitos, DOCUMENTOS, ESPECIALIDADES, homologado, requisitos } from "@/lib/proveedores";
import { useDatos } from "@/lib/store";
import type { Proveedor } from "@/lib/types";
import { ESTADO_PROVEEDOR } from "@/components/Proveedor";

const FILTROS = [
  { k: "revisar", texto: "Por revisar", f: (p: Proveedor) => p.estado === "pendiente" || p.documentos.some((d) => d.estado === "pendiente") },
  { k: "homologados", texto: "Homologados", f: (p: Proveedor) => homologado(p) },
  { k: "todos", texto: "Todos", f: () => true },
] as const;


const especialidad = (v: string) => ESPECIALIDADES.find((e) => e.valor === v)?.texto ?? v;

export default function Proveedores() {
  const { datos } = useDatos();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["k"]>("revisar");
  const avisos = avisosCaducidad(datos.proveedores);
  const f = FILTROS.find((x) => x.k === filtro)!;
  const lista = datos.proveedores.filter(f.f);

  return (
    <>
      <Titulo
        accion={
          <Link href="/reformistas" target="_blank" className="text-sm text-teal-700 hover:underline">
            Ver cuestionario público ↗
          </Link>
        }
      >
        Proveedores
      </Titulo>

      {avisos.length > 0 && (
        <Tarjeta className="mb-4 border-amber-200 bg-amber-50">
          <h2 className="mb-2 text-sm font-semibold text-amber-950">Documentos que caducan</h2>
          <ul className="space-y-1 text-sm">
            {avisos.map((a) => (
              <li key={a.documento.id}>
                <Link href={`/empresa/proveedores/${a.proveedor.id}`} className="font-medium hover:underline">{a.proveedor.razonSocial}</Link>: {DOCUMENTOS[a.documento.tipo].texto}{" "}
                <span className={a.situacion === "caducado" ? "text-red-700" : "text-amber-800"}>
                  {a.situacion === "caducado" ? `caducó el ${a.documento.caduca} (ya no se muestra a clientes)` : `caduca en ${a.dias} días`}
                </span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTROS.map((x) => (
          <button key={x.k} onClick={() => setFiltro(x.k)} className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${filtro === x.k ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}>
            {x.texto} ({datos.proveedores.filter(x.f).length})
          </button>
        ))}
      </div>

      {!lista.length && <Vacio>{datos.proveedores.length ? "No hay proveedores en este filtro." : "Aún no hay solicitudes. Comparte el cuestionario público con los reformistas."}</Vacio>}

      <div className="space-y-2">
        {lista.map((p) => {
          const reqs = requisitos(p);
          const ok = reqs.filter((r) => r.ok).length;
          const porRevisar = p.documentos.filter((d) => d.estado === "pendiente").length;
          return (
            <Link key={p.id} href={`/empresa/proveedores/${p.id}`}>
              <Tarjeta className="transition hover:border-teal-600">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{p.razonSocial}</div>
                    <div className="text-xs text-stone-500">{p.especialidades.map(especialidad).join(", ")}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_PROVEEDOR[p.estado].cls}`}>{ESTADO_PROVEEDOR[p.estado].texto}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-500">
                  <span>Requisitos {ok}/{reqs.length}{cumpleRequisitos(p) ? " ✅" : ""}</span>
                  {porRevisar > 0 && <span className="font-medium text-amber-700">{porRevisar} documentos por revisar</span>}
                  <span>{p.rea.inscrito ? "Con REA" : "Sin REA (PRL)"}</span>
                  <span>Solicitud del {p.creado}</span>
                </div>
              </Tarjeta>
            </Link>
          );
        })}
      </div>
    </>
  );
}
