"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { useExigirRegistro } from "@/components/Registro";
import { euros } from "@/lib/calc";
import { FICHAS_COMUNIDADES, type FichaRed } from "@/lib/red";

const TRABAJOS = [
  { valor: "fachada", texto: "Rehabilitar la fachada", especialidad: "Fachadas y rehabilitación de edificios" },
  { valor: "sate", texto: "Aislar la fachada (SATE)", especialidad: "Aislamiento SATE" },
  { valor: "tejado", texto: "Tejado de teja", especialidad: "Tejados y cubiertas" },
  { valor: "cubierta", texto: "Cubierta plana o azotea", especialidad: "Impermeabilización" },
  { valor: "patio", texto: "Patio de luces", especialidad: "Fachadas y rehabilitación de edificios" },
  { valor: "balcones", texto: "Balcones y cornisas", especialidad: "Fachadas y rehabilitación de edificios" },
] as const;

const INSPECCION = ["Favorable", "Desfavorable", "Pendiente de pasar", "No lo sé"] as const;
const JUNTA = ["Ya aprobada en junta", "Hay que llevarla a junta", "Solo queremos informarnos"] as const;
const ZONAS = ["Madrid", "Málaga"] as const;

const PASOS = [
  ["🏢", "Contáis el edificio y la obra", "Viviendas, plantas, qué hay que arreglar y cómo salió la inspección técnica (ITE/IEE)."],
  ["🤝", "Elegís especialistas homologados", "Empresas de fachadas y tejados con certificado al corriente de pago, seguro RSC y prevención de riesgos comprobados."],
  ["📋", "Visita técnica y presupuesto para la junta", "Cada uno visita el edificio y mete su presupuesto en la app, listo para presentarlo a los vecinos."],
  ["✍️", "Acuerdo de junta, contrato y firma en la app", "Con el acta aprobada se genera el contrato estándar y se firma en la app. Los pagos de la obra van directos a la empresa."],
  ["📸", "Seguimiento para todos los vecinos", "Fotos y avances de cada fase, para el presidente, el administrador y quien quiera mirarlo."],
];

const NECESARIO = [
  ["Acta de la junta", "Que apruebe la obra, el presupuesto elegido y cómo se reparte (derrama)."],
  ["Informe o proyecto técnico", "Según la obra, una memoria o proyecto firmado por arquitecto. Podéis encargarlo a un estudio de arquitectura de la app."],
  ["Licencia y andamio", "Licencia o declaración responsable del ayuntamiento y, si el andamio ocupa la acera, permiso de ocupación de vía pública. Lo gestiona la empresa."],
  ["Ayudas de rehabilitación", "Si la obra mejora el aislamiento o la accesibilidad, puede haber subvenciones y deducciones para los vecinos."],
];

