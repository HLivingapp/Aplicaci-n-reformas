"use client";

import { publico } from "@/lib/base";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DatosProvider, useDatos } from "@/lib/store";
import { conBaseDeDatos } from "@/lib/modo";

const NAV = [
  { href: "/empresa", texto: "Inicio", icono: "📊" },
  { href: "/empresa/solicitudes", texto: "Solicitudes", icono: "📥" },
  { href: "/empresa/clientes", texto: "Clientes", icono: "👥" },
  { href: "/empresa/comunidad", texto: "Comunidad", icono: "💬" },
  { href: "/empresa/presupuestos", texto: "Presupuestos", icono: "🧾" },
  { href: "/empresa/obras", texto: "Obras", icono: "🏗️" },
  { href: "/empresa/galeria", texto: "Fotos", icono: "🖼️" },
  { href: "/empresa/proveedores", texto: "Proveedores", icono: "🤝" },
  { href: "/empresa/ajustes", texto: "Ajustes", icono: "⚙️" },
];

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <DatosProvider>
      <Marco>{children}</Marco>
    </DatosProvider>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const { datos, guardando, errorGuardado, email, salir } = useDatos();
  const nuevas = datos.proyectos.filter((p) => p.estado === "nuevo").length;
  const activo = (href: string) => (href === "/empresa" ? ruta === href : ruta.startsWith(href));

  return (
    <div className="min-h-dvh md:flex">
      <aside className="no-print hidden w-56 shrink-0 border-r border-stone-200 bg-white md:block">
        <Link href="/" className="flex items-center gap-2 px-5 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publico("/icon.svg")} alt="" className="h-8 w-8" />
          <span className="text-sm font-semibold leading-tight">{datos.empresa.nombre}</span>
        </Link>
        <nav className="space-y-0.5 px-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                activo(n.href) ? "bg-teal-50 font-medium text-teal-800" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <span>{n.icono}</span>
              {n.texto}
              {n.href === "/empresa/solicitudes" && nuevas > 0 && <span className="ml-auto rounded-full bg-teal-700 px-1.5 text-xs text-white">{nuevas}</span>}
            </Link>
          ))}
        </nav>
        {conBaseDeDatos && (
          <div className="mt-6 border-t border-stone-100 px-5 pt-4 text-xs text-stone-500">
            <div className="truncate">{email}</div>
            <div>{guardando ? "Guardando…" : "Todo guardado"}</div>
            <button onClick={salir} className="mt-1 text-teal-700 hover:underline">Salir</button>
          </div>
        )}
      </aside>

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
        {errorGuardado && <div className="no-print mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorGuardado}</div>}
        {!conBaseDeDatos && (
          <div className="no-print mb-4 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">Modo demostración: los datos se guardan solo en este navegador.</div>
        )}
        {children}
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex min-w-[4.75rem] flex-1 shrink-0 flex-col items-center gap-0.5 py-2 text-[11px] ${activo(n.href) ? "font-semibold text-teal-700" : "text-stone-500"}`}
          >
            <span className="relative text-lg leading-none">
              {n.icono}
              {n.href === "/empresa/solicitudes" && nuevas > 0 && <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-teal-600" />}
            </span>
            {n.texto}
          </Link>
        ))}
      </nav>
    </div>
  );
}
