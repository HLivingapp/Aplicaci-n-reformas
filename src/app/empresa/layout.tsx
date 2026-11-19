"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDatos } from "@/lib/store";

const NAV = [
  { href: "/empresa", texto: "Inicio", icono: "📊" },
  { href: "/empresa/solicitudes", texto: "Solicitudes", icono: "📥" },
  { href: "/empresa/clientes", texto: "Clientes", icono: "👥" },
  { href: "/empresa/presupuestos", texto: "Presupuestos", icono: "🧾" },
  { href: "/empresa/obras", texto: "Obras", icono: "🏗️" },
  { href: "/empresa/ajustes", texto: "Ajustes", icono: "⚙️" },
];

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const { datos } = useDatos();
  const nuevas = datos.proyectos.filter((p) => p.estado === "nuevo").length;
  const activo = (href: string) => (href === "/empresa" ? ruta === href : ruta.startsWith(href));

  return (
    <div className="min-h-dvh md:flex">
      <aside className="no-print hidden w-56 shrink-0 border-r border-stone-200 bg-white md:block">
        <Link href="/" className="flex items-center gap-2 px-5 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-8 w-8" />
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
      </aside>

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-10 grid grid-cols-6 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${activo(n.href) ? "font-semibold text-teal-700" : "text-stone-500"}`}
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
