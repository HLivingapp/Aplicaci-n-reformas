"use client";

import Link from "next/link";
import { useState } from "react";
import { conBaseDeDatos } from "@/lib/modo";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { Boton, Campo, inputCls, Tarjeta } from "@/components/ui";

/** Acceso del equipo sin contraseña: se envía un enlace al email. */
export default function Entrar() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"inicio" | "enviando" | "enviado" | "error">("inicio");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("enviando");
    const { error } = await supabaseNavegador().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/empresa`, shouldCreateUser: true },
    });
    setEstado(error ? "error" : "enviado");
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <Link href="/" className="mb-4 text-sm text-stone-500 hover:underline">← Inicio</Link>
      <Tarjeta>
        <h1 className="mb-1 text-xl font-semibold">Acceso del equipo</h1>
        {!conBaseDeDatos ? (
          <p className="text-sm text-stone-500">
            La app está en modo demostración. <Link href="/empresa" className="text-teal-700 underline">Entrar</Link>
          </p>
        ) : estado === "enviado" ? (
          <p className="text-sm text-stone-600">
            Te hemos enviado un enlace a <b>{email}</b>. Ábrelo desde este mismo dispositivo para entrar. Si no llega en un par de minutos, revisa el correo no deseado.
          </p>
        ) : (
          <form onSubmit={enviar} className="space-y-3">
            <p className="text-sm text-stone-500">Sin contraseña: escribe tu email de empresa y te enviamos un enlace para entrar.</p>
            <Campo etiqueta="Email">
              <input type="email" required autoComplete="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
            </Campo>
            {estado === "error" && <p className="text-sm text-red-700">No se ha podido enviar el enlace. Espera un minuto y vuelve a intentarlo.</p>}
            <Boton type="submit" className="w-full" disabled={estado === "enviando" || !email.trim()}>
              {estado === "enviando" ? "Enviando…" : "Enviarme el enlace"}
            </Boton>
          </form>
        )}
      </Tarjeta>
    </main>
  );
}
