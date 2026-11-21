"use client";

import Link from "next/link";
import { useState } from "react";
import { publico } from "@/lib/base";
import { TEXTO_CONTACTO_MIEMBRO } from "@/lib/miembro";
import { unirse, useMiembro } from "@/lib/miembro-cliente";

/** Muestra el contenido solo a quien se ha unido a la comunidad con su email. */
export function RequiereRegistro({ children, motivo }: { children: React.ReactNode; motivo?: string }) {
  const m = useMiembro();
  if (m === undefined) return <main className="flex min-h-dvh items-center justify-center text-stone-500">Cargando…</main>;
  if (m) return <>{children}</>;
  return <PantallaRegistro motivo={motivo} />;
}

const VENTAJAS = [
  ["🧾", "Tu presupuesto de reforma gratis, partida a partida"],
  ["💬", "La comunidad: experiencias reales y respuestas de profesionales"],
  ["🎨", "Diseña tu baño o cocina y compara acabados"],
  ["✅", "Acceso a reformistas homologados de tu zona"],
];

export function PantallaRegistro({ motivo }: { motivo?: string }) {
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [aceptaContacto, setAceptaContacto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-stone-950 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-teal-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[26rem] w-[26rem] rounded-full bg-amber-500/20 blur-3xl" />
      <div className="relative mx-auto grid min-h-dvh max-w-5xl grid-cols-1 items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <div>
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publico("/icon.svg")} alt="" className="h-9 w-9" />
            <span className="font-display text-lg font-semibold">Human Living Reformas</span>
          </Link>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:mt-8">
            Únete a la comunidad <em className="font-medium text-amber-300">Human Living</em>
          </h1>
          <p className="mt-4 text-lg text-stone-300">{motivo ?? "Solo te pedimos tu email. Sin contraseñas y gratis."}</p>
          <ul className="mt-6 hidden space-y-3 lg:block">
            {VENTAJAS.map(([i, t]) => (
              <li key={t} className="flex items-center gap-3 text-stone-200"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">{i}</span>{t}</li>
            ))}
          </ul>
        </div>

        <form
          className="rounded-3xl bg-white p-6 text-stone-900 shadow-2xl sm:p-8"
          onSubmit={async (e) => {
            e.preventDefault();
            setEnviando(true);
            setError(await unirse({ email, telefono, aceptaPrivacidad, aceptaContacto }));
            setEnviando(false);
          }}
        >
          <h2 className="text-xl font-semibold">Entra gratis con tu email</h2>
          <label className="mt-5 block text-sm">
            <span className="mb-1 block font-medium text-stone-700">Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-stone-700">Teléfono <span className="font-normal text-stone-400">(opcional)</span></span>
            <input type="tel" autoComplete="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="600 000 000" className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
          </label>
          <label className="mt-4 flex gap-3 text-sm text-stone-700">
            <input type="checkbox" checked={aceptaContacto} onChange={(e) => setAceptaContacto(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-teal-700" />
            <span>📲 {TEXTO_CONTACTO_MIEMBRO}</span>
          </label>
          {aceptaContacto && !telefono.trim() && <p className="ml-7 mt-1 text-xs text-amber-700">Escribe tu teléfono para que podamos contactarte.</p>}
          <label className="mt-3 flex gap-3 text-sm text-stone-700">
            <input type="checkbox" required checked={aceptaPrivacidad} onChange={(e) => setAceptaPrivacidad(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-teal-700" />
            <span>He leído la <Link href="/privacidad" className="underline">política de privacidad</Link> y acepto unirme a la comunidad Human Living con mi email.</span>
          </label>
          {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={enviando || !aceptaPrivacidad || !email.trim() || (aceptaContacto && !telefono.trim())} className="mt-5 w-full rounded-2xl bg-teal-700 py-3.5 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50">
            {enviando ? "Entrando…" : "Unirme y entrar"}
          </button>
          <p className="mt-3 text-center text-xs text-stone-500">Tus datos se guardan en la Unión Europea. Nunca los compartimos con reformistas sin tu permiso.</p>
          <p className="mt-4 border-t border-stone-100 pt-3 text-center text-xs text-stone-500">
            ¿Ya tienes una reforma con nosotros? Entra con el enlace privado que te enviamos. · <Link href="/reformistas" className="underline">Soy reformista</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
