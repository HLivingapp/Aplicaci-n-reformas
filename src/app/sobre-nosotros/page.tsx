import type { Metadata } from "next";
import Link from "next/link";
import { publico } from "@/lib/base";

export const metadata: Metadata = {
  title: "Sobre Human Living · Quiénes somos",
  description: "Human Living nace desde dentro de nuestras ciudades para que tu proyecto de vivienda tenga, desde el primer día, los contactos, la experiencia y las herramientas que normalmente solo se descubren al final.",
};

const QUE_HACEMOS = [
  {
    i: "📐",
    t: "Diseñar mejor",
    d: "Un equipo de arquitectos te ayuda a sacar el máximo partido a tu casa: distribución, luz, materiales y presupuesto, antes de mover un tabique.",
  },
  {
    i: "🔑",
    t: "Comprar sin incidencias",
    d: "Expertos en vivienda te acompañan si estás comprando: qué mirar, qué se puede reformar y cuánto costará, para decidir con datos.",
  },
  {
    i: "🧭",
    t: "Reformar sin sorpresas",
    d: "Hemos sistematizado la reforma partida a partida para anticipar los problemas antes de que aparezcan y cumplir plazos competitivos.",
  },
  {
    i: "🤝",
    t: "Acceder a nuestra red",
    d: "Años de contactos, experiencias, técnicas y opciones a tu alcance: reformistas homologados, proveedores y una comunidad que ya pasó por lo mismo.",
  },
];

const PRINCIPIOS = [
  ["Claridad", "Precio partida a partida y qué incluye cada una, desde el primer día."],
  ["Anticipación", "Lo que suele descubrirse a mitad de obra, lo ves antes de empezar."],
  ["Consciencia", "Decisiones pensadas para tu vida en la casa, no solo para terminar la obra."],
  ["Tecnología con personas", "La IA ordena y acelera; las decisiones las tomas tú con profesionales de verdad."],
];

export default function SobreNosotros() {
  return (
    <div className="min-h-dvh bg-white text-stone-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/80 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publico("/icon.svg")} alt="" className="h-8 w-8" />
            <span className="font-display text-base font-semibold tracking-tight sm:text-lg">Human Living</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/comunidad" className="hidden rounded-full px-3 py-1.5 text-stone-300 hover:bg-white/10 hover:text-white sm:inline">Comunidad</Link>
            <Link href="/suscripcion" className="hidden rounded-full px-3 py-1.5 text-stone-300 hover:bg-white/10 hover:text-white sm:inline">Planes</Link>
            <Link href="/nuevo" className="whitespace-nowrap rounded-full bg-amber-400 px-4 py-1.5 font-semibold text-stone-900 hover:bg-amber-300">Calcular precio</Link>
          </nav>
        </div>
      </header>

      {/* Portada */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-600/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 md:py-20 lg:grid-cols-2">
          <div className="aparecer min-w-0">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Sobre Human Living</p>
            <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Nacemos desde dentro de <em className="font-medium text-amber-300">nuestras ciudades</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-300">
              Nos hemos especializado en reformar viviendas para poder sistematizar cada obra, anticipar los problemas y ayudar a cada persona a gestionar su proyecto de vivienda en tiempos competitivos y con la mayor consciencia posible.
            </p>
          </div>
          <div className="aparecer min-w-0 [animation-delay:200ms]">
            <div className="overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publico("/fotos/obra/cocina-salon.webp")} alt="Cocina abierta al salón en una reforma terminada" width={1024} height={683} fetchPriority="high" className="block aspect-[3/2] h-auto w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Manifiesto */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <p className="font-display text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
          Una casa se reforma una, dos o tres veces en la vida. Y casi siempre, al terminar, piensas: <span className="text-teal-700">«ojalá lo hubiera sabido desde el principio»</span>.
        </p>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-stone-700">
          <p>
            Te habría gustado conocer cómo funciona una obra, a quién llamar, qué preguntar y cuánto debería costar cada cosa. Tener contactos de confianza y herramientas desde el primer día, y no descubrirlos cuando ya es tarde.
          </p>
          <p>
            Eso es precisamente lo que hacemos. Gracias a la inteligencia artificial, no solo te ayudamos a diseñar mejor con nuestro equipo de arquitectos o a comprar sin incidencias con expertos en vivienda: queremos que accedas a <strong>años de contactos, experiencias, técnicas y opciones</strong>, y que puedas trazar un camino sencillo para conseguir lo que necesitas.
          </p>
        </div>
      </section>

      {/* Qué hacemos */}
      <section className="bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Qué hacemos</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Todo tu proyecto de vivienda, en un solo camino</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {QUE_HACEMOS.map((x) => (
              <div key={x.t} className="rounded-3xl bg-white p-7 ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-2xl ring-1 ring-stone-200">{x.i}</div>
                <h3 className="mt-5 text-lg font-semibold">{x.t}</h3>
                <p className="mt-2 text-stone-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">El equipo</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Personas que conocen la obra por dentro</h2>
            <p className="mt-4 text-lg text-stone-600">
              Arquitectos, técnicos de obra y expertos en vivienda que llevan años reformando casas en la ciudad. Lo que hemos aprendido en cada proyecto está ahora en la app, para que tú no tengas que aprenderlo a base de errores.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {PRINCIPIOS.map(([t, d]) => (
                <li key={t} className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="font-semibold">{t}</div>
                  <div className="mt-1 text-sm text-stone-600">{d}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* eslint-disable @next/next/no-img-element */}
            <img src={publico("/fotos/equipo/equipo-cocina.webp")} alt="Miembro del equipo de Human Living en una cocina reformada" loading="lazy" className="col-span-2 aspect-[3/2] w-full rounded-3xl object-cover" />
            <img src={publico("/fotos/obra/cocina.webp")} alt="Cocina reformada" loading="lazy" className="aspect-square w-full rounded-3xl object-cover" />
            <img src={publico("/fotos/obra/bano.webp")} alt="Baño reformado" loading="lazy" className="aspect-square w-full rounded-3xl object-cover" />
            {/* eslint-enable @next/next/no-img-element */}
          </div>
        </div>
      </section>

      {/* Llamada final */}
      <section className="bg-teal-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight">Empieza tu proyecto con ventaja</h2>
          <p className="max-w-xl text-teal-50">Calcula tu reforma en 3 minutos, pregunta en la comunidad y conoce a los reformistas homologados de tu zona.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/nuevo" className="rounded-xl bg-white px-6 py-3.5 font-semibold text-teal-800 hover:bg-teal-50">Calcular mi presupuesto gratis</Link>
            <Link href="/comunidad" className="rounded-xl px-6 py-3.5 font-semibold text-white ring-1 ring-white/40 hover:bg-white/10">Ir a la comunidad</Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-stone-500">
        <p className="flex flex-wrap justify-center gap-4">
          <span>© Human Living</span>
          <Link href="/" className="hover:underline">Inicio</Link>
          <Link href="/privacidad" className="hover:underline">Privacidad</Link>
          <Link href="/comunidad" className="hover:underline">Comunidad</Link>
          <Link href="/reformistas" className="hover:underline">Reformistas</Link>
        </p>
      </footer>
    </div>
  );
}
