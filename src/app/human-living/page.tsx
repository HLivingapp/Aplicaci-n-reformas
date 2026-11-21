import type { Metadata } from "next";
import Link from "next/link";
import { publico } from "@/lib/base";
import { CabeceraSitio } from "@/components/portada/CabeceraSitio";
import { APP } from "@/lib/marca";

export const metadata: Metadata = {
  title: `Human Living · Empresa destacada en ${APP.nombre}`,
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

const EDIFICIOS_CENTRO = [
  ["Forjados de madera", "Comprobamos vigas, apoyos y flechas antes de cargar el suelo con tabiques, bañeras o pavimentos pesados."],
  ["Muros de carga", "Sabemos qué se puede abrir, qué necesita refuerzo y cuándo hace falta proyecto técnico."],
  ["Bajantes y tuberías antiguas", "Plomo o fibrocemento: se sustituyen, y el amianto lo retira una empresa autorizada."],
  ["Electricidad sin tierra", "Instalaciones de otra época, sin toma de tierra ni potencia suficiente para una vivienda actual."],
  ["Humedades", "Patios de luces, plantas bajas y cubiertas: localizamos la causa antes de tapar nada."],
  ["Edificios protegidos", "Fachadas y carpinterías catalogadas, licencias y permisos de la comunidad, desde el primer día."],
] as const;

const PRINCIPIOS = [
  ["Claridad", "Precio partida a partida y qué incluye cada una, desde el primer día."],
  ["Anticipación", "Lo que suele descubrirse a mitad de obra, lo ves antes de empezar."],
  ["Consciencia", "Decisiones pensadas para tu vida en la casa, no solo para terminar la obra."],
  ["Tecnología con personas", "La IA ordena y acelera; las decisiones las tomas tú con profesionales de verdad."],
];

export default function SobreNosotros() {
  return (
    <div className="min-h-dvh bg-white text-stone-900">
      <CabeceraSitio />

      {/* Portada */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-600/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 md:py-20 lg:grid-cols-2">
          <div className="aparecer min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-200 ring-1 ring-amber-300/30">★ Empresa destacada en {APP.nombre}</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-amber-300">Sobre Human Living</p>
            <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Nacemos desde dentro de <em className="font-medium text-amber-300">nuestras ciudades</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-300">
              Nos hemos especializado en reformar viviendas para poder sistematizar cada obra, anticipar los problemas y ayudar a cada persona a gestionar su proyecto de vivienda en tiempos competitivos y con la mayor consciencia posible.
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <div className="font-display text-6xl font-semibold leading-none text-amber-300 sm:text-7xl">+300</div>
                <div className="mt-2 text-sm text-stone-300">obras ejecutadas en Madrid</div>
              </div>
              <p className="max-w-xs border-l border-white/15 pl-6 text-sm text-stone-300">Sobre todo en los barrios del centro, donde conocemos la arquitectura de cada edificio y sus problemas típicos.</p>
            </div>
          </div>
          <div className="aparecer min-w-0 [animation-delay:200ms]">
            <div className="overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publico("/fotos/equipo/malaga-equipo.webp")} alt="El equipo de Human Living" width={1024} height={683} fetchPriority="high" className="block aspect-[3/2] h-auto w-full object-cover" />
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

      {/* Experiencia en el centro de Madrid */}
      <section className="bg-stone-950 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Experiencia</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Más de <span className="text-amber-300">300 obras</span> en Madrid
            </h2>
            <p className="mt-4 text-lg text-stone-300">
              La mayoría, en edificios del centro: fincas antiguas, con su forma de construir y sus problemas de siempre. Por eso sabemos qué vamos a encontrar al abrir una pared, y lo incluimos en tu presupuesto desde el principio, no a mitad de obra.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="font-display text-4xl font-semibold text-amber-300">+300</div>
                <div className="mt-1 text-sm text-stone-400">obras ejecutadas en Madrid</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="font-display text-4xl font-semibold text-amber-300">Centro</div>
                <div className="mt-1 text-sm text-stone-400">donde más hemos trabajado</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Lo que ya sabemos de los edificios del centro</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {EDIFICIOS_CENTRO.map(([t, d]) => (
                <li key={t} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="font-semibold">{t}</div>
                  <div className="mt-1 text-sm text-stone-400">{d}</div>
                </li>
              ))}
            </ul>
          </div>
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
              Arquitectos, técnicos de obra y expertos en vivienda, con equipos en Madrid y Málaga, que llevan años reformando casas en la ciudad. Lo que hemos aprendido en cada proyecto está ahora en la app, para que tú no tengas que aprenderlo a base de errores.
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
            <img src={publico("/fotos/equipo/malaga-equipo-3.webp")} alt="El equipo de Human Living en Málaga" loading="lazy" className="col-span-2 aspect-[3/2] w-full rounded-3xl object-cover" />
            <img src={publico("/fotos/equipo/madrid-equipo.webp")} alt="Parte del equipo de Human Living en Madrid" loading="lazy" className="aspect-[3/4] w-full rounded-3xl object-cover object-top" />
            <img src={publico("/fotos/equipo/malaga-grupo.webp")} alt="Parte del equipo de Human Living en Málaga" loading="lazy" className="aspect-[3/4] w-full rounded-3xl object-cover" />
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
          <span>© {APP.nombre} · Human Living, empresa destacada</span>
          <Link href="/" className="hover:underline">Inicio</Link>
          <Link href="/privacidad" className="hover:underline">Privacidad</Link>
          <Link href="/comunidad" className="hover:underline">Comunidad</Link>
          <Link href="/reformistas" className="hover:underline">Reformistas</Link>
        </p>
      </footer>
    </div>
  );
}
