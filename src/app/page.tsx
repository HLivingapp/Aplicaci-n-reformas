import Link from "next/link";
import { publico } from "@/lib/base";
import { conBaseDeDatos } from "@/lib/modo";

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
      <header className="sticky top-0 z-20 border-b border-stone-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publico("/icon.svg")} alt="" className="h-8 w-8" />
            <span className="font-semibold tracking-tight">{NOMBRE}</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <a href="#como-funciona" className="hidden rounded-full px-3 py-1.5 text-stone-600 hover:bg-stone-100 sm:inline">Cómo funciona</a>
            <Link href="/comunidad" className="hidden rounded-full px-3 py-1.5 text-stone-600 hover:bg-stone-100 md:inline">Comunidad</Link>
            <Link href="/suscripcion" className="hidden rounded-full px-3 py-1.5 text-stone-600 hover:bg-stone-100 md:inline">Planes</Link>
            <Link href="/reformistas" className="hidden rounded-full px-3 py-1.5 text-stone-600 hover:bg-stone-100 sm:inline">Soy reformista</Link>
            <Link href="/cliente" className="rounded-full px-3 py-1.5 text-stone-600 hover:bg-stone-100">Mi reforma</Link>
            <Link href={empezar} className="rounded-full bg-teal-700 px-4 py-1.5 font-medium text-white hover:bg-teal-800">Calcular precio</Link>
          </nav>
        </div>
      </header>

      {/* Portada */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:pt-20">
          <div>
            <p className="mb-3 inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800">Reformas integrales y parciales · Madrid</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Sabe lo que cuesta tu reforma <span className="text-teal-700">antes de llamar a nadie</span>
            </h1>
            <p className="mt-5 text-lg text-stone-600">
              Calcula gratis tu presupuesto orientativo, partida a partida. Con él te ponemos en contacto con <strong className="text-stone-900">reformistas homologados disponibles en tu zona</strong>.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={empezar} className="rounded-xl bg-teal-700 px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800">
                Calcular mi presupuesto gratis
              </Link>
              <a href="#como-funciona" className="rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-center text-base font-medium text-stone-700 hover:border-stone-400">
                Ver cómo funciona
              </a>
            </div>
            <p className="mt-4 text-sm text-stone-500">En 3 minutos · Gratis · Sin compromiso</p>
          </div>

          {/* Tarjeta de ejemplo */}
          <div className="relative">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-teal-200/40 blur-2xl" />
            <div className="relative rounded-3xl border border-stone-200 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Piso de 78 m² · 2 dormitorios · 2 baños</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">Ejemplo</span>
              </div>
              <div className="mt-3 rounded-2xl bg-teal-700 p-4 text-white">
                <div className="text-sm opacity-80">Tu presupuesto orientativo</div>
                <div className="text-3xl font-semibold">76.500 € – 93.500 €</div>
                <div className="text-xs opacity-80">+ IVA · reforma integral, acabados medios</div>
              </div>
              <ul className="mt-3 divide-y divide-stone-100 text-sm">
                {[
                  ["Demolición y albañilería", "Toda la vivienda, con contenedores"],
                  ["Electricidad", "Instalación nueva con boletín"],
                  ["Baños", "2 baños completos, colocados"],
                  ["Cocina", "Muebles, encimera y electrodomésticos"],
                  ["Suelos", "54 m² de laminado AC5 hidrófugo"],
                ].map(([a, b]) => (
                  <li key={a} className="flex items-center justify-between gap-3 py-2">
                    <span className="font-medium">{a}</span>
                    <span className="text-right text-xs text-stone-500">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-stone-50 p-3 text-sm">
                <span className="text-xl">👷</span>
                <span><strong>4 reformistas homologados</strong> disponibles en tu zona</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confianza */}
      <section className="border-y border-stone-100 bg-stone-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-center text-sm text-stone-600 md:grid-cols-4">
          <div><div className="text-lg font-semibold text-stone-900">Gratis</div>presupuesto orientativo</div>
          <div><div className="text-lg font-semibold text-stone-900">REA + Hacienda</div>en cada reformista</div>
          <div><div className="text-lg font-semibold text-stone-900">Contrato estándar</div>firmado en la app</div>
          <div><div className="text-lg font-semibold text-stone-900">Datos en la UE</div>conforme al RGPD</div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Así de fácil</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-stone-600">De la idea al reformista adecuado, sin visitas a ciegas ni presupuestos imposibles de comparar.</p>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {PASOS.map((p) => (
            <li key={p.n} className="rounded-2xl border border-stone-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-lg font-semibold text-white">{p.n}</div>
              <h3 className="mt-4 text-lg font-semibold">{p.t}</h3>
              <p className="mt-2 text-sm text-stone-600">{p.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link href={empezar} className="inline-block rounded-xl bg-teal-700 px-6 py-3.5 font-semibold text-white hover:bg-teal-800">Empezar ahora</Link>
        </div>
      </section>

      {/* Ventajas */}
      <section className="bg-stone-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">Una reforma sin sorpresas</h2>
          <p className="mt-2 max-w-2xl text-stone-300">Todo lo que normalmente se descubre a mitad de obra, lo ves antes de empezar.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VENTAJAS.map((v) => (
              <div key={v.t} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="text-2xl">{v.i}</div>
                <h3 className="mt-3 font-semibold">{v.t}</h3>
                <p className="mt-1 text-sm text-stone-300">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comunidad */}
      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Comunidad de reformas</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Lo que salió bien, lo que salió mal y cómo se resolvió</h2>
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
        <h2 className="text-center text-3xl font-semibold tracking-tight">Empieza gratis. Suscríbete cuando lo necesites</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-stone-600">Sin permanencia. Los pagos de la obra van directamente al reformista que elijas.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "Gratis", p: "0 €", d: "Presupuesto orientativo partida a partida y comunidad.", cls: "border-stone-200" },
            { n: "Básico", p: "5 €/mes", d: "Suscríbete y accede a nuestra red de profesionales homologados. Pide presupuestos y compáralos con tu referencia.", cls: "border-teal-600 ring-2 ring-teal-100" },
            { n: "Pro", p: "30 €/mes", d: "Todo lo del Básico y un asistente IA especializado en obra: presupuestos, licencias en Madrid y dudas técnicas.", cls: "border-indigo-300" },
          ].map((x) => (
            <Link key={x.n} href="/suscripcion" className={`rounded-2xl border bg-white p-5 hover:shadow-sm ${x.cls}`}>
              <div className="font-semibold">{x.n}</div>
              <div className="mt-1 text-3xl font-semibold tracking-tight">{x.p}</div>
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
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Clientes que ya saben lo que cuesta su reforma</h2>
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
        <h2 className="text-center text-3xl font-semibold tracking-tight">Preguntas frecuentes</h2>
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

      {/* Llamada final */}
      <section className="bg-teal-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">¿Cuánto costaría reformar tu casa?</h2>
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
