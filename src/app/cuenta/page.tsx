"use client";

import Link from "next/link";
import { useState } from "react";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { Boton, Campo, inputCls, Tarjeta } from "@/components/ui";
import { salir as salirComunidad } from "@/lib/miembro-cliente";
import { conNube } from "@/lib/modo";
import { borrarMiCuenta, descargarMisDatos, enviarEnlace, useEstadoNube, useSesionNube } from "@/lib/nube";

const TEXTO_ESTADO = {
  inactiva: "Conectando…",
  sincronizando: "Guardando en tu cuenta…",
  al_dia: "Todo guardado en tu cuenta",
  error: "No se han podido guardar los últimos cambios. Se reintentará con el próximo cambio.",
} as const;

/** Mi cuenta: entrar con un enlace al email (sin contraseña), ver que todo está guardado y ejercer los derechos RGPD. */
export default function Cuenta() {
  const sesion = useSesionNube();
  const estado = useEstadoNube();
  const [email, setEmail] = useState("");
  const [paso, setPaso] = useState<"inicio" | "enviando" | "enviado">("inicio");
  const [error, setError] = useState<string | null>(null);
  const [borrando, setBorrando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaso("enviando");
    const err = await enviarEnlace(email);
    setError(err);
    setPaso(err ? "inicio" : "enviado");
  };

  return (
    <>
      <CabeceraPublica />
      <main className="mx-auto max-w-md space-y-4 px-4 pb-16 pt-8">
        <h1 className="font-display text-3xl font-semibold">Mi cuenta</h1>
        {!conNube ? (
          <Tarjeta>
            <p className="text-sm text-stone-600">
              Estás en la demostración: lo que haces se guarda solo en este navegador. Cuando la app esté conectada a la base de datos podrás entrar con tu email y verlo en cualquier dispositivo.
            </p>
          </Tarjeta>
        ) : sesion === undefined ? (
          <p className="text-stone-500">Cargando…</p>
        ) : sesion ? (
          <>
            <Tarjeta>
              <p className="text-sm text-stone-500">Has entrado como</p>
              <p className="text-lg font-semibold">{sesion.user.email}</p>
              <p className={`mt-3 rounded-lg p-3 text-sm ${estado === "error" ? "bg-amber-50 text-amber-900" : "bg-teal-50 text-teal-900"}`}>
                {estado === "al_dia" ? "✓ " : ""}
                {TEXTO_ESTADO[estado]}
              </p>
              <p className="mt-3 text-sm text-stone-600">
                Tu presupuesto, los materiales que elijas, tus visitas y tus encargos se guardan en tu cuenta, en servidores de la Unión Europea. Solo tú (y el profesional de cada encargo) podéis verlos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/nuevo" className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-800">Mi presupuesto</Link>
                <Boton variante="secundario" onClick={() => { salirComunidad(); }}>Salir</Boton>
              </div>
            </Tarjeta>
            <Tarjeta>
              <h2 className="font-semibold">Tus datos</h2>
              <p className="mt-1 text-sm text-stone-600">Puedes descargar todo lo que tenemos de ti o borrar tu cuenta con todos sus datos.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Boton variante="secundario" onClick={() => descargarMisDatos().catch(() => setError("No se han podido descargar. Inténtalo de nuevo."))}>Descargar mis datos</Boton>
                <Boton
                  variante="peligro"
                  disabled={borrando}
                  onClick={async () => {
                    if (!window.confirm("¿Borrar tu cuenta y todos tus datos? No se puede deshacer.")) return;
                    setBorrando(true);
                    const err = await borrarMiCuenta();
                    setBorrando(false);
                    if (err) setError(err);
                    else window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`;
                  }}
                >
                  {borrando ? "Borrando…" : "Borrar mi cuenta"}
                </Boton>
              </div>
              {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            </Tarjeta>
          </>
        ) : paso === "enviado" ? (
          <Tarjeta>
            <p className="text-sm text-stone-700">
              Te hemos enviado un enlace a <b>{email}</b>. Ábrelo en este mismo dispositivo y entrarás directamente, sin contraseña. Si no llega en un par de minutos, mira en el correo no deseado.
            </p>
          </Tarjeta>
        ) : (
          <Tarjeta>
            <form onSubmit={enviar} className="space-y-3">
              <p className="text-sm text-stone-600">Sin contraseñas: escribe tu email y te enviamos un enlace para entrar. Así tu reforma queda guardada en tu cuenta y la recuperas en el móvil o en el ordenador (pide un enlace en cada uno).</p>
              <Campo etiqueta="Email">
                <input type="email" required autoComplete="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
              </Campo>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Boton type="submit" className="w-full" disabled={paso === "enviando" || !email.trim()}>
                {paso === "enviando" ? "Enviando…" : "Enviarme el enlace"}
              </Boton>
              <p className="text-xs text-stone-500">
                Tus datos se guardan en la Unión Europea. <Link href="/privacidad" className="underline">Política de privacidad</Link>
              </p>
            </form>
          </Tarjeta>
        )}
      </main>
    </>
  );
}
