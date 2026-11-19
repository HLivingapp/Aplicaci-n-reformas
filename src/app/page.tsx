import Link from "next/link";
import { conBaseDeDatos } from "@/lib/modo";

const NOMBRE = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA ?? "Human Living Reformas";

export default function Inicio() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-12 w-12" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{NOMBRE}</h1>
          <p className="text-sm text-stone-500">Presupuestos, planificación de obra y portal del cliente</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/empresa" className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-teal-600 hover:shadow">
          <div className="mb-2 text-3xl">🛠️</div>
          <h2 className="text-lg font-semibold group-hover:text-teal-700">Entrar como empresa</h2>
          <p className="mt-1 text-sm text-stone-500">Clientes, presupuestos, obras y planificación.</p>
        </Link>
        <Link href={conBaseDeDatos ? "/nuevo" : "/cliente"} className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-teal-600 hover:shadow">
          <div className="mb-2 text-3xl">🏠</div>
          <h2 className="text-lg font-semibold group-hover:text-teal-700">{conBaseDeDatos ? "Empezar mi proyecto" : "Entrar como cliente"}</h2>
          <p className="mt-1 text-sm text-stone-500">Cuéntanos tu reforma y recibe una primera estimación. Después la sigues con tu enlace privado.</p>
        </Link>
      </div>

      <Link href="/reformistas" className="mt-4 block rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-600 hover:border-teal-600">
        <span className="font-medium text-stone-800">¿Eres reformista?</span> Homologa tu empresa y recibe clientes de tu zona →
      </Link>

      {!conBaseDeDatos && (
        <p className="mt-8 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          Versión de demostración: los datos se guardan solo en este navegador. Ejemplos:{" "}
          <Link href="/p/demo-marta-0000000000000000000003" className="underline">cliente eligiendo acabados</Link>,{" "}
          <Link href="/reformista/demo-reformista-0000000000000001" className="underline">reformista con documentos pendientes</Link>.
        </p>
      )}
      <p className="mt-6 text-center text-xs text-stone-400">
        <Link href="/privacidad" className="hover:underline">Privacidad</Link>
      </p>
    </main>
  );
}
