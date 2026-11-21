"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publico } from "@/lib/base";

const NOMBRE = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA ?? "Human Living Reformas";

const MENU = [
  { href: "/sobre-nosotros", texto: "Quiénes somos", ver: "sm:inline" },
  { href: "/disena", texto: "Diseña", ver: "md:inline" },
  { href: "/comunidad", texto: "Comunidad", ver: "md:inline" },
  { href: "/suscripcion", texto: "Planes", ver: "md:inline" },
  { href: "/cliente", texto: "Mi reforma", ver: "sm:inline" },
];

/** Cabecera oscura de la portada y de las páginas de la marca (Quiénes somos). Marca la sección en la que estás. */
export function CabeceraSitio() {
  const ruta = usePathname() ?? "/";
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/80 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publico("/icon.svg")} alt="" className="h-8 w-8" />
          <span className="font-display text-base font-semibold leading-tight tracking-tight sm:text-lg">{NOMBRE}</span>
        </Link>
        <nav className="flex items-center gap-1 whitespace-nowrap text-sm">
          {MENU.map((m) => {
            const activa = ruta.replace(/\/$/, "").endsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={activa ? "page" : undefined}
                className={`hidden rounded-full px-3 py-1.5 ${m.ver} ${activa ? "bg-white/15 text-white" : "text-stone-300 hover:bg-white/10 hover:text-white"}`}
              >
                {m.texto}
              </Link>
            );
          })}
          <Link href="/#profesionales" className="whitespace-nowrap rounded-full border border-amber-300/70 px-3 py-1.5 font-semibold text-amber-200 hover:bg-white/10">
            <span className="sm:hidden">Soy pro</span><span className="hidden sm:inline">Soy profesional</span>
          </Link>
          <Link href="/nuevo" className="whitespace-nowrap rounded-full bg-amber-400 px-4 py-1.5 font-semibold text-stone-900 hover:bg-amber-300">Calcular precio</Link>
        </nav>
      </div>
    </header>
  );
}
