import type { Metadata } from "next";
import Link from "next/link";
import { PaginaSeo } from "@/components/seo/PaginaSeo";
import { DISTRITOS_MADRID, DOMINIO, euros, precioServicio, SERVICIOS_SEO } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Precios de reformas en Madrid 2026 · ReformaMejor",
  description: "Cuánto cuesta reformar un piso, un baño, la cocina, las ventanas o el suelo en Madrid, partida a partida y con IVA. Compara el precio de cada reformista de tu zona.",
  alternates: { canonical: `${DOMINIO}/precios` },
};

export default function Precios() {
  return (
    <PaginaSeo migas={[{ t: "Inicio", href: "/" }, { t: "Precios" }]}>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Precios de reformas en Madrid en 2026</h1>
      <p className="mt-3 max-w-3xl text-lg text-stone-600">Calculados con las tarifas de referencia de la app, para un piso tipo de 80 m². Entra en cada uno para ver el desglose y en qué se va el dinero.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2" data-servicios>
        {SERVICIOS_SEO.map((s) => (
          <li key={s.slug}>
            <Link href={`/precios/${s.slug}`} className="flex items-baseline justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200 hover:ring-teal-600">
              <span className="font-semibold">{s.t}</span>
              <span className="text-sm text-stone-600">desde <b className="text-stone-900">{euros(precioServicio(s, "basica").total)}</b></span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-xl font-semibold">Reformas por distrito</h2>
      <div className="mt-3 flex flex-wrap gap-1.5 text-sm">
        {DISTRITOS_MADRID.map((d) => <Link key={d.slug} href={`/reformas-madrid/${d.slug}`} className="rounded-full bg-white px-3 py-1 ring-1 ring-stone-200 hover:ring-teal-600">{d.n}</Link>)}
      </div>
    </PaginaSeo>
  );
}
