"use client";

import Link from "next/link";
import { APP } from "@/lib/marca";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { DENUNCIAS_OCULTAR, type Accion, type Mensaje } from "@/lib/foro";
import { useForo } from "@/lib/foro-cliente";
import { useExigirRegistro } from "@/components/Registro";
import { nuevoId } from "@/lib/id";
import { CabeceraComunidad, Cuerpo, EtiquetaTipo, haceTiempo, NombreAutor, useFormularioMensaje } from "@/components/foro/Comun";
import { AsistenteIA } from "@/components/foro/AsistenteIA";
import { Boton } from "@/components/ui";
import { conBaseDeDatos } from "@/lib/modo";

export default function PaginaTema() {
  return (
    <Suspense fallback={<main className="p-6 text-stone-500">Cargando…</main>}>
      <VistaTema />
    </Suspense>
  );
}

function VistaTema() {
  const id = useSearchParams().get("id") ?? "";
  const { temas, ia, mios, utiles, error, enviar, esProfesional } = useForo();
  const { esMiembro, exigir, modal } = useExigirRegistro("Únete gratis para responder, votar o pedir la opinión de la IA. Leer siempre es libre.");
  if (!temas) return <main className="p-6 text-stone-500">Cargando…</main>;
  const t = temas.find((x) => x.id === id);

  if (!t || t.denuncias >= DENUNCIAS_OCULTAR) {
    return (
      <div className="min-h-dvh bg-stone-50">
        <CabeceraComunidad />
        <main className="mx-auto max-w-3xl p-6 text-stone-600">Este tema no existe o está en revisión. <Link href="/comunidad" className="underline">Volver a la comunidad</Link></main>
      </div>
    );
  }

  const esMio = mios.has(t.id);
  const accion = (tipo: "util" | "denunciar" | "borrar" | "solucion", m: Mensaje) => exigir(() => enviar({ tipo, temaId: t.id, mensajeId: m.id } as Accion));

  const Acciones = ({ m }: { m: Mensaje }) => (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
      <button onClick={() => !utiles.has(m.id) && accion("util", m)} disabled={utiles.has(m.id)} className={`rounded-full px-2.5 py-1 ring-1 ${utiles.has(m.id) ? "bg-teal-50 text-teal-800 ring-teal-200" : "ring-stone-200 hover:ring-stone-400"}`}>
        👍 Útil · {m.utiles}
      </button>
      {esMio && m.id !== t.id && !m.solucion && (
        <button onClick={() => accion("solucion", m)} className="hover:text-emerald-700">✓ Marcar como solución</button>
      )}
      {mios.has(m.id) ? (
        <button onClick={() => confirm("¿Borrar tu mensaje? No se puede deshacer.") && accion("borrar", m)} className="hover:text-red-700">Borrar</button>
      ) : (
        <button onClick={() => confirm("¿Denunciar este mensaje? Lo revisaremos y, si incumple las normas, se retirará.") && accion("denunciar", m)} className="hover:text-red-700">Denunciar</button>
      )}
    </div>
  );

  const respuestas = t.respuestas.filter((r) => r.denuncias < DENUNCIAS_OCULTAR).sort((a, b) => Number(!!b.solucion) - Number(!!a.solucion) || Number(!!b.autor.homologado) - Number(!!a.autor.homologado) || b.utiles - a.utiles);

  return (
    <div className="min-h-dvh bg-stone-50">
      {modal}
      <CabeceraComunidad />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <Link href="/comunidad" className="text-sm text-stone-500 hover:underline">← Comunidad</Link>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <article className="mt-3 rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <EtiquetaTipo tipo={t.tipoTema} />
            <span>{t.categoria}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t.titulo}</h1>
          <div className="mt-1 text-xs text-stone-500"><NombreAutor a={t.autor} /> · {haceTiempo(t.creado)}</div>
          <Cuerpo m={t} />
          <Acciones m={t} />
        </article>

        <AsistenteIA tema={t} disponible={ia} pedir={() => (esMiembro ? enviar({ tipo: "ia", temaId: t.id }) : (exigir(() => enviar({ tipo: "ia", temaId: t.id })), Promise.resolve()))} />

        <h2 className="mb-2 mt-6 font-semibold">{respuestas.length} respuesta{respuestas.length === 1 ? "" : "s"}</h2>
        <ul className="space-y-3">
          {respuestas.map((r) => (
            <li key={r.id} className={`rounded-2xl border bg-white p-4 ${r.solucion ? "border-emerald-400 ring-2 ring-emerald-100" : r.autor.homologado ? "border-teal-300" : "border-stone-200"}`}>
              {r.solucion && <div className="mb-1 text-xs font-semibold text-emerald-700">✓ Solución marcada por quien preguntó</div>}
              <div className="text-xs text-stone-500"><NombreAutor a={r.autor} /> · {haceTiempo(r.creado)}</div>
              <Cuerpo m={r} />
              <Acciones m={r} />
            </li>
          ))}
        </ul>

        {!esMiembro ? (
          <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="font-semibold">¿Te ha pasado algo parecido o sabes la respuesta?</div>
              <div className="text-sm text-stone-600">Únete gratis a la comunidad {APP.nombre} con tu email para responder.</div>
            </div>
            <button onClick={() => exigir()} className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">Unirme y responder</button>
          </div>
        ) : <Responder esProfesional={esProfesional} alResponder={(mensaje, comoPro) => enviar({ tipo: "responder", id: nuevoId(), temaId: t.id, mensaje }, { comoPro })} />}
      </main>
    </div>
  );
}

function Responder({ alResponder, esProfesional }: { alResponder: (m: { alias: string; texto: string; foto?: string }, comoPro: boolean) => Promise<boolean>; esProfesional: boolean }) {
  const f = useFormularioMensaje();
  const [comoPro, setComoPro] = useState(false);
  const [enviando, setEnviando] = useState(false);
  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
      <h2 className="font-semibold">Responder</h2>
      {esProfesional ? (
        <p className="rounded-lg bg-teal-50 p-2 text-sm text-teal-900">✓ Respondes como <b>profesional homologado</b> (has entrado desde tu portal de reformista). Tu empresa sigue siendo anónima.</p>
      ) : !conBaseDeDatos ? (
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={comoPro} onChange={(e) => setComoPro(e.target.checked)} />
          Responder como profesional homologado (en la demo; en la app real se entra desde el portal del reformista)
        </label>
      ) : null}
      {f.campos}
      <Boton
        disabled={!f.valido || enviando}
        onClick={async () => {
          setEnviando(true);
          if (await alResponder({ alias: f.alias.trim(), texto: f.texto.trim(), foto: f.foto }, comoPro)) f.limpiar();
          setEnviando(false);
        }}
      >
        {enviando ? "Publicando…" : "Publicar respuesta"}
      </Boton>
    </div>
  );
}
