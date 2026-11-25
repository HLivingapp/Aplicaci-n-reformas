import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaginaSeo } from "@/components/seo/PaginaSeo";
import { FICHAS_EJEMPLO } from "@/lib/red";
import { DISTRITOS_MADRID, distrito, DOMINIO, euros, precioServicio, servicioSeo, SERVICIOS_SEO } from "@/lib/seo";

export const generateStaticParams = () => DISTRITOS_MADRID.map((d) => ({ distrito: d.slug }));
const integral = servicioSeo("reforma-integral")!;

export async function generateMetadata({ params }: { params: Promise<{ distrito: string }> }): Promise<Metadata> {
  const d = distrito((await params).distrito);
  if (!d) return {};
  return {
    title: `Reformistas en ${d.n} (Madrid): precios y comparativa · ReformaMejor`,
    description: `Compara el presupuesto de los reformistas homologados que trabajan en ${d.n}. Reforma integral de 80 m² desde ${euros(precioServicio(integral, "basica").total)}, baño, cocina y ventanas, con IVA.`,
    alternates: { canonical: `${DOMINIO}/reformas-madrid/${d.slug}` },
  };
}

export default async function ReformasDistrito({ params }: { params: Promise<{ distrito: string }> }) {
  const d = distrito((await params).distrito);
  if (!d) notFound();
  // Reformistas homologados que trabajan en Madrid capital (en la demo, los de ejemplo)
  const n = FICHAS_EJEMPLO.filter((f) => f.zonas.some((z) => /madrid/i.test(z))).length;
  const tamanos = [60, 80, 100].map((m2) => ({ m2, ...precioServicio(integral, "media", m2) }));
  const servicios = SERVICIOS_SEO.filter((s) => s.slug !== "reforma-integral").map((s) => ({ s, p: precioServicio(s, "media") }));
  return (
    <PaginaSeo migas={[{ t: "Inicio", href: "/" }, { t: "Reformas en Madrid", href: "/precios" }, { t: d.n }]}>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Reformistas en {d.n}: compara precios para tu casa</h1>
      <p className="mt-3 max-w-3xl text-lg text-stone-600">Los reformistas homologados que trabajan en {d.n} han cargado sus tarifas en la app. Escribe tu dirección y ves el precio de cada uno para tu vivienda, sin pedir presupuestos uno a uno.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2" data-distrito>
        <div className="rounded-2xl bg-stone-900 p-5 text-white">
          <div className="font-display text-4xl font-semibold">{n}</div>
          <div className="text-sm text-stone-300">reformistas homologados trabajan en Madrid capital</div>
        </div>
        <div className="rounded-2xl bg-teal-700 p-5 text-white">
          <div className="font-display text-4xl font-semibold">{euros(tamanos[1].total)}</div>
          <div className="text-sm text-teal-100">reforma integral de 80 m² en calidad media (IVA incluido)</div>
        </div>
      </div>
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Reforma integral en {d.n} según los metros</h2>
        <ul className="mt-3 divide-y divide-stone-200 rounded-2xl bg-white ring-1 ring-stone-200">
          {tamanos.map((t) => <li key={t.m2} className="flex justify-between px-4 py-2.5 text-sm"><span>Piso de {t.m2} m²</span><span className="font-medium tabular-nums">{euros(t.total)}</span></li>)}
        </ul>
        <h2 className="mt-8 text-xl font-semibold">Otros trabajos en {d.n}</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {servicios.map(({ s, p }) => (
            <li key={s.slug}><Link href={`/precios/${s.slug}`} className="flex justify-between gap-2 rounded-xl bg-white px-4 py-2.5 text-sm ring-1 ring-stone-200 hover:ring-teal-600"><span>{s.t}</span><span className="font-medium">{euros(p.total)}</span></Link></li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-stone-500">Calidad media, piso tipo de 80 m². El de tu casa sale con sus metros reales del Catastro.</p>
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Trámites en {d.n}</h2>
        <p className="mt-2 text-stone-600">En el Ayuntamiento de Madrid, una reforma interior sin tocar estructura ni fachada suele ir con declaración responsable. <Link href="/tramites" className="text-teal-800 underline">Comprueba qué trámite necesitas</Link>.</p>
        <h2 className="mt-8 text-xl font-semibold">Otros distritos</h2>
        <div className="mt-3 flex flex-wrap gap-1.5 text-sm">
          {DISTRITOS_MADRID.filter((x) => x.slug !== d.slug).map((x) => <Link key={x.slug} href={`/reformas-madrid/${x.slug}`} className="rounded-full bg-white px-3 py-1 ring-1 ring-stone-200 hover:ring-teal-600">{x.n}</Link>)}
        </div>
      </section>
    </PaginaSeo>
  );
}
