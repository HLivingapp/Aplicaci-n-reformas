import Link from "next/link";
import { CIFRAS_PORTADA, COBRO, miles, OBJETIVO_RATIO, PRECIO_ACCESO, PRECIO_ACCESO_SUSCRITO, PRECIO_CITA, TEXTO_RED_PROVEEDORES } from "@/lib/comercializacion";
import { APP } from "@/lib/marca";
import { conBaseDeDatos } from "@/lib/modo";
import { GaleriaObra } from "@/components/portada/GaleriaObra";
import { Reportajes } from "@/components/portada/Reportajes";
import { ComparativaEjemplo } from "@/components/portada/ComparativaEjemplo";
import { CabeceraSitio } from "@/components/portada/CabeceraSitio";
import { TarjetaVideo } from "@/components/portada/TarjetaVideo";
import type { TemaPortada } from "@/lib/videos-portada";

const NOMBRE = APP.nombre;

const PASOS = [
  {
    n: "1",
    t: "Escribe tu dirección",
    href: "/nuevo",
    tema: "paso-1" as TemaPortada,
    area: "calcular mi presupuesto",
    d: "Consultamos el Catastro y rellenamos los metros, el año del edificio y la planta. Tú solo nos cuentas qué quieres cambiar.",
  },
  {
    n: "2",
    t: "Míralo al momento, aquí mismo",
    href: "/nuevo",
    tema: "paso-2" as TemaPortada,
    area: "calcular mi presupuesto",
    d: "Partida a partida, en la app y sin esperar a que te llegue un email. Elige acabados básicos, medios o premium y ve cómo cambia el precio.",
  },
  {
    n: "3",
    t: "Compara reformistas y pídeles cita",
    href: "/red",
    tema: "paso-3" as TemaPortada,
    area: "la red de reformistas",
    d: `Gratis ves cuántos reformistas hay en tu zona y el presupuesto medio. Con un pago único de ${PRECIO_ACCESO} ves el precio de cada uno para tu casa, chateas con ellos y les pides cita. Después contratas con quien elijas.`,
  },
];

const RECURSOS: { i: string; t: string; d: string; href: string; plan?: "Gratis" | "Básico" | "Pro" }[] = [
  { i: "🧾", t: "Precios de reformas", d: "Cuánto cuesta reformar un piso, un baño o la cocina en Madrid, por distrito.", href: "/precios", plan: "Gratis" },
  { i: "💬", t: "Foro de reformas", d: "Experiencias reales y preguntas que responden profesionales.", href: "/comunidad", plan: "Gratis" },
  { i: "🏛️", t: "Licencias y legalizaciones", d: "¿Licencia o declaración responsable? Qué trámite necesitas en Madrid.", href: "/tramites", plan: "Gratis" },
  { i: "🧱", t: "Materiales y precios", d: "Azulejos, suelos, grifería o ventanas por gama, con precios públicos.", href: "/materiales", plan: "Gratis" },
  { i: "🎨", t: "Diseña desde una foto", d: "Sube una foto de tu baño o cocina y mira materiales y precio.", href: "/disena", plan: "Gratis" },
  { i: "🏦", t: "Reforma en tu hipoteca", d: "Comparativa de entidades para financiar la obra.", href: "/hipoteca", plan: "Básico" },
  { i: "💶", t: "Ayudas y subvenciones", d: "Las ayudas para tu vivienda, con avisos cuando salen nuevas.", href: "/subvenciones", plan: "Básico" },
  { i: "🏢", t: "Comunidades de vecinos", d: "Fachadas, tejados, ascensores y sus subvenciones.", href: "/comunidades" },
  { i: "🤖", t: "Asistente IA de obra", d: "Revisa presupuestos y resuelve dudas técnicas y de trámites.", href: "/asistente", plan: "Pro" },
];

