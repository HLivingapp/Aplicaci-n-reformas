"use client";

import { useEffect, useState } from "react";
import { APP } from "@/lib/marca";

/**
 * Acceso con clave mientras la demo es privada (hasta el lanzamiento).
 * Es una web estática: la clave evita que se vea por casualidad, no es una seguridad fuerte.
 * Solo se guarda la huella SHA-256 de la clave, nunca la clave.
 */
export const HUELLA_CLAVE = "dce41709fc78eb5383e452c44860e06a88f5c61ec3967ff7cea0d5b05e2f890f";
export const CLAVE_GUARDADA = "rm-acceso-privado";
export const DEMO_PRIVADA = process.env.NEXT_PUBLIC_ESTATICA === "1";

/** Script que corre antes de pintar: oculta la página si no se ha puesto la clave. */
export const SCRIPT_PUERTA = `try{if(localStorage.getItem("${CLAVE_GUARDADA}")!=="${HUELLA_CLAVE}")document.documentElement.classList.add("bloqueada")}catch(e){document.documentElement.classList.add("bloqueada")}`;

async function huella(texto: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto.trim()));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function PuertaClave() {
  const [bloqueada, setBloqueada] = useState(false);
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => setBloqueada(document.documentElement.classList.contains("bloqueada")), []);
  if (!bloqueada) return null;
  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = await huella(clave);
    if (h !== HUELLA_CLAVE) return setError(true);
    try { localStorage.setItem(CLAVE_GUARDADA, h); } catch { /* sin almacenamiento: solo esta visita */ }
    document.documentElement.classList.remove("bloqueada");
    setBloqueada(false);
  };
  return (
    <div id="puerta-clave" className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-50 p-4">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xl font-semibold text-teal-900">{APP.nombre}</p>
        <p className="mt-2 text-sm text-stone-600">Estamos preparando el lanzamiento. De momento el acceso es privado.</p>
        <label className="mt-4 block text-sm font-medium text-stone-800">
          Clave de acceso
          <input
            type="password"
            autoFocus
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            value={clave}
            onChange={(e) => { setClave(e.target.value); setError(false); }}
          />
        </label>
        {error && <p className="mt-2 text-sm text-red-700">Clave incorrecta.</p>}
        <button type="submit" className="mt-4 w-full rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">Entrar</button>
      </form>
    </div>
  );
}
