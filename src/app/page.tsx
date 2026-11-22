import Link from "next/link";
import { TEXTO_RESERVA } from "@/lib/comercializacion";
import { APP } from "@/lib/marca";
import { BENEFICIOS_CLIENTE } from "@/lib/beneficios";
import { ListaBeneficios } from "@/components/Beneficios";
import { publico } from "@/lib/base";
import { conBaseDeDatos } from "@/lib/modo";
import { AntesDespues } from "@/components/portada/AntesDespues";
import { Calculadora } from "@/components/portada/Calculadora";
import { GaleriaObra } from "@/components/portada/GaleriaObra";
import { CabeceraSitio } from "@/components/portada/CabeceraSitio";

const NOMBRE = APP.nombre;

const PASOS = [
  {
    n: "1",
    t: "Escribe tu dirección",
    d: "Consultamos el Catastro y rellenamos los metros, el año del edificio y la planta. Tú solo nos cuentas qué quieres cambiar.",
  },
  {
    n: "2",
    t: "Míralo al momento, aquí mismo",
    d: "Partida a partida, en la app y sin esperar a que te llegue un email. Elige acabados básicos, medios o premium y ve cómo cambia el precio.",
  },
  {
    n: "3",
    t: "Compara reformistas y quedad para una visita",
    d: "Los reformistas homologados han cargado sus tarifas: con el plan Básico (5 €/mes) ves el precio de cada uno para tu casa, eliges los que más te interesan y quedáis para una visita. Después te envían el presupuesto final y firmas el contrato en la app.",
  },
];

const VENTAJAS = [
  { i: "📋", t: "Precio claro desde el principio", d: "Nada de «depende». Ves cada partida, qué incluye y qué no, antes de que nadie pise tu casa." },
  { i: "✅", t: "Reformistas homologados", d: "Comprobamos el registro de empresas acreditadas (REA), su certificado al corriente de pago y su seguro RSC (responsabilidad civil)." },
  { i: "🎨", t: "Tú eliges los acabados", d: "Suelos, baños, cocina, ventanas o puertas en tres niveles. El precio se actualiza al momento." },
  { i: "✍️", t: "Contrato y seguimiento en la app", d: "Tras la visita, el reformista mete la cifra acordada y firmáis el contrato estándar en la app, con plazos, hitos de pago y fases de obra." },
  { i: "📆", t: "Fases y plazos claros", d: "Sabes qué se hace cada semana y cuándo toca cada pago, antes de empezar." },
  { i: "🔒", t: "Tus datos, protegidos", d: "Guardados en la Unión Europea y conforme al RGPD. Tu teléfono es opcional y ningún reformista lo ve hasta que tú lo eliges." },
];

const PREGUNTAS = [
  { q: "¿Cuánto cuesta el presupuesto?", a: "Nada. Te unes gratis con tu email y ves tu presupuesto orientativo en la app al momento, sin que te lo manden por correo. Para ver el precio de cada reformista homologado para tu casa y quedar con ellos está el plan Básico (5 €/mes) y, con el asistente IA de obra, el plan Pro (30 €/mes). Sin permanencia." },
  { q: "¿Qué pago al contratar la obra?", a: `Al firmar el contrato en la app pagas una reserva: ${TEXTO_RESERVA}. No es un coste extra: forma parte del precio y se descuenta de tu primer pago al reformista. El resto se lo pagas directamente a él, por fases.` },
  { q: "¿El precio es definitivo?", a: "Es orientativo, con un margen de ±10 %. El reformista que elijas visita la vivienda, mide y te da el presupuesto final." },
  { q: "¿Quiénes son los reformistas?", a: "Empresas y autónomos de tu zona que han pasado la homologación: REA, certificado al corriente de pago y seguro RSC (responsabilidad civil) vigentes. El registro REA se vuelve a comprobar cada mes." },
  { q: "¿Y si cambio de opinión?", a: "Puedes cancelar el contrato desde la app. Se hace un acta con lo ejecutado hasta ese momento." },
];

