"use client";

import { publico } from "@/lib/base";
import { useEffect, useState } from "react";
import type { Encargo } from "@/lib/encargos";
import { rutaIntranet, type Parte } from "@/lib/intranet";

/** Botón a la intranet privada de la obra (contrato, fases, fotos, certificados y pagos). */
export function EnlaceIntranet({ e, parte }: { e: Encargo; parte: Parte }) {
  const [ruta, setRuta] = useState<string | null>(null);
  useEffect(() => setRuta(e.final && e.estado !== "descartado" ? rutaIntranet(e.id, parte) : null), [e.id, e.final, e.estado, parte]);
  if (!ruta) return null;
  const firmado = e.estado === "firmado";
  return (
    <a href={publico(ruta)} className="flex items-center justify-between gap-3 rounded-xl bg-teal-700 px-4 py-3 text-sm text-white hover:bg-teal-800">
      <span>
        <span className="block font-semibold">{firmado ? "Abrir la intranet de la obra" : "Firmar el contrato en la intranet de la obra"}</span>
        <span className="block text-xs text-teal-100">Contrato, fases, fotos, certificados, comentarios y pagos. Enlace privado: no lo compartas.</span>
      </span>
      <span aria-hidden>→</span>
    </a>
  );
}
