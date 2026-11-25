"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { conBaseDeDatos } from "@/lib/modo";
import { ahorroAnual, DESCUENTO_ANUAL, guardarSuscripcion, importe, PLANES, precioMesAnual, precioPlan, useSuscripcion, type Periodo, type Plan } from "@/lib/suscripcion";
import { useExigirRegistro } from "@/components/Registro";

export default function Planes() {
  return (
    <Suspense fallback={<main className="p-6 text-stone-500">Cargando…</main>}>
      <VistaPlanes />
    </Suspense>
  );
}

const PREGUNTAS = [
  { q: "¿Tengo permanencia?", a: "Con el pago mensual, no: cancelas cuando quieras desde la app, sin llamadas. El plan Pro también se puede pagar por año con un 30 % de descuento; en ese caso pagas el año por adelantado." },
  { q: "¿Qué plan incluye el asistente IA?", a: "Solo el plan Pro. El Básico da acceso a los servicios (hipoteca, ayudas, seguimiento, contrato) pero no al asistente IA de obra." },
  { q: "¿Y para ver a los reformistas y pedirles cita?", a: "Eso va aparte: una cuota única de 29,90 €, que con cualquier suscripción se queda en 19,90 €. La obra la pagas directamente al reformista que elijas: la app no cobra nada sobre ella." },
  { q: "¿Qué gano frente a buscar por mi cuenta?", a: "Reformistas comprobados (certificado al corriente de pago, seguro RSC y prevención de riesgos; REA si lo tienen), un precio de referencia para comparar sus ofertas, contrato estándar y el seguimiento de la obra en un solo sitio." },
  { q: "¿El asistente IA sustituye a un técnico?", a: "No. Te orienta, te ayuda a preparar las preguntas y revisa presupuestos, pero las decisiones técnicas y los trámites los confirma un profesional o el Ayuntamiento." },
];

