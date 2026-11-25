import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaginaSeo } from "@/components/seo/PaginaSeo";
import { CALIDADES_SEO, DISTRITOS_MADRID, DOMINIO, euros, precioServicio, servicioSeo, SERVICIOS_SEO } from "@/lib/seo";

export const generateStaticParams = () => SERVICIOS_SEO.map((s) => ({ servicio: s.slug }));
const ANO = 2026;

export async function generateMetadata({ params }: { params: Promise<{ servicio: string }> }): Promise<Metadata> {
  const s = servicioSeo((await params).servicio);
  if (!s) return {};
  const media = precioServicio(s, "media").total;
  return {
    title: `${s.t} en Madrid: precio ${ANO} · ReformaMejor`,
    description: `¿Cuánto cuesta? ${s.t} en Madrid desde ${euros(precioServicio(s, "basica").total)} (calidad media ${euros(media)}, IVA incluido), partida a partida. Compara el precio de cada reformista de tu zona.`,
    alternates: { canonical: `${DOMINIO}/precios/${s.slug}` },
  };
}

export default async function PrecioServicio({ params }: { params: Promise<{ servicio: string }> }) {
  const s = servicioSeo((await params).servicio);
  if (!s) notFound();
  const precios = CALIDADES_SEO.map((c) => ({ ...c, ...precioServicio(s, c.id) }));
  const media = precios[1];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `¿Cuánto cuesta ${s.accion} en Madrid?`, acceptedAnswer: { "@type": "Answer", text: `Para un piso de ${s.m2} m², entre ${euros(precios[0].total)} en calidad básica y ${euros(precios[2].total)} en premium, IVA incluido. En calidad media, unos ${euros(media.total)}.` } },
      ...s.preguntas.map((p) => ({ "@type": "Question", name: p.q, acceptedAnswer: { "@type": "Answer", text: p.a } })),
    ],
  };
  return (
    <PaginaSeo migas={[{ t: "Inicio", href: "/" }, { t: "Precios", href: "/precios" }, { t: s.t }]} jsonLd={jsonLd}>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">¿Cuánto cuesta {s.accion} en Madrid en {ANO}?</h1>
      <p className="mt-3 max-w-3xl text-lg text-stone-600">{s.intro}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3" data-precios>
        {precios.map((p) => (
          <div key={p.id} className={`rounded-2xl bg-white p-5 ring-1 ${p.id === "media" ? "ring-2 ring-teal-600" : "ring-stone-200"}`}>
            <div className="text-sm font-semibold text-stone-500">Calidad {p.t.toLowerCase()}</div>
            <div className="mt-1 font-display text-3xl font-semibold">{euros(p.total)}</div>
            <div className="text-xs text-stone-500">IVA incluido · entre {euros(p.minimo)} y {euros(p.maximo)}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-500">Piso tipo de {s.m2} m², 2 dormitorios y 1 baño, calculado con las mismas tarifas de referencia que usa la app. El de tu casa sale con sus metros reales del Catastro.</p>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">En qué se va el dinero (calidad media)</h2>
          <ul className="mt-3 divide-y divide-stone-200 rounded-2xl bg-white ring-1 ring-stone-200">
            {media.capitulos.slice(0, 8).map((c) => (
              <li key={c.c} className="flex justify-between gap-3 px-4 py-2.5 text-sm"><span>{c.c}</span><span className="tabular-nums font-medium">{euros(c.importe)}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Qué incluye</h2>
          <ul className="mt-3 space-y-2 text-stone-700">
            {s.incluye.map((x) => <li key={x} className="flex gap-2"><span className="text-teal-700">✓</span>{x}</li>)}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Preguntas frecuentes</h2>
        <div className="mt-3 space-y-2">
          {s.preguntas.map((p) => (
            <details key={p.q} className="rounded-xl bg-white p-4 ring-1 ring-stone-200"><summary className="cursor-pointer font-medium">{p.q}</summary><p className="mt-2 text-sm text-stone-600">{p.a}</p></details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{s.t} por distrito de Madrid</h2>
        <div className="mt-3 flex flex-wrap gap-1.5 text-sm">
          {DISTRITOS_MADRID.map((d) => <Link key={d.slug} href={`/reformas-madrid/${d.slug}`} className="rounded-full bg-white px-3 py-1 ring-1 ring-stone-200 hover:ring-teal-600">{d.n}</Link>)}
        </div>
        <h2 className="mt-6 text-xl font-semibold">Otros precios</h2>
        <div className="mt-3 flex flex-wrap gap-1.5 text-sm">
          {SERVICIOS_SEO.filter((x) => x.slug !== s.slug).map((x) => <Link key={x.slug} href={`/precios/${x.slug}`} className="rounded-full bg-white px-3 py-1 ring-1 ring-stone-200 hover:ring-teal-600">{x.t}</Link>)}
        </div>
      </section>
    </PaginaSeo>
  );
}
