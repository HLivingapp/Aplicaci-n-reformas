"use client";

import Link from "next/link";
import { APP } from "@/lib/marca";
import { usePathname } from "next/navigation";
import { useSuscripcion } from "@/lib/suscripcion";

const ENLACES = [
  { href: "/disena", texto: "Diseña", corto: "Diseña" },
  { href: "/comunidad", texto: "Comunidad", corto: "Foro" },
  { href: "/red", texto: "Profesionales", corto: "Pros" },
  { href: "/asistente", texto: "Asistente IA", corto: "IA" },
  { href: "/suscripcion", texto: "Planes", corto: "Planes" },
];

/** Cabecera de las páginas públicas: comunidad, red de profesionales, asistente y planes. */
export function CabeceraPublica() {
  const ruta = usePathname();
  const s = useSuscripcion();
  return (
    <header className="sticky top-0 z-20 border-b border-stone-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 text-sm">
        <Link href="/" className="shrink-0 font-semibold tracking-tight"><span className="hidden sm:inline">{APP.nombre}</span><span className="sm:hidden">{APP.corto}</span></Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {ENLACES.map((e) => (
            <Link key={e.href} href={e.href} className={`whitespace-nowrap rounded-full px-2.5 py-1.5 ${ruta?.startsWith(e.href) ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-100"}`}>
              <span className="hidden sm:inline">{e.texto}</span>
              <span className="sm:hidden">{e.corto}</span>
            </Link>
          ))}
          {s && s.plan !== "gratis" ? (
            <span className="ml-1 hidden whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 sm:inline">Plan {s.plan === "pro" ? "Pro" : "Básico"}</span>
          ) : (
            <Link href="/nuevo" className="ml-1 hidden whitespace-nowrap rounded-full bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800 sm:inline">Calcular precio</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
