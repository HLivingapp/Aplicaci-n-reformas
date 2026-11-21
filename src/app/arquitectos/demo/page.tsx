"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AreaEstudio } from "@/components/Arquitectura";
import { ESTUDIOS_EJEMPLO, leerEstudios, type Estudio } from "@/lib/estudios";

/** Área del estudio o arquitecto. En la demo se elige entre los de ejemplo y los dados de alta en este navegador. */
export default function AreaArquitectoDemo() {
  const [id, setId] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [lista, setLista] = useState<Estudio[]>([]);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setId(q.get("e") ?? ESTUDIOS_EJEMPLO[0].id);
    setNuevo(q.has("nuevo"));
    setLista(leerEstudios());
  }, []);
  const est = lista.find((x) => x.id === id);
  if (!id) return null;
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pb-16 pt-6">
      <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        Demostración: así ve su área el {est?.tipo === "autonomo" ? "arquitecto" : "estudio"} {est?.codigo}. Lo que hagas aquí lo verá el cliente.{" "}
        <button onClick={() => history.back()} className="font-semibold underline">Volver</button>
      </div>
      {nuevo && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900"><b>Alta recibida.</b> Pon tus precios para que los clientes te vean. Te pediremos el certificado de colegiación y la póliza de RC.</div>}
      <div className="flex flex-wrap gap-1.5">
        {lista.map((x) => (
          <Link key={x.id} href={`/arquitectos/demo?e=${x.id}`} onClick={() => setId(x.id)} className={`rounded-full px-3 py-1 text-sm ${x.id === id ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>{x.codigo}</Link>
        ))}
      </div>
      <h1 className="text-xl font-semibold">Área de {est?.nombre || `${est?.tipo === "autonomo" ? "arquitecto" : "estudio"} ${est?.codigo ?? ""}`}</h1>
      <AreaEstudio key={id} estudioId={id} />
    </main>
  );
}
