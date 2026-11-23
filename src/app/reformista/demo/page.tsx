"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MisEncargos, MisFotosTrabajos, MisPuntos, MisTarifas } from "@/components/AreaReformista";
import { TarifarioPresupuestos } from "@/components/TarifarioPresupuestos";
import { PanelReformista } from "@/components/PanelReformista";
import { InvitaClientes } from "@/components/InvitaClientes";
import { FICHAS_EJEMPLO } from "@/lib/red";

/** Demostración: el área de uno de los reformistas ficticios, para probar el recorrido completo. */
export default function AreaReformistaDemo() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => setId(new URLSearchParams(window.location.search).get("r") ?? FICHAS_EJEMPLO[0].id), []);
  const f = FICHAS_EJEMPLO.find((x) => x.id === id);
  if (!id) return null;
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pb-16 pt-4">
      <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        Demostración: así ve su área el reformista {f?.codigo ?? id}. Lo que hagas aquí lo verá el cliente en su presupuesto.{" "}
        <button onClick={() => history.back()} className="font-semibold underline">Volver</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FICHAS_EJEMPLO.map((x) => (
          <Link key={x.id} href={`/reformista/demo?r=${x.id}`} onClick={() => setId(x.id)} className={`rounded-full px-3 py-1 text-sm ${x.id === id ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>{x.codigo}</Link>
        ))}
      </div>
      <PanelReformista
        reformistaId={id}
        titulo={`Reformista ${f?.codigo ?? ""}`}
        estado={<span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">✓ Homologado</span>}
        pestanas={[
          { id: "clientes", icono: "🤝", texto: "Clientes", contenido: <MisEncargos reformistaId={id} /> },
          { id: "tarifas", icono: "📑", texto: "Tarifas", contenido: <><MisTarifas reformistaId={id} /><TarifarioPresupuestos reformistaId={id} /></> },
          { id: "ficha", icono: "📸", texto: "Mi ficha", contenido: <><MisPuntos reformistaId={id} ficha={f} /><MisFotosTrabajos reformistaId={id} /></> },
          ...(f ? [{ id: "invitar", icono: "💌", texto: "Invitar", contenido: <InvitaClientes tipo="reformista" id={f.id} codigo={f.codigo} /> }] : []),
        ]}
      />
    </main>
  );
}
