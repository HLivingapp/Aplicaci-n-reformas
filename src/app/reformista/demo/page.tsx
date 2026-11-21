"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MisEncargos, MisTarifas } from "@/components/AreaReformista";
import { FICHAS_EJEMPLO } from "@/lib/red";

/** Demostración: el área de uno de los reformistas ficticios, para probar el recorrido completo. */
export default function AreaReformistaDemo() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => setId(new URLSearchParams(window.location.search).get("r") ?? FICHAS_EJEMPLO[0].id), []);
  const f = FICHAS_EJEMPLO.find((x) => x.id === id);
  if (!id) return null;
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pb-16 pt-6">
      <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        Demostración: así ve su área el reformista {f?.codigo ?? id}. Lo que hagas aquí lo verá el cliente en su presupuesto.{" "}
        <button onClick={() => history.back()} className="font-semibold underline">Volver</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FICHAS_EJEMPLO.map((x) => (
          <Link key={x.id} href={`/reformista/demo?r=${x.id}`} onClick={() => setId(x.id)} className={`rounded-full px-3 py-1 text-sm ${x.id === id ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>{x.codigo}</Link>
        ))}
      </div>
      <h1 className="text-xl font-semibold">Área del reformista {f?.codigo}</h1>
      <MisEncargos reformistaId={id} />
      <MisTarifas reformistaId={id} />
    </main>
  );
}