/** Fachadas y tejados para comunidades de propietarios y administradores de fincas. */
export default function Comunidades() {
  const { exigir, modal } = useExigirRegistro("Únete gratis para pedir visitas a especialistas para tu comunidad de vecinos.");
  const [zona, setZona] = useState<(typeof ZONAS)[number]>("Madrid");
  const [trabajos, setTrabajos] = useState<string[]>(["fachada"]);
  const [viviendas, setViviendas] = useState(16);
  const [plantas, setPlantas] = useState(5);
  const [inspeccion, setInspeccion] = useState<string>("No lo sé");
  const [junta, setJunta] = useState<string>("Hay que llevarla a junta");
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const [importe, setImporte] = useState(120000);

  const especialidades = TRABAJOS.filter((t) => trabajos.includes(t.valor)).map((t) => t.especialidad as string);
  const encajan = useMemo(
    () =>
      FICHAS_COMUNIDADES.filter((f) => (zona === "Málaga" ? f.zonas.includes("Málaga") : !f.zonas.includes("Málaga"))).filter((f) => !especialidades.length || f.especialidades.some((e) => especialidades.includes(e))),
    [zona, especialidades],
  );
  const alterna = (lista: string[], v: string) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      {modal}
      <section className="bg-gradient-to-b from-sky-50 to-stone-50">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-10">
          <div className="text-sm font-semibold uppercase tracking-wide text-sky-800">Para comunidades de vecinos y administradores de fincas</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Fachadas y tejados para tu comunidad de vecinos, con especialistas homologados</h1>
          <p className="mt-3 max-w-2xl text-stone-600">Rehabilitación de fachadas, aislamiento SATE, tejados, azoteas y patios de luces. Elegís a la empresa, recibís el presupuesto en la app para la junta y lo firmáis todo aquí, con seguimiento para todos los vecinos.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <a href="#pedir" className="rounded-xl bg-teal-700 px-4 py-2.5 font-semibold text-white hover:bg-teal-800">Pedir visitas para mi comunidad de vecinos</a>
            <Link href="/subvenciones?para=comunidades" className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 font-medium hover:bg-stone-50">💶 Ver subvenciones para comunidades de vecinos</Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PASOS.map(([i, t, d], n) => (
            <li key={t} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="text-2xl">{i}</div>
              <div className="mt-1 text-xs font-semibold text-stone-400">Paso {n + 1}</div>
              <div className="font-semibold leading-snug">{t}</div>
              <p className="mt-1 text-xs text-stone-600">{d}</p>
            </li>
          ))}
        </ol>

        <section id="pedir" className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-xl font-semibold">Vuestro edificio</h2>
            <div className="flex gap-2">
              {ZONAS.map((z) => (
                <button key={z} onClick={() => setZona(z)} className={`rounded-full px-4 py-1.5 text-sm ${zona === z ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>{z}</button>
              ))}
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">¿Qué hay que hacer?</div>
              <div className="flex flex-wrap gap-1.5">
                {TRABAJOS.map((t) => (
                  <button key={t.valor} onClick={() => setTrabajos(alterna(trabajos, t.valor))} className={`rounded-full px-3 py-1.5 text-sm ${trabajos.includes(t.valor) ? "bg-teal-700 text-white" : "bg-stone-50 ring-1 ring-stone-200"}`}>{t.texto}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Viviendas<input type="number" min={2} max={500} value={viviendas} onChange={(e) => setViviendas(Math.max(2, Number(e.target.value) || 2))} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
              <label className="text-sm">Plantas<input type="number" min={1} max={40} value={plantas} onChange={(e) => setPlantas(Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Inspección técnica del edificio (ITE / IEE)</div>
              <div className="flex flex-wrap gap-1.5">
                {INSPECCION.map((x) => <button key={x} onClick={() => setInspeccion(x)} className={`rounded-full px-3 py-1.5 text-sm ${inspeccion === x ? "bg-stone-900 text-white" : "bg-stone-50 ring-1 ring-stone-200"}`}>{x}</button>)}
              </div>
              {inspeccion === "Desfavorable" && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">Con una inspección desfavorable el ayuntamiento da un plazo para hacer las obras. Indicadlo a los especialistas para que lo tengan en cuenta en el calendario.</p>}
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">¿En qué punto está la junta?</div>
              <div className="flex flex-wrap gap-1.5">
                {JUNTA.map((x) => <button key={x} onClick={() => setJunta(x)} className={`rounded-full px-3 py-1.5 text-sm ${junta === x ? "bg-stone-900 text-white" : "bg-stone-50 ring-1 ring-stone-200"}`}>{x}</button>)}
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Especialistas homologados para vuestra obra</h3>
              {encajan.length === 0 ? (
                <p className="mt-2 text-sm text-stone-500">Todavía no hay especialistas para esto en {zona}. Pedidlo igualmente y os avisamos cuando haya.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {encajan.map((f: FichaRed) => (
                    <li key={f.id}>
                      <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${elegidos.includes(f.id) ? "border-teal-600 bg-teal-50" : "border-stone-200"}`}>
                        <input type="checkbox" checked={elegidos.includes(f.id)} onChange={() => setElegidos(alterna(elegidos, f.id))} className="mt-1" />
                        <span className="text-sm">
                          <span className="font-semibold">Especialista {f.codigo}</span> <span className="text-xs text-emerald-700">✓ Homologado</span>
                          <span className="block text-xs text-stone-500">{f.especialidades.join(" · ")} · {f.zonas.join(", ")} · seguro RSC {(f.capitalRC / 1000).toLocaleString("es-ES")} mil €</span>
                          <span className="mt-1 block text-stone-600">{f.presentacion}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {enviado ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                ✓ Solicitud enviada{elegidos.length ? ` a ${elegidos.length} especialista${elegidos.length > 1 ? "s" : ""}` : ""}. Os contactarán para la visita técnica; después cada uno meterá su presupuesto en la app para que lo llevéis a la junta.
              </div>
            ) : (
              <button
                onClick={() => exigir(() => setEnviado(true))}
                disabled={!trabajos.length}
                className="w-full rounded-xl bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                Pedir visita técnica{elegidos.length ? ` a ${elegidos.length}` : ""}
              </button>
            )}
            <p className="text-xs text-stone-400">Demostración: los especialistas que aparecen son ficticios. {viviendas} viviendas · {plantas} plantas · ITE/IEE: {inspeccion.toLowerCase()} · {junta.toLowerCase()}.</p>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl bg-stone-900 p-5 text-white">
              <div className="font-semibold">Calcula la derrama por vivienda</div>
              <label className="mt-3 block text-xs text-stone-300">
                Presupuesto de la obra (IVA incluido)
                <input type="number" min={0} step={1000} value={importe} onChange={(e) => setImporte(Math.max(0, Number(e.target.value) || 0))} className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white" />
              </label>
              <div className="mt-3 text-3xl font-semibold">{euros(importe / viviendas)}</div>
              <div className="text-xs text-stone-400">por vivienda, a partes iguales entre {viviendas}. Si vuestros estatutos reparten por coeficiente de participación, cada vecino paga según el suyo.</div>
              <div className="mt-3 border-t border-white/10 pt-3 text-xs text-stone-300">Sin comisión: la app no cobra nada sobre el precio de la obra.</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="font-semibold">Lo que vais a necesitar</div>
              <ul className="mt-2 space-y-2 text-sm">
                {NECESARIO.map(([t, d]) => (
                  <li key={t}><span className="font-medium">{t}.</span> <span className="text-stone-600">{d}</span></li>
                ))}
              </ul>
              <Link href="/subvenciones?para=comunidades" className="mt-3 block text-sm font-medium text-teal-800 underline">Ver subvenciones para comunidades de vecinos →</Link>
              <Link href="/arquitectos" className="mt-1 block text-sm font-medium text-teal-800 underline">Estudios de arquitectura para el informe →</Link>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm">
              <div className="font-semibold">¿Eres empresa de fachadas o tejados?</div>
              <p className="mt-1 text-stone-600">Date de alta, elige tu especialidad y te llegarán las comunidades de vecinos de tu zona.</p>
              <Link href="/reformistas" className="mt-2 inline-block font-medium text-sky-900 underline">Darme de alta →</Link>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
