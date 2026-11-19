"use client";

import { useState } from "react";
import { useDatos } from "@/lib/store";
import { Tarifario } from "./Tarifario";
import { Boton, Campo, inputCls, Tarjeta, Titulo } from "@/components/ui";

const CAMPOS = [
  ["nombre", "Nombre de la empresa"],
  ["cif", "CIF"],
  ["telefono", "Teléfono"],
  ["email", "Email"],
  ["direccion", "Dirección"],
] as const;

export default function Ajustes() {
  const { datos, actualizar, reiniciar } = useDatos();
  const [tab, setTab] = useState<"tarifario" | "empresa">("tarifario");
  return (
    <>
      <Titulo>Ajustes</Titulo>
      <div className="mb-4 flex gap-2">
        {(["tarifario", "empresa"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-3 py-1 text-sm ${tab === k ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"}`}>
            {k === "tarifario" ? "Tarifario" : "Empresa"}
          </button>
        ))}
      </div>
      {tab === "tarifario" ? <Tarifario /> : (<>
      <Tarjeta className="mb-4">
        <h2 className="mb-3 font-semibold">Datos de la empresa (salen en los presupuestos)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CAMPOS.map(([k, t]) => (
            <Campo key={k} etiqueta={t}>
              <input className={inputCls} value={datos.empresa[k]} onChange={(e) => actualizar((d) => { d.empresa[k] = e.target.value; })} />
            </Campo>
          ))}
        </div>
      </Tarjeta>
      <Tarjeta>
        <h2 className="mb-1 font-semibold">Datos de demostración</h2>
        <p className="mb-3 text-sm text-stone-500">Borra todo lo que hayas creado y vuelve a cargar los ejemplos.</p>
        <Boton variante="peligro" onClick={() => confirm("¿Borrar todos los datos y volver a los ejemplos?") && reiniciar()}>Restablecer datos de ejemplo</Boton>
      </Tarjeta>
      </>)}
    </>
  );
}
