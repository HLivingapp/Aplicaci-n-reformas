"use client";

import Link from "next/link";
import { APP } from "@/lib/marca";
import { usePathname } from "next/navigation";
import { publico } from "@/lib/base";

const NOMBRE = APP.nombre;

const MENU = [
  { href: "/human-living", texto: "★ Human Living", ver: "2xl:inline" },
  { href: "/disena", texto: "Diseña", ver: "xl:inline" },
  { href: "/materiales", texto: "Materiales", ver: "2xl:inline" },
  { href: "/comunidades", texto: "Comunidades de vecinos", ver: "min-[1700px]:inline" },
  { href: "/subvenciones", texto: "Subvenciones", ver: "lg:inline" },
  { href: "/comunidad", texto: "Foro", ver: "lg:inline" },
  { href: "/hipoteca", texto: "Hipoteca", ver: "lg:inline" },
  { href: "/suscripcion", texto: "Planes", ver: "xl:inline" },
  { href: "/cliente", texto: "Mi reforma", ver: "xl:inline" },
];

/** Cabecera oscura de la portada y de las páginas de la marca (empresas destacadas). Marca la sección en la que estás. */
export function CabeceraSitio() {
  const ruta = usePathname() ?? "/";
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/80 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publico("/icon.svg")} alt="" className="h-8 w-8" />
          <span className="font-display text-sm font-semibold leading-tight tracking-tight min-[400px]:text-base sm:text-lg">{NOMBRE}</span>
        </Link>
        <nav className="relative flex items-center gap-1 whitespace-nowrap text-sm">
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
          <details className="group min-[1700px]:hidden">
            <summary aria-label="Menú" className="cursor-pointer list-none rounded-full px-2.5 py-1.5 text-stone-200 hover:bg-white/10 [&::-webkit-details-marker]:hidden">☰<span className="sr-only"> Menú</span></summary>
            <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-white/10 bg-stone-900 p-2 shadow-xl">
              {MENU.map((m) => (
                <Link key={m.href} href={m.href} className="block rounded-xl px-3 py-2 text-stone-200 hover:bg-white/10 hover:text-white">{m.texto}</Link>
              ))}
              <Link href="/#profesionales" className="block rounded-xl px-3 py-2 font-semibold text-amber-200 hover:bg-white/10 sm:hidden">Soy profesional</Link>
            </div>
          </details>
          <Link href="/#profesionales" className="hidden whitespace-nowrap rounded-full sm:inline-block border border-amber-300/70 px-3 py-1.5 font-semibold text-amber-200 hover:bg-white/10">
            <span className="sm:hidden">Soy pro</span><span className="hidden sm:inline">Soy profesional</span>
          </Link>
          <Link href="/nuevo" className="whitespace-nowrap rounded-full bg-amber-400 px-4 py-1.5 font-semibold text-stone-900 hover:bg-amber-300">Calcular precio</Link>
        </nav>
      </div>
    </header>
  );
}
