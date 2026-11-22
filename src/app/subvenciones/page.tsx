"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { publico } from "@/lib/base";
import { ESTADOS, estadoActual, LOCALIDADES, subvencionesPara, type FicheroBdns, type Para, type Subvencion } from "@/lib/subvenciones";

const fechaEs = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "");
const millones = (n: number) => (n >= 1e6 ? `${(n / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 2 })} M€` : `${n.toLocaleString("es-ES")} €`);

function Ficha({ s, bdns }: { s: Subvencion; bdns: FicheroBdns | null }) {
  const e = ESTADOS[estadoActual(s)];
  const datos = (s.bdns ?? []).map((c) => [c, bdns?.convocatorias[c]] as const).filter(([, d]) => d);
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold leading-snug">{s.nombre}</h3>
          <div className="text-xs text-stone-500">{s.organismo}</div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.cls}`}>{e.texto}</span>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-xs font-medium text-stone-500">Qué cubre</dt><dd>{s.cubre}</dd></div>
        <div><dt className="text-xs font-medium text-stone-500">Cuánto</dt><dd>{s.importe}</dd></div>
        <div><dt className="text-xs font-medium text-stone-500">Requisitos</dt><dd>{s.requisitos}</dd></div>
        <div><dt className="text-xs font-medium text-stone-500">Plazo</dt><dd>{s.plazo}</dd></div>
      </dl>
      {(s.credito || datos.length > 0) && (
        <div className="mt-3 rounded-xl bg-stone-50 p-3 text-sm">
          <div className="text-xs font-medium text-stone-500">💰 Dinero de la convocatoria</div>
          {s.credito && (
            <>
              <div className="font-medium">{s.credito.total}</div>
              {s.credito.restante && <div className="text-amber-800">Queda: {s.credito.restante}</div>}
              <div className="text-xs text-stone-500">{s.credito.nota}</div>
            </>
          )}
          {datos.map(([c, d]) => (
            <div key={c} className="mt-1 text-xs text-stone-600">
              BDNS {c}: {d!.presupuesto ? `presupuesto registrado ${millones(d!.presupuesto)}` : "sin presupuesto en la ficha"}
              {d!.hasta ? ` · solicitudes hasta el ${fechaEs(d!.hasta)}` : ""} <span className="text-stone-400">(dato del {fechaEs(bdns!.actualizado)})</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-800 underline">Fuente oficial ↗</a>
        <span className="text-stone-400">Revisado el {fechaEs(s.comprobado)}</span>
      </div>
    </article>
  );
}

function Vista() {
  const q = useSearchParams();
  const [para, setPara] = useState<Para>(q.get("para") === "comunidades" ? "comunidades" : "particulares");
  const [loc, setLoc] = useState(LOCALIDADES.some((l) => l.id === q.get("en")) ? q.get("en")! : "madrid");
  const [bdns, setBdns] = useState<FicheroBdns | null>(null);
  const [verCerradas, setVerCerradas] = useState(false);

  useEffect(() => {
    fetch(publico("/datos/bdns.json"), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: FicheroBdns | null) => setBdns(j?.actualizado ? j : null))
      .catch(() => setBdns(null));
  }, []);

  const todas = subvencionesPara(para, loc);
  const activas = todas.filter((s) => !["cerrada"].includes(estadoActual(s)));
  const cerradas = todas.filter((s) => estadoActual(s) === "cerrada");

  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Subvenciones para tu reforma</h1>
        <p className="mt-2 max-w-2xl text-stone-600">Las ayudas y ventajas fiscales que hay ahora en tu localidad, con su estado, el dinero de cada convocatoria y el enlace oficial. Las revisamos en las fuentes oficiales y los datos de la BDNS se actualizan solos cada día.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["particulares", "comunidades"] as Para[]).map((p) => (
            <button key={p} onClick={() => setPara(p)} className={`rounded-full px-4 py-2 text-sm font-medium ${para === p ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>
              {p === "particulares" ? "🏠 Para tu vivienda" : "🏢 Para comunidades de vecinos"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {LOCALIDADES.map((l) => (
            <button key={l.id} onClick={() => setLoc(l.id)} className={`rounded-full px-3 py-1 text-sm ${loc === l.id ? "bg-teal-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>📍 {l.texto}</button>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Ahora mismo casi todas las convocatorias de rehabilitación de {LOCALIDADES.find((l) => l.id === loc)?.texto} están cerradas o agotadas. Lo que sigue en vigor son la deducción del IRPF y el IVA del 10 %. El Plan Estatal de Vivienda 2026-2030 está aprobado y saldrán convocatorias: en cuanto se publiquen las verás aquí.
        </div>

        <h2 className="mt-6 font-semibold">Activas, en vigor o por abrir ({activas.length})</h2>
        <div className="mt-3 space-y-3">
          {activas.map((s) => <Ficha key={s.id} s={s} bdns={bdns} />)}
        </div>

        {cerradas.length > 0 && (
          <div className="mt-6">
            <button onClick={() => setVerCerradas(!verCerradas)} className="text-sm font-medium text-stone-600 underline">
              {verCerradas ? "Ocultar" : "Ver"} las {cerradas.length} convocatorias cerradas este año (para preparar la próxima)
            </button>
            {verCerradas && <div className="mt-3 space-y-3">{cerradas.map((s) => <Ficha key={s.id} s={s} bdns={bdns} />)}</div>}
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href={para === "comunidades" ? "/comunidades" : "/nuevo"} className="rounded-2xl bg-teal-700 p-4 font-semibold text-white hover:bg-teal-800">
            {para === "comunidades" ? "🏢 Pedir visitas para la fachada o el tejado →" : "🧮 Calcular el presupuesto de mi reforma →"}
          </Link>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
            📑 Casi todas las ayudas piden certificado energético antes y después, y a veces memoria o proyecto de arquitecto. Te ayudamos a prepararlo con un estudio de arquitectura de la app.
          </div>
        </div>
        <p className="mt-6 text-xs text-stone-400">
          Información orientativa redactada a partir de BOE, BOCM, BOJA, la BDNS y las webs de la Agencia Tributaria, la Comunidad de Madrid, la Junta de Andalucía y los ayuntamientos. Las bases de cada convocatoria son las que valen. La BDNS no publica cuánto dinero queda: mostramos el crédito total y avisamos cuando se suspende por agotamiento.
          {bdns ? ` Datos de la BDNS actualizados el ${fechaEs(bdns.actualizado)}.` : ""}
        </p>
      </main>
    </div>
  );
}

export default function Subvenciones() {
  return (
    <Suspense fallback={<main className="p-6 text-stone-500">Cargando…</main>}>
      <Vista />
    </Suspense>
  );
}
