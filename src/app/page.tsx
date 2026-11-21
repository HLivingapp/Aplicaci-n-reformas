import Link from "next/link";
import { publico } from "@/lib/base";
import { conBaseDeDatos } from "@/lib/modo";
import { AntesDespues } from "@/components/portada/AntesDespues";
import { Calculadora } from "@/components/portada/Calculadora";
import { GaleriaObra } from "@/components/portada/GaleriaObra";

const NOMBRE = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA ?? "Human Living Reformas";

const PASOS = [
  {
    n: "1",
    t: "Escribe tu dirección",
    d: "Consultamos el Catastro y rellenamos los metros, el año del edificio y la planta. Tú solo nos cuentas qué quieres cambiar.",
  },
  {
    n: "2",
    t: "Recibe tu presupuesto al momento",
    d: "Partida a partida, con lo que incluye cada una y las cantidades de tu vivienda. Elige acabados básicos, medios o premium y ve cómo cambia el precio.",
  },
  {
    n: "3",
    t: "Te presentamos reformistas de tu zona",
    d: "Con tu presupuesto orientativo te ponemos en contacto con reformistas homologados y disponibles cerca de ti. Tú eliges con quién firmar.",
  },
];

const VENTAJAS = [
  { i: "📋", t: "Precio claro desde el principio", d: "Nada de «depende». Ves cada partida, qué incluye y qué no, antes de que nadie pise tu casa." },
  { i: "✅", t: "Reformistas homologados", d: "Comprobamos el registro de empresas acreditadas (REA), que estén al corriente con Hacienda y su seguro de responsabilidad civil." },
  { i: "🎨", t: "Tú eliges los acabados", d: "Suelos, baños, cocina, ventanas o puertas en tres niveles. El precio se actualiza al momento." },
  { i: "✍️", t: "Contrato estándar en la app", d: "El encargo y el contrato se firman en la app, con plazos, hitos de pago y los acabados que elegiste." },
  { i: "📆", t: "Sigues tu obra paso a paso", d: "Fases y plazos calculados para tu reforma, y todo el proyecto en un enlace privado." },
  { i: "🔒", t: "Tus datos, protegidos", d: "Guardados en la Unión Europea y conforme al RGPD. Tu teléfono no se comparte hasta que tú aceptas un presupuesto." },
];

const PREGUNTAS = [
  { q: "¿Cuánto cuesta el presupuesto?", a: "Nada. El presupuesto orientativo es gratis y sin compromiso. Para pedir presupuestos a la red de reformistas homologados está el plan Básico (5 €/mes) y, con el asistente IA de obra, el plan Pro (30 €/mes). Sin permanencia." },
  { q: "¿El precio es definitivo?", a: "Es orientativo, con un margen de ±10 %. El reformista que elijas visita la vivienda, mide y te da el presupuesto final." },
  { q: "¿Quiénes son los reformistas?", a: "Empresas y autónomos de tu zona que han pasado la homologación: REA, certificado de Hacienda al corriente y seguro de responsabilidad civil vigentes. El registro REA se vuelve a comprobar cada mes." },
  { q: "¿Y si cambio de opinión?", a: "Puedes cancelar el contrato desde la app. Se hace un acta con lo ejecutado hasta ese momento." },
];

