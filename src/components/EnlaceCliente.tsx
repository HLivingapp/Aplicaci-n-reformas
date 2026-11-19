"use client";

import { useState } from "react";
import { nuevoToken } from "@/lib/id";
import { useDatos } from "@/lib/store";
import type { Cliente } from "@/lib/types";

/** Enlace privado del cliente: abrir, copiar para enviárselo o renovarlo (el anterior deja de funcionar). */
export function EnlaceCliente({ cliente }: { cliente: Cliente }) {
  const { actualizar } = useDatos();
  const [copiado, setCopiado] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/p/${cliente.token}` : `/p/${cliente.token}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      prompt("Copia el enlace:", url);
    }
  };

  const renovar = () => {
    if (!confirm("Se creará un enlace nuevo y el actual dejará de funcionar. ¿Continuar?")) return;
    actualizar((d) => {
      const c = d.clientes.find((x) => x.id === cliente.id);
      if (c) c.token = nuevoToken();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm">
      <a href={`/p/${cliente.token}`} target="_blank" rel="noopener noreferrer" className="rounded-lg px-2 py-1.5 text-teal-700 hover:bg-teal-50">Ver su portal ↗</a>
      <button onClick={copiar} className="rounded-lg px-2 py-1.5 text-teal-700 hover:bg-teal-50">{copiado ? "✓ Copiado" : "🔗 Copiar enlace"}</button>
      <button onClick={renovar} className="rounded-lg px-2 py-1.5 text-stone-500 hover:bg-stone-100" title="El enlace anterior deja de funcionar">Renovar enlace</button>
    </div>
  );
}
