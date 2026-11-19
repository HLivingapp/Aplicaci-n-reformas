"use client";

import Link from "next/link";
import { useDatos } from "@/lib/store";
import { BotonLink, Tarjeta } from "@/components/ui";

/** En la demo el cliente elige quién es. Con accesos reales, cada cliente entra con su enlace o contraseña. */
export default function AccesoCliente() {
  const { datos } = useDatos();
  return (
    <main className="mx-auto min-h-dvh max-w-xl px-4 py-10">
      <Link href="/" className="text-sm text-stone-500 hover:underline">← Inicio</Link>
      <h1 className="mb-1 mt-2 text-2xl font-semibold tracking-tight">Mi reforma</h1>
      <p className="mb-6 text-sm text-stone-500">¿Aún no has abierto tu proyecto?</p>
      <BotonLink href="/nuevo" className="mb-8 w-full py-3 text-base">Empezar mi proyecto de reforma</BotonLink>
      <h2 className="mb-2 text-sm font-semibold text-stone-600">Demostración: entrar como…</h2>
      <div className="space-y-2">
        {datos.clientes.map((c) => (
          <Link key={c.id} href={`/cliente/${c.id}`} className="block">
            <Tarjeta className="hover:border-teal-600">
              <div className="font-medium">{c.nombre}</div>
              <div className="text-sm text-stone-500">{c.direccion}</div>
            </Tarjeta>
          </Link>
        ))}
      </div>
    </main>
  );
}