export default function Inicio() {
  const empezar = "/nuevo";
  return (
    <div className="min-h-dvh bg-white text-stone-900">
      {/* Cabecera */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/80 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publico("/icon.svg")} alt="" className="h-8 w-8" />
            <span className="font-display text-base font-semibold leading-tight tracking-tight sm:text-lg">{NOMBRE}</span>
          </Link>
          <nav className="flex items-center gap-1 whitespace-nowrap text-sm">
                        <Link href="/sobre-nosotros" className="hidden rounded-full px-3 py-1.5 text-stone-300 hover:bg-white/10 hover:text-white lg:inline">Quiénes somos</Link>
            <Link href="/disena" className="hidden rounded-full px-3 py-1.5 text-stone-300 hover:bg-white/10 hover:text-white md:inline">Diseña</Link>
            <Link href="/comunidad" className="hidden rounded-full px-3 py-1.5 text-stone-300 hover:bg-white/10 hover:text-white md:inline">Comunidad</Link>
            <Link href="/suscripcion" className="hidden rounded-full px-3 py-1.5 text-stone-300 hover:bg-white/10 hover:text-white md:inline">Planes</Link>
            <Link href="/reformistas" className="hidden rounded-full px-3 py-1.5 text-stone-300 hover:bg-white/10 hover:text-white lg:inline">Soy reformista</Link>
            <Link href="/cliente" className="hidden rounded-full px-3 py-1.5 text-stone-300 sm:inline hover:bg-white/10 hover:text-white">Mi reforma</Link>
            <Link href={empezar} className="whitespace-nowrap rounded-full bg-amber-400 px-4 py-1.5 font-semibold text-stone-900 hover:bg-amber-300">Calcular precio</Link>
          </nav>
        </div>
      </header>

      {/* Portada */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 md:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div className="aparecer min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Reformas integrales y parciales en Madrid
            </p>
            <h1 className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Tu reforma, con precio claro <em className="font-medium text-amber-300">desde el primer día</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-300">
              Escribe tu dirección y en 3 minutos tienes tu presupuesto partida a partida. Con él te ponemos en contacto con <strong className="text-white">reformistas homologados de tu zona</strong>, y tú eliges con quién firmar.
            </p>
            <Link href={empezar} className="group mt-8 flex max-w-xl items-center gap-3 rounded-2xl bg-white p-2 pl-4 text-stone-500 shadow-2xl shadow-teal-900/40 ring-4 ring-white/10 transition hover:ring-amber-300/40">
              <span className="text-xl">📍</span>
              <span className="min-w-0 flex-1 truncate text-base">Escribe la dirección de tu casa…</span>
              <span className="shrink-0 rounded-xl bg-teal-700 px-4 py-3 sm:px-5 font-semibold text-white transition group-hover:bg-teal-600">Calcular precio</span>
            </Link>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-300">
              {["Gratis y sin compromiso", "Datos del Catastro al momento", "Sin dar tu teléfono"].map((x) => (
                <li key={x} className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span>{x}</li>
              ))}
            </ul>
          </div>

          <div className="relative min-w-0 aparecer [animation-delay:200ms]">
            <div className="overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publico("/fotos/obra/cocina-salon.webp")} alt="Cocina abierta al salón en una reforma integral terminada" width={1024} height={683} fetchPriority="high" className="block aspect-[3/2] h-auto w-full object-cover" />
            </div>
            <div className="flotar absolute -left-4 top-8 w-60 rounded-2xl bg-white p-4 text-stone-900 shadow-2xl sm:-left-10">
              <div className="text-xs text-stone-500">Piso de 80 m² · calidad media</div>
              <div className="mt-1 font-display text-2xl font-semibold">88.000 €</div>
              <div className="text-xs text-stone-500">+ IVA · todas las partidas desglosadas</div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full">
                <span className="w-[34%] bg-teal-700" /><span className="w-[22%] bg-teal-500" /><span className="w-[18%] bg-amber-400" /><span className="w-[14%] bg-amber-300" /><span className="flex-1 bg-stone-300" />
              </div>
            </div>
            <div className="flotar-lento absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 text-stone-900 shadow-2xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg">✓</span>
              <span className="text-sm"><b>4 reformistas homologados</b><br /><span className="text-xs text-stone-500">en tu zona · comprobados hoy</span></span>
            </div>
            <div className="flotar absolute -right-2 bottom-24 hidden rounded-2xl bg-stone-900/90 p-3 text-xs text-white shadow-2xl ring-1 ring-white/10 sm:block">
              <div className="text-stone-400">Tu obra</div>
              <div className="font-semibold">Instalaciones · 60 %</div>
              <div className="mt-1.5 h-1.5 w-32 rounded-full bg-white/15"><div className="h-1.5 w-[60%] rounded-full bg-emerald-400" /></div>
            </div>
          </div>
        </div>

        {/* Franja de garantías */}
        <div className="relative border-t border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-sm md:grid-cols-4">
            {[
              ["Partida a partida", "qué incluye y qué no"],
              ["REA + Hacienda + seguro", "comprobados en cada reformista"],
              ["Contrato y pagos por hitos", "firmados en la app"],
              ["Datos en la UE", "conforme al RGPD"],
            ].map(([a, b]) => (
              <div key={a}><div className="font-semibold text-white">{a}</div><div className="text-stone-400">{b}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculadora */}
      <section className="bg-gradient-to-b from-stone-100 to-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">¿Cuánto cuesta reformar?</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Haz la cuenta en un segundo</h2>
            <p className="mt-4 max-w-lg text-lg text-stone-600">
              Precios reales de reformas integrales en Madrid, por metro cuadrado y según los acabados. Después, la app lo calcula con tu vivienda: baños, cocina, falsos techos, climatización y ventanas, partida a partida.
            </p>
            <ul className="mt-6 space-y-3 text-stone-700">
              {["Cada partida con su medición y lo que incluye", "Marcas y modelos de referencia («o similar»)", "Cambia acabados y ve el precio al momento"].map((x) => (
                <li key={x} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs text-white">✓</span>{x}</li>
              ))}
            </ul>
          </div>
          <Calculadora />
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-teal-700">Cómo funciona</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold tracking-tight sm:text-5xl">De la idea al reformista adecuado</h2>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {PASOS.map((p) => (
            <li key={p.n} className="group relative overflow-hidden rounded-3xl bg-stone-50 p-7 ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="font-display text-7xl font-semibold text-teal-700/15 transition group-hover:text-teal-700/30">{p.n}</div>
              <h3 className="mt-2 text-xl font-semibold">{p.t}</h3>
              <p className="mt-2 text-stone-600">{p.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <GaleriaObra empezar={empezar} />

      {/* Antes y después */}
      <section className="bg-stone-950 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <AntesDespues />
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Antes de empezar</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Ves el después antes de mover un azulejo</h2>
            <p className="mt-4 text-lg text-stone-300">Eliges los acabados, ves cómo cambia el precio y llegas al reformista sabiendo exactamente lo que quieres.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["🧾", "Presupuesto de referencia", "para comparar cualquier oferta"],
                ["⚖️", "Comparador de ofertas", "capítulo a capítulo, con lo que falta"],
                ["📆", "Fases y plazos", "calculados para tu reforma"],
                ["💶", "Pagos por hitos", "confirmados por las dos partes"],
              ].map(([i, a, b]) => (
                <li key={a} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><div className="text-xl">{i}</div><div className="mt-1 font-semibold">{a}</div><div className="text-sm text-stone-400">{b}</div></li>
              ))}
            </ul>
            <Link href={empezar} className="mt-8 inline-block rounded-2xl bg-amber-400 px-6 py-3.5 font-semibold text-stone-900 hover:bg-amber-300">Empezar mi reforma</Link>
          </div>
        </div>
      </section>

      {/* Ventajas */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Por qué con nosotros</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Una reforma sin sorpresas</h2>
          <p className="mt-3 max-w-2xl text-lg text-stone-600">Todo lo que normalmente se descubre a mitad de obra, lo ves antes de empezar.</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VENTAJAS.map((v) => (
              <div key={v.t} className="rounded-3xl bg-stone-50 p-7 ring-1 ring-stone-200 transition hover:bg-white hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-stone-200">{v.i}</div>
                <h3 className="mt-4 text-lg font-semibold">{v.t}</h3>
                <p className="mt-1.5 text-stone-600">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diseña */}
      <section className="mx-auto max-w-6xl px-4 pt-16">
        <Link href="/disena" className="flex flex-col items-start gap-4 rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">Nuevo</p>
            <h2 className="mt-1 font-display text-4xl font-semibold tracking-tight">Diseña tu baño o tu cocina desde una foto</h2>
            <p className="mt-2 max-w-xl text-teal-50">Sube una foto, elige básico, medio o premium y mira los materiales y el precio al momento.</p>
          </div>
          <span className="shrink-0 rounded-xl bg-white px-5 py-3 font-semibold text-teal-800">Probar ahora →</span>
        </Link>
      </section>

      {/* Comunidad */}
      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Comunidad de reformas</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Lo que salió bien, lo que salió mal y cómo se resolvió</h2>
            <p className="mt-3 text-stone-600">
              Experiencias reales de gente que está reformando su casa. Pregunta tu problema y te responden otros clientes, reformistas homologados y nuestro asistente IA. Con un apartado de legalizaciones urbanísticas en Madrid.
            </p>
            <Link href="/comunidad" className="mt-5 inline-block rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-stone-800">Entrar en la comunidad</Link>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              ["❓", "Moho en la junta del plato de ducha a los dos meses", "✓ Resuelto por un profesional"],
              ["🏛️", "¿Licencia o declaración responsable para una reforma integral?", "🤖 Opinión IA con normativa"],
              ["👎", "La obra se alargó 5 semanas por las ventanas", "💬 Consejos de reformistas"],
            ].map(([i, t, e]) => (
              <li key={t}>
                <Link href="/comunidad" className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 hover:border-teal-600">
                  <span className="text-xl">{i}</span>
                  <span><span className="block font-medium text-stone-900">{t}</span><span className="text-xs text-stone-500">{e}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Planes */}
      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="text-center font-display text-4xl font-semibold tracking-tight">Empieza gratis. Suscríbete cuando lo necesites</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-stone-600">Sin permanencia. Los pagos de la obra van directamente al reformista que elijas.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "Gratis", p: "0 €", d: "Presupuesto orientativo partida a partida y comunidad.", cls: "border-stone-200" },
            { n: "Básico", p: "5 €/mes", d: "Suscríbete y accede a nuestra red de profesionales homologados. Pide presupuestos y compáralos con tu referencia.", cls: "border-teal-600 ring-2 ring-teal-100" },
            { n: "Pro", p: "30 €/mes", d: "Todo lo del Básico y un asistente IA especializado en obra: presupuestos, licencias en Madrid y dudas técnicas.", cls: "border-indigo-300" },
          ].map((x) => (
            <Link key={x.n} href="/suscripcion" className={`rounded-2xl border bg-white p-5 hover:shadow-sm ${x.cls}`}>
              <div className="font-semibold">{x.n}</div>
              <div className="mt-1 font-display text-4xl font-semibold tracking-tight">{x.p}</div>
              <p className="mt-2 text-sm text-stone-600">{x.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Reformistas */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 ring-1 ring-amber-100 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">¿Eres reformista?</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Clientes que ya saben lo que cuesta su reforma</h2>
            <p className="mt-3 text-stone-700">
              Recibe solicitudes de tu zona con el presupuesto orientativo, las medidas y los acabados elegidos. Menos visitas perdidas y más obras firmadas.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Sin pagar por cada contacto: comisión solo sobre las obras que firmas",
              "Homologación automática en minutos: REA, Hacienda y seguro",
              "Más visibilidad cuantas más obras haces con la app",
              "Contrato estándar y encargo firmados en la app",
            ].map((x) => (
              <li key={x} className="flex gap-2 rounded-xl bg-white/70 p-3"><span className="text-amber-700">✓</span>{x}</li>
            ))}
            <li>
              <Link href="/reformistas" className="mt-2 inline-block rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-stone-800">Homologar mi empresa</Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Preguntas */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="text-center font-display text-4xl font-semibold tracking-tight">Preguntas frecuentes</h2>
        <div className="mt-8 divide-y divide-stone-200 rounded-2xl border border-stone-200">
          {PREGUNTAS.map((p) => (
            <details key={p.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {p.q}
                <span className="ml-3 text-stone-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-stone-600">{p.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Link href="/sobre-nosotros" className="group grid grid-cols-1 items-center overflow-hidden rounded-3xl bg-stone-950 text-white md:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publico("/fotos/equipo/equipo-madrid-2.webp")} alt="El equipo de Human Living" loading="lazy" className="aspect-[3/2] h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Quiénes somos</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Lo que nos habría gustado saber antes de reformar</h2>
            <p className="mt-3 text-stone-300">Una casa se reforma pocas veces en la vida. Ponemos a tu alcance años de contactos, experiencia y herramientas desde el primer día.</p>
            <span className="mt-6 inline-block font-semibold text-amber-300 group-hover:underline">Conoce Human Living →</span>
          </div>
        </Link>
      </section>

      {/* Llamada final */}
      <section className="bg-teal-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight">¿Cuánto costaría reformar tu casa?</h2>
          <p className="max-w-xl text-teal-50">Descúbrelo en 3 minutos y conoce a los reformistas homologados de tu zona.</p>
          <Link href={empezar} className="rounded-xl bg-white px-6 py-3.5 font-semibold text-teal-800 hover:bg-teal-50">Calcular mi presupuesto gratis</Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-stone-500">
        {!conBaseDeDatos && (
          <p className="mx-auto mb-4 max-w-2xl rounded-lg bg-amber-50 p-3 text-amber-900">
            Versión de demostración: los datos se guardan solo en este navegador. Ejemplos:{" "}
            <Link href="/p/demo-marta-0000000000000000000003" className="underline">cliente eligiendo acabados</Link>,{" "}
            <Link href="/p/demo-carlos-000000000000000000004/presupuesto/p-demo-detalle" className="underline">presupuesto detallado</Link>,{" "}
            <Link href="/reformista/demo-reformista-0000000000000001" className="underline">reformista con documentos pendientes</Link>,{" "}
            <Link href="/empresa" className="underline">panel de la empresa</Link>.
          </p>
        )}
        <p className="flex flex-wrap justify-center gap-4">
          <span>© {NOMBRE}</span>
          <Link href="/sobre-nosotros" className="hover:underline">Quiénes somos</Link>
          <Link href="/privacidad" className="hover:underline">Privacidad</Link>
          <Link href="/comunidad" className="hover:underline">Comunidad</Link>
          <Link href="/suscripcion" className="hover:underline">Planes</Link>
          <Link href="/reformistas" className="hover:underline">Reformistas</Link>
          <Link href="/empresa" className="hover:underline">Acceso empresa</Link>
        </p>
      </footer>
    </div>
  );
}