const PREGUNTAS = [
  { q: "¿Cuánto cuesta el presupuesto?", a: `Nada. Te unes gratis con tu email y ves tu presupuesto orientativo en la app al momento, sin que te lo manden por correo. También ves gratis cuántos reformistas homologados hay en tu zona y el presupuesto medio con sus tarifas.` },
  { q: "¿Qué pago para ver a los reformistas y quedar con ellos?", a: `Un pago único de ${PRECIO_ACCESO} (${PRECIO_ACCESO_SUSCRITO} si tienes suscripción), con tarjeta o Bizum. Con él ves la ficha y el precio de cada reformista para tu casa, chateas con ellos y les pides cita en tu casa, hasta ${COBRO.maxCitas}.` },
  { q: "¿Qué reformistas me proponéis?", a: "Los 3 homologados con mejor encaje para tu casa: que trabajen en tu zona y con más puntos de visibilidad, que se ganan vendiendo a clientes de la app y con buenas valoraciones de otros clientes." },
  { q: "¿Y si no puedo ir a la cita?", a: "Avísalo en la app con el motivo y no pasa nada. Si faltas sin avisar, pierdes tu acceso y tienes que volver a pagarlo para pedir más citas. Lo mismo vale para los reformistas: si faltan sin avisar, pierden la cita, sale un aviso en su ficha y pueden quedar suspendidos." },
  { q: "¿Cobráis algo sobre la obra?", a: "No. La obra la contratas y la pagas directamente al reformista que elijas. La app no cobra ningún porcentaje sobre ella." },
  { q: "¿El precio es definitivo?", a: "Es orientativo, con un margen de ±10 %. El reformista que elijas visita la vivienda, mide y te da el presupuesto final." },
  { q: "¿Quiénes son los reformistas?", a: "Empresas y autónomos de tu zona que han pasado la homologación: certificado al corriente de pago, seguro RSC (responsabilidad civil) y prevención de riesgos laborales en vigor. El REA no es obligatorio para todos: verás en su currículum si está inscrito, junto con su experiencia, formación, certificaciones y fotos de sus trabajos. Su nombre y contactos no se muestran hasta que acepta tu cita." },
  { q: "¿Y si cambio de opinión?", a: "Puedes cancelar el contrato desde la app. Se hace un acta con lo ejecutado hasta ese momento." },
];