function VistaPlanes() {
  const s = useSuscripcion();
  const router = useRouter();
  const volver = useSearchParams().get("volver");
  const [pagando, setPagando] = useState<Plan | null>(null);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const { exigir, modal } = useExigirRegistro("Únete gratis con tu email y después elige tu plan.");

  const activar = (plan: Plan) => {
    guardarSuscripcion(plan, periodo);
    setPagando(null);
    if (volver && volver.startsWith("/")) router.push(volver);
  };

  return (
    <div className="min-h-dvh bg-stone-50">
      {modal}
      <CabeceraPublica />
      <section className="bg-gradient-to-b from-amber-50 to-stone-50">
        <div className="mx-auto max-w-5xl px-4 pb-4 pt-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Reforma con los mejores, sin sorpresas</h1>
          <p className="mx-auto mt-3 max-w-2xl text-stone-600">Tu presupuesto es gratis y lo ves al momento en la app. Con el Básico tienes los servicios para tu reforma: hipoteca, ayudas, seguimiento de la obra y contrato, y el acceso a los reformistas de tu zona a 19,90 €. Con el Pro, además, nuestro asistente IA especializado en obra.</p>
          <p className="mt-2 text-sm text-stone-500">Mensual sin permanencia · Pro anual con un {DESCUENTO_ANUAL} % de descuento · IVA incluido</p>
          <div className="mt-5 inline-flex rounded-full bg-white p-1 text-sm ring-1 ring-stone-200" data-periodo>
            {(["mes", "año"] as const).map((x) => (
              <button key={x} onClick={() => setPeriodo(x)} className={`rounded-full px-4 py-1.5 font-medium ${periodo === x ? "bg-stone-900 text-white" : "text-stone-600"}`}>
                {x === "mes" ? "Mensual" : <>Anual <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${periodo === x ? "bg-indigo-400 text-white" : "bg-indigo-100 text-indigo-800"}`}>Pro −{DESCUENTO_ANUAL} %</span></>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLANES.map((p) => {
            const actual = s?.plan === p.id;
            const anual = periodo === "año" && !!p.anual;
            return (
              <div key={p.id} className={`flex flex-col rounded-2xl border bg-white p-5 ${p.destacado ? "border-teal-600 ring-2 ring-teal-100" : "border-stone-200"}`}>
                {p.destacado && <div className="mb-2 self-start rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-medium text-white">El más elegido</div>}
                <h2 className="text-lg font-semibold">{p.nombre}</h2>
                <div className="mt-1">
                  {anual && <span className="mr-2 text-lg text-stone-400 line-through">{precioPlan(p)}</span>}
                  <span className="text-4xl font-semibold tracking-tight">{anual ? precioMesAnual(p) : precioPlan(p)}</span>
                  <span className="text-stone-500"> /mes</span>
                </div>
                {anual ? (
                  <p className="text-xs font-medium text-indigo-800" data-anual>{importe(p.anual!)} al año · ahorras {importe(ahorroAnual(p))}</p>
                ) : periodo === "año" && p.precio > 0 ? (
                  <p className="text-xs text-stone-400">Solo mensual</p>
                ) : p.anual ? (
                  <p className="text-xs text-stone-400">o {precioMesAnual(p)}/mes pagando el año (−{DESCUENTO_ANUAL} %)</p>
                ) : null}
                <p className="mt-2 text-sm font-medium text-stone-700">{p.lema}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-stone-600">
                  {p.incluye.map((x) => (
                    <li key={x} className={`flex gap-2 ${x.startsWith("🤖") ? "rounded-lg bg-indigo-50 p-1.5 font-medium text-indigo-900" : ""}`}><span className="text-teal-700">✓</span><span>{x}</span></li>
                  ))}
                  {p.noIncluye?.map((x) => (
                    <li key={x} className="flex gap-2 text-stone-400"><span>✕</span><span>{x}</span></li>
                  ))}
                </ul>
                <div className="mt-5">
                  {actual ? (
                    <div className="rounded-xl bg-stone-100 py-2.5 text-center text-sm font-medium text-stone-700">Tu plan actual</div>
                  ) : p.id === "gratis" ? (
                    s && s.plan !== "gratis" ? (
                      <button onClick={() => confirm("¿Cancelar tu suscripción? Mantienes el presupuesto y el foro.") && activar("gratis")} className="w-full rounded-xl border border-stone-300 py-2.5 text-sm hover:bg-stone-50">Cancelar suscripción</button>
                    ) : (
                      <Link href="/nuevo" className="block rounded-xl border border-stone-300 py-2.5 text-center text-sm hover:bg-stone-50">Calcular mi presupuesto</Link>
                    )
                  ) : (
                    <button onClick={() => exigir(() => setPagando(p.id))} className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white ${p.id === "pro" ? "bg-indigo-700 hover:bg-indigo-800" : "bg-teal-700 hover:bg-teal-800"}`}>
                      {anual ? `Suscribirme por ${importe(p.anual!)}/año` : `Suscribirme por ${precioPlan(p)}/mes`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {pagando && (
          <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setPagando(null)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const p = PLANES.find((x) => x.id === pagando)!;
                const anual = periodo === "año" && !!p.anual;
                return (
                  <>
                    <h2 className="text-lg font-semibold">Plan {p.nombre} · {anual ? `${importe(p.anual!)}/año` : `${precioPlan(p)}/mes`}</h2>
                    <p className="mt-2 text-sm text-stone-600">{anual ? `El pago con tarjeta se hará en una pasarela segura (Stripe). Pagas hoy el año entero (${DESCUENTO_ANUAL} % de descuento) y se renueva cada año salvo que lo canceles antes.` : "El pago con tarjeta se hará en una pasarela segura (Stripe). Primer cobro hoy y luego cada mes; cancelas cuando quieras."}</p>
                  </>
                );
              })()}
              {conBaseDeDatos ? (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">El pago con tarjeta estará disponible muy pronto.</p>
              ) : (
                <>
                  <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Esto es una demostración: no se cobra nada ni se piden datos de tarjeta. Pulsa para ver cómo funciona con el plan activo.</p>
                  <button onClick={() => activar(pagando)} className="mt-4 w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-stone-800">Activar en la demo</button>
                </>
              )}
              <button onClick={() => setPagando(null)} className="mt-2 w-full py-2 text-sm text-stone-500">Ahora no</button>
            </div>
          </div>
        )}

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { i: "🧾", t: "Precio de referencia", d: "Antes de hablar con nadie sabes lo que debería costar tu reforma, partida a partida." },
            { i: "⚖️", t: "Compara ofertas", d: "Cada presupuesto que recibes se compara con tu referencia: ves qué está caro y qué falta." },
            { i: "⭐", t: "Valoraciones por fase", d: "Los clientes valoran al reformista en cada fase de la obra, no solo al final." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
              <div className="text-xl">{x.i}</div>
              <div className="mt-1 font-semibold">{x.t}</div>
              <div className="mt-1 text-stone-600">{x.d}</div>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Preguntas frecuentes</h2>
          <div className="mt-4 space-y-2">
            {PREGUNTAS.map((p) => (
              <details key={p.q} className="rounded-xl border border-stone-200 bg-white p-4">
                <summary className="cursor-pointer font-medium">{p.q}</summary>
                <p className="mt-2 text-sm text-stone-600">{p.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