export default function Inicio() {
  const empezar = "/nuevo";
  return (
    <div className="min-h-dvh bg-white text-stone-900">
      <CabeceraSitio />

      {/* Portada */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 md:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div className="aparecer min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Más de 300 reformas ejecutadas en Madrid
            </p>
            <h1 className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Tu reforma, con precio claro <em className="font-medium text-amber-300">desde el primer día</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-300">
              Únete gratis con tu email, escribe tu dirección y en 3 minutos ves tu presupuesto partida a partida <strong className="text-white">aquí mismo, sin esperar a que te llegue por correo</strong>. Y con el plan Básico ves lo que te costaría con cada reformista homologado de tu zona.
            </p>
            <Link href={empezar} className="group mt-8 flex max-w-xl items-center gap-3 rounded-2xl bg-white p-2 pl-4 text-stone-500 shadow-2xl shadow-teal-900/40 ring-4 ring-white/10 transition hover:ring-amber-300/40">
              <span className="text-xl">📍</span>
              <span className="min-w-0 flex-1 truncate text-base">Escribe la dirección de tu casa…</span>
              <span className="shrink-0 rounded-xl bg-teal-700 px-4 py-3 sm:px-5 font-semibold text-white transition group-hover:bg-teal-600">Calcular precio</span>
            </Link>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-300">
              {["Gratis con tu email", "Datos del Catastro al momento", "Tu presupuesto en la app, no por email"].map((x) => (
                <li key={x} className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span>{x}</li>
              ))}
            </ul>
            <Link href="/#profesionales" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-amber-200 ring-1 ring-white/15 hover:bg-white/15">
              ¿Eres reformista o arquitecto? Invita a tus clientes sin coste →
            </Link>
            <Link href="/comunidades" className="ml-0 mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-sky-200 ring-1 ring-white/15 hover:bg-white/15 sm:ml-2">
              🏢 ¿Comunidad de vecinos? Fachadas y tejados →
            </Link>
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
              ["REA + al corriente de pago + seguro RSC", "comprobados en cada reformista"],
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
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Por qué con {NOMBRE}</p>
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

      {/* Beneficios */}
      <section id="beneficios" className="scroll-mt-16 bg-teal-50/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Beneficios de hacerlo con la app</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Más que un presupuesto</h2>
          <p className="mt-3 max-w-2xl text-lg text-stone-600">Lo que tienes al contratar tu reforma a través de la app.</p>
          <div className="mt-10"><ListaBeneficios items={BENEFICIOS_CLIENTE} /></div>
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
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Foro de reformas</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Lo que salió bien, lo que salió mal y cómo se resolvió</h2>
            <p className="mt-3 text-stone-600">
              Experiencias reales de gente que está reformando su casa. Pregunta tu problema y te responden otros clientes, reformistas homologados y el asistente IA. Con un apartado de legalizaciones urbanísticas en Madrid.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/comunidad" className="inline-block rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-stone-800">Entrar en el foro</Link>
              <Link href="/tramites" className="inline-block rounded-xl border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-900 hover:border-teal-600">🧭 ¿Qué trámite necesito?</Link>
            </div>
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
        <h2 className="text-center font-display text-4xl font-semibold tracking-tight">Tu presupuesto, gratis. La red de reformistas, desde 5 €/mes</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-stone-600">Sin permanencia. Los pagos de la obra van directamente al reformista que elijas.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "Gratis", p: "0 €", d: "Te unes con tu email y ves tu presupuesto partida a partida en la app, al momento. Y el foro.", cls: "border-stone-200" },
            { n: "Básico", p: "5 €/mes", d: "Accede a nuestra red de profesionales homologados: ves el presupuesto de cada uno para tu casa, calculado con sus tarifas, quedas con los que te interesen y firmas en la app.", cls: "border-teal-600 ring-2 ring-teal-100" },
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

      {/* Profesionales */}
      <section id="profesionales" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
        <div className="rounded-3xl bg-stone-950 p-8 text-white md:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Para reformistas, proveedores, estudios de arquitectura y arquitectos</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Clientes que ya saben lo que cuesta su reforma</h2>
          <p className="mt-3 max-w-3xl text-stone-300">
            Carga tus tarifas y la app calcula tu presupuesto a cada cliente de tu zona. Solo vas a la visita cuando ya te ha elegido; después metes la cifra acordada y la app genera el contrato.
          </p>
          <div className="mt-6 rounded-2xl bg-violet-500/15 p-5 ring-1 ring-violet-300/40">
            <div className="font-display text-2xl font-semibold text-violet-100">🤝 Invita a tus clientes: no te costará ni un euro</div>
            <p className="mt-2 text-stone-200">
              Desde tu área te damos un enlace para tus propios clientes. Calculan su presupuesto, firmáis el contrato en la app y llevas los pagos por hitos y los avances, y en esas obras no pagas fee ni comisión (ni tu cliente reserva). Solo pagas el fee en los clientes que te llegan por la app.
            </p>
          </div>
          <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Clientes de la app: solo pagas cuando firman, sin pagar por cada contacto",
              "Menos impagos: pagos por hitos solicitados y confirmados en la app",
              "Tus avances de obra, visibles para tu cliente",
              "Financiación para tus clientes y ayuda con la memoria técnica",
            ].map((x) => (
              <li key={x} className="flex gap-2 rounded-xl bg-white/5 p-3 text-stone-200 ring-1 ring-white/10"><span className="text-amber-300">✓</span>{x}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/reformistas" className="inline-block rounded-xl bg-amber-400 px-5 py-3 font-semibold text-stone-900 hover:bg-amber-300">Soy reformista o proveedor</Link>
            <Link href="/arquitectos" className="inline-block rounded-xl border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Soy arquitecto o estudio</Link>
          </div>
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

      {/* Llamada final */}
      <section className="bg-teal-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight">¿Cuánto costaría reformar tu casa?</h2>
          <p className="max-w-xl text-teal-50">Únete gratis con tu email y míralo en 3 minutos, aquí mismo. Sin esperar a que te llegue por correo.</p>
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
          <Link href="/human-living" className="hover:underline">★ Empresa destacada: Human Living</Link>
          <Link href="/privacidad" className="hover:underline">Privacidad</Link>
          <Link href="/aviso-legal" className="hover:underline">Aviso legal</Link>
          <Link href="/comunidad" className="hover:underline">Foro</Link>
          <Link href="/tramites" className="hover:underline">Trámites</Link>
          <Link href="/subvenciones" className="hover:underline">Subvenciones</Link>
          <Link href="/hipoteca" className="hover:underline">Hipoteca</Link>
          <Link href="/suscripcion" className="hover:underline">Planes</Link>
          <Link href="/reformistas" className="hover:underline">Reformistas</Link>
          <Link href="/arquitectos" className="hover:underline">Arquitectos</Link>
          <Link href="/empresa" className="hover:underline">Acceso empresa</Link>
        </p>
      </footer>
    </div>
  );
}