export default function Inicio() {
  const empezar = "/nuevo";
  return (
    <div className="min-h-dvh bg-white text-stone-900">
      <CabeceraSitio />

      {/* Portada: dos puertas */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 md:pt-16">
          <h1 className="aparecer max-w-4xl font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Compara presupuestos de <em className="font-medium text-amber-300">reformistas de tu zona</em>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-300">Los reformistas homologados han cargado sus tarifas: escribe tu dirección y en 2 minutos ves lo que te costaría con cada uno. Y si eres profesional, consigue visitas con clientes que ya saben lo que cuesta su reforma.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2" data-puertas>
            <div className="aparecer rounded-3xl bg-white p-5 text-stone-900 shadow-2xl ring-1 ring-white/10 sm:p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-teal-700">Quiero reformar</div>
              <div className="mt-1 font-display text-2xl font-semibold">El precio de cada reformista para tu casa</div>
              <Link href={empezar} className="group mt-4 flex items-center gap-3 rounded-2xl bg-stone-100 p-2 pl-4 text-stone-500 ring-1 ring-stone-200 transition hover:ring-teal-600">
                <span className="text-xl">📍</span>
                <span className="min-w-0 flex-1 truncate">Escribe tu dirección…</span>
                <span className="shrink-0 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition group-hover:bg-teal-600">Comparar</span>
              </Link>
              <ul className="mt-4 space-y-1 text-sm text-stone-600">
                {["Gratis: cuántos hay en tu zona y el precio medio", "Tu presupuesto partida a partida, aquí mismo y no por email", `Por ${PRECIO_ACCESO} una vez: chat y citas con los que elijas`].map((x) => (
                  <li key={x} className="flex gap-2"><span className="text-teal-700">✓</span>{x}</li>
                ))}
              </ul>
            </div>
            <div className="aparecer rounded-3xl bg-indigo-950/60 p-5 ring-1 ring-indigo-300/30 [animation-delay:150ms] sm:p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Soy profesional</div>
              <div className="mt-1 font-display text-2xl font-semibold">Más visitas, mejor ratio de venta</div>
              <p className="mt-3 text-sm text-stone-300">Reformistas, oficios, proveedores y arquitectos. Alta gratis en 5 minutos: carga tus tarifas y aparece en las comparativas de tu zona.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10"><div className="font-display text-2xl font-semibold text-amber-300">{PRECIO_CITA}</div><div className="text-xs text-stone-400">solo por cita aceptada</div></div>
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10"><div className="font-display text-2xl font-semibold text-amber-300">1 de {OBJETIVO_RATIO}</div><div className="text-xs text-stone-400">visitas en obra: tu objetivo</div></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/reformistas" className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-stone-900 hover:bg-amber-300">Darme de alta gratis</Link>
                <Link href="/arquitectos" className="rounded-xl px-4 py-3 text-sm font-semibold text-indigo-100 ring-1 ring-white/20 hover:bg-white/10">Soy arquitecto</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contador */}
        <div className="relative border-t border-white/10 bg-white/[0.03]" data-contador>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 text-center sm:grid-cols-3">
            {[
              [`+${miles(CIFRAS_PORTADA.proveedores)}`, "proveedores con tarifas en tiempo real"],
              [miles(CIFRAS_PORTADA.comparadosMes), "presupuestos comparados este mes"],
              [`1 de cada ${CIFRAS_PORTADA.ratioRed}`, "citas acaba en obra"],
            ].map(([n, t]) => (
              <div key={t}><div className="font-display text-3xl font-semibold text-white">{n}</div><div className="text-sm text-stone-400">{t}</div></div>
            ))}
          </div>
        </div>
      </section>

      <ComparativaEjemplo empezar={empezar} />

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-teal-700">Cómo funciona</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold tracking-tight sm:text-5xl">De tu dirección al mejor reformista</h2>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {PASOS.map((p) => (
            <li key={p.n}>
              <TarjetaVideo tema={p.tema} titulo={p.t} href={p.href} area={p.area} className="group relative block h-full w-full overflow-hidden rounded-3xl bg-stone-50 p-7 ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl hover:ring-teal-600">
                <div className="font-display text-7xl font-semibold text-teal-700/15 transition group-hover:text-teal-700/30">{p.n}</div>
                <h3 className="mt-2 text-xl font-semibold">{p.t}</h3>
                <p className="mt-2 text-stone-600">{p.d}</p>
                <p className="mt-3 text-sm font-semibold text-teal-700 group-hover:underline">▶ Ver vídeo</p>
              </TarjetaVideo>
            </li>
          ))}
        </ol>
      </section>

      <GaleriaObra empezar={empezar} />
      <Reportajes empezar={empezar} />

      {/* Profesionales */}
      <section id="profesionales" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
        <div className="rounded-3xl bg-stone-950 p-8 text-white md:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Para reformistas, proveedores, estudios de arquitectura y arquitectos</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Más visitas con clientes que ya saben lo que cuesta su reforma</h2>
          <p className="mt-3 max-w-3xl text-stone-300">
            Carga tus tarifas y la app calcula tu presupuesto a cada cliente de tu zona. Te avisamos por email y WhatsApp, chateas gratis y solo pagas {PRECIO_CITA} cuando aceptas una cita con un cliente que ya te ha elegido. Sin comisión sobre la obra.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3" data-ratio-pro>
            {[
              [`1 de cada ${OBJETIVO_RATIO}`, "visitas convertidas en obra: el objetivo que te marcamos"],
              [`1 de cada ${CIFRAS_PORTADA.ratioRed}`, "lo que vende de media la red"],
              ["Tu panel", "citas del mes, ratio de venta, puesto en tu zona y qué mejorar"],
            ].map(([n, t]) => (
              <div key={n} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><div className="font-display text-3xl font-semibold text-amber-300">{n}</div><div className="mt-1 text-sm text-stone-300">{t}</div></div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-violet-500/15 p-5 ring-1 ring-violet-300/40">
            <div className="font-display text-2xl font-semibold text-violet-100">🤝 Invita a tus clientes: no te costará ni un euro</div>
            <p className="mt-2 text-stone-200">
              Desde tu área te damos un enlace para tus propios clientes. Calculan su presupuesto, podéis usar el contrato estándar y llevas los pagos por hitos y los avances. Con ellos no pagas citas y tu cliente no paga acceso.
            </p>
          </div>
          <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
            {[
              `Solo pagas ${PRECIO_CITA} por cita aceptada: chat gratis y sin comisión sobre la obra`,
              "Menos impagos: pagos por hitos solicitados y confirmados en la app",
              "Tus avances de obra, visibles para tu cliente",
              "Financiación para tus clientes y ayuda con la memoria técnica",
            ].map((x) => (
              <li key={x}><TarjetaVideo tema="profesionales" titulo={x} href="/reformistas" area="el alta de reformistas" className="flex h-full w-full gap-2 rounded-xl bg-white/5 p-3 text-stone-200 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-amber-300/50"><span className="text-amber-300">✓</span><span className="flex-1">{x}</span><span className="text-amber-300">▶</span></TarjetaVideo></li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/reformistas" className="inline-block rounded-xl bg-amber-400 px-5 py-3 font-semibold text-stone-900 hover:bg-amber-300">Soy reformista o proveedor</Link>
            <Link href="/arquitectos" className="inline-block rounded-xl border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Soy arquitecto o estudio</Link>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="text-center font-display text-4xl font-semibold tracking-tight">Tu presupuesto, gratis. Los reformistas de tu zona, {PRECIO_ACCESO} una vez</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-stone-600">Sin comisión sobre la obra: la pagas directamente al reformista que elijas. Y si quieres más servicios, suscripción sin permanencia.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "Gratis", p: "0 €", d: "Tu presupuesto partida a partida al momento, cuántos reformistas hay en tu zona y el presupuesto medio. Y el foro.", cls: "border-stone-200" },
            { n: "Acceso a los reformistas", p: `${PRECIO_ACCESO} una vez`, d: `${TEXTO_RED_PROVEEDORES} ${PRECIO_ACCESO_SUSCRITO} si tienes suscripción.`, cls: "border-teal-600 ring-2 ring-teal-100" },
            { n: "Suscripción", p: "desde 4,95 €/mes", d: "Básico: hipoteca, ayudas, seguimiento de obra y contrato. Pro (29,95 €/mes, o un 30 % menos pagando el año): además, asistente IA especializado en obra. La IA solo va en el Pro.", cls: "border-indigo-300" },
          ].map((x) => (
            <Link key={x.n} href="/suscripcion" className={`rounded-2xl border bg-white p-5 hover:shadow-sm ${x.cls}`}>
              <div className="font-semibold">{x.n}</div>
              <div className="mt-1 font-display text-4xl font-semibold tracking-tight">{x.p}</div>
              <p className="mt-2 text-sm text-stone-600">{x.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-6xl px-4 pt-16" data-recursos>
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Recursos para tu reforma</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Todo lo que necesitas saber antes de empezar</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RECURSOS.filter((r) => r.href !== "/comunidades").map((r) => (
            <Link key={r.t} href={r.href} className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-teal-600 hover:shadow-md">
              <span className="text-2xl">{r.i}</span>
              <span className="mt-2 font-semibold group-hover:underline">{r.t}</span>
              <span className="mt-1 flex-1 text-sm text-stone-600">{r.d}</span>
              {r.plan && <span className={`mt-3 self-start rounded-full px-2 py-0.5 text-xs font-medium ${r.plan === "Pro" ? "bg-indigo-50 text-indigo-800" : "bg-teal-50 text-teal-800"}`}>{r.plan === "Gratis" ? "Gratis" : `Plan ${r.plan}`}</span>}
            </Link>
          ))}
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
          <p className="max-w-xl text-teal-50">Únete gratis con tu email y míralo en 2 minutos, aquí mismo. Sin esperar a que te llegue por correo.</p>
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
          <Link href="/precios" className="hover:underline">Precios de reformas</Link>
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
