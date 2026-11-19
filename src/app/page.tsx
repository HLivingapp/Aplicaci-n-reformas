"use client";

import Link from "next/link";
import { useDatos } from "@/lib/store";

export default function Inicio() {
  const { datos } = useDatos();
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-12 w-12" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{datos.empresa.nombre}</h1>
          <p className="text-sm text-stone-500">Presupuestos, planificación de obra y portal del cliente</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/empresa" className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-teal-600 hover:shadow">
          <div className="mb-2 text-3xl">🛠️</div>
          <h2 className="text-lg font-semibold group-hover:text-teal-700">Entrar como empresa</h2>
          <p className="mt-1 text-sm text-stone-500">Clientes, presupuestos, obras y planificación.</p>
        </Link>
        <Link href="/cliente" className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-teal-600 hover:shadow">
          <div className="mb-2 text-3xl">🏠</div>
          <h2 className="text-lg font-semibold group-hover:text-teal-700">Entrar como cliente</h2>
          <p className="mt-1 text-sm text-stone-500">Ver y aceptar presupuestos, seguir el avance de la reforma.</p>
        </Link>
      </div>

      <p className="mt-8 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
        Versión de demostración: los datos se guardan solo en este navegador y no hay contraseñas todavía. Para usarla con clientes reales hay que conectar la base de datos y los accesos.
      </p>
    </main>
  );
}
