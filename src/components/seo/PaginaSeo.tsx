import Link from "next/link";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { CIFRAS_PORTADA, PRECIO_ACCESO } from "@/lib/comercializacion";

/** Marco común de las páginas para buscadores: cabecera, llamada a comparar y datos estructurados. */
export function PaginaSeo({ migas, children, jsonLd }: { migas: { t: string; href?: string }[]; children: React.ReactNode; jsonLd?: object }) {
  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6">
        <nav className="text-xs text-stone-500" aria-label="Migas">
          {migas.map((m, i) => (
            <span key={m.t}>{i > 0 && " › "}{m.href ? <Link href={m.href} className="hover:underline">{m.t}</Link> : m.t}</span>
          ))}
        </nav>
        {children}
        <LlamadaComparar />
      </main>
    </div>
  );
}

export function LlamadaComparar() {
  return (
    <section className="mt-10 rounded-3xl bg-stone-950 p-6 text-white sm:p-8">
      <h2 className="font-display text-3xl font-semibold tracking-tight">Compara el precio de cada reformista para tu casa</h2>
      <p className="mt-2 max-w-2xl text-stone-300">Escribe tu dirección y en 2 minutos ves tu presupuesto partida a partida, cuántos reformistas homologados hay en tu zona y el precio medio. Gratis. Con un pago único de {PRECIO_ACCESO} ves el precio de cada uno, chateas y pides cita.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/nuevo" className="rounded-xl bg-teal-600 px-5 py-3 font-semibold hover:bg-teal-500">Comparar presupuestos gratis</Link>
        <Link href="/reformistas" className="rounded-xl px-5 py-3 font-semibold ring-1 ring-white/30 hover:bg-white/10">Soy profesional: quiero visitas</Link>
      </div>
      <p className="mt-3 text-xs text-stone-400">Más de {CIFRAS_PORTADA.proveedores} proveedores con sus tarifas en tiempo real.</p>
    </section>
  );
}
