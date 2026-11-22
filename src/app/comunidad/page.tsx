"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buscarTemas, CATEGORIA_LEGAL, CATEGORIAS, DENUNCIAS_OCULTAR, tieneSolucion, TIPOS, type Accion, type TipoTema } from "@/lib/foro";
import { useForo } from "@/lib/foro-cliente";
import { useExigirRegistro } from "@/components/Registro";
import { nuevoId } from "@/lib/id";
import { CabeceraComunidad, EtiquetaTipo, haceTiempo, useFormularioMensaje } from "@/components/foro/Comun";
import { VideosNormativa } from "@/components/foro/VideosNormativa";
import { Boton, inputCls } from "@/components/ui";

export default function Comunidad() {
  const { temas: cargados, error, enviar, esProfesional } = useForo();
  const { exigir, modal } = useExigirRegistro("Únete gratis para contar tu experiencia o preguntar. Leer el foro siempre es libre.");
  const temas = useMemo(() => cargados ?? [], [cargados]);
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState<TipoTema | "">("");
  const [orden, setOrden] = useState<"recientes" | "utiles">("recientes");
  const [nuevo, setNuevo] = useState(false);

  const lista = useMemo(() => {
    const r = buscarTemas(temas, q, categoria, tipo).filter((t) => t.denuncias < DENUNCIAS_OCULTAR);
    return r.sort((a, b) => (orden === "utiles" ? b.utiles - a.utiles : 0) || b.creado.localeCompare(a.creado));
  }, [temas, q, categoria, tipo, orden]);

  return (
    <div className="min-h-dvh bg-stone-50">
      {modal}
      <CabeceraComunidad />
      <section className="bg-gradient-to-b from-teal-50 to-stone-50">
        <div className="mx-auto max-w-4xl px-4 pb-6 pt-10">
          <h1 className="text-3xl font-semibold tracking-tight">Foro de reformas</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Experiencias reales de gente que está reformando su casa: lo que salió bien, lo que salió mal y cómo se resolvió. Busca tu problema o pregunta, y los profesionales homologados te dan su opinión.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input className={`${inputCls} flex-1 py-3`} placeholder="Busca: moho en la ducha, aerotermia, retrasos…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Boton onClick={() => (nuevo ? setNuevo(false) : exigir(() => setNuevo(true)))} className="py-3">{nuevo ? "Cerrar" : "Compartir mi experiencia"}</Boton>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 pb-16">
        {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {nuevo && <NuevoTema categoriaInicial={categoria} alPublicar={async (a) => { if (await enviar(a)) setNuevo(false); }} />}

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <Tarjeta icono="🏛️" titulo="Legalizaciones en Madrid" texto="Licencias, declaraciones responsables, terrazas y comunidad de vecinos. Responde el asistente IA con la normativa oficial." activo={categoria === CATEGORIA_LEGAL} onClick={() => setCategoria(categoria === CATEGORIA_LEGAL ? "" : CATEGORIA_LEGAL)} />
          <Tarjeta icono="🦺" titulo="Responden profesionales" texto="Reformistas homologados opinan con su sello. Su empresa sigue siendo anónima hasta que tú decides." />
          <Tarjeta icono="🤖" titulo="Asistente IA de obra" texto="En cada tema puedes pedir una primera opinión técnica con fuentes, mientras llegan las respuestas." />
        </div>
        <VideosNormativa soloLegal={categoria === CATEGORIA_LEGAL} />
        {!esProfesional && (
          <p className="mb-4 text-xs text-stone-500">¿Eres reformista homologado? Entra desde tu portal (botón «Responder en el foro») para que tus respuestas lleven el sello. <Link href="/reformistas" className="underline">Homologarme</Link></p>
        )}

        <div className="mb-3 flex flex-wrap gap-1.5">
          <Chip activo={!categoria} onClick={() => setCategoria("")}>Todo</Chip>
          {CATEGORIAS.map((c) => <Chip key={c} activo={categoria === c} onClick={() => setCategoria(categoria === c ? "" : c)}>{c}</Chip>)}
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-sm">
          <Chip activo={!tipo} onClick={() => setTipo("")}>Todos los tipos</Chip>
          {TIPOS.map((t) => <Chip key={t.valor} activo={tipo === t.valor} onClick={() => setTipo(tipo === t.valor ? "" : t.valor)}>{t.icono} {t.texto}</Chip>)}
          <select className="ml-auto rounded-full border border-stone-200 bg-white px-3 py-1 text-sm" value={orden} onChange={(e) => setOrden(e.target.value as "recientes" | "utiles")}>
            <option value="recientes">Más recientes</option>
            <option value="utiles">Más útiles</option>
          </select>
        </div>

        {!cargados ? (
          <p className="p-6 text-center text-stone-500">Cargando…</p>
        ) : lista.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-stone-500">No hay temas con esa búsqueda. ¡Sé el primero en contar tu caso!</p>
        ) : (
          <ul className="space-y-3">
            {lista.map((t) => (
              <li key={t.id}>
                <Link href={`/comunidad/tema?id=${t.id}`} className="block rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-teal-600">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <EtiquetaTipo tipo={t.tipoTema} />
                    <span>{t.categoria}</span>
                    {tieneSolucion(t) && <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-medium text-white">✓ Resuelto</span>}
                  </div>
                  <h2 className="mt-2 font-semibold text-stone-900">{t.titulo}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">{t.texto}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-500">
                    <span>{t.autor.alias} · {haceTiempo(t.creado)}</span>
                    <span>💬 {t.respuestas.length} respuesta{t.respuestas.length === 1 ? "" : "s"}</span>
                    <span>👍 {t.utiles} útil{t.utiles === 1 ? "" : "es"}</span>
                    {t.respuestas.some((r) => r.autor.homologado) && <span className="text-teal-700">✓ Responde un profesional</span>}
                    {t.respuestaIA && <span className="text-indigo-700">🤖 Opinión IA</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-8 text-center text-xs text-stone-400">
          Todo lo que se publica aquí es público. Normas: sin datos de contacto ni direcciones, respeto y experiencias reales. Puedes denunciar cualquier mensaje.
        </p>
      </main>
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-sm ${activo ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-400"}`}>
      {children}
    </button>
  );
}

function Tarjeta({ icono, titulo, texto, activo, onClick }: { icono: string; titulo: string; texto: string; activo?: boolean; onClick?: () => void }) {
  const cls = `rounded-2xl border bg-white p-4 text-left text-sm ${activo ? "border-teal-600 ring-2 ring-teal-100" : "border-stone-200"} ${onClick ? "transition hover:border-teal-600" : ""}`;
  const dentro = (
    <>
      <div className="text-xl">{icono}</div>
      <div className="mt-1 font-semibold text-stone-900">{titulo}</div>
      <div className="mt-1 text-stone-600">{texto}</div>
    </>
  );
  return onClick ? <button onClick={onClick} className={cls}>{dentro}</button> : <div className={cls}>{dentro}</div>;
}

function NuevoTema({ alPublicar, categoriaInicial }: { alPublicar: (a: Accion) => Promise<void>; categoriaInicial: string }) {
  const f = useFormularioMensaje();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<string>(categoriaInicial || CATEGORIAS[0]);
  const [tipoTema, setTipoTema] = useState<TipoTema>("pregunta");
  const valido = f.valido && titulo.trim().length >= 8;
  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-teal-200 bg-white p-4">
      <h2 className="font-semibold">Comparte tu experiencia o pregunta</h2>
      <div className="flex flex-wrap gap-1.5">
        {TIPOS.map((t) => <Chip key={t.valor} activo={tipoTema === t.valor} onClick={() => setTipoTema(t.valor)}>{t.icono} {t.texto}</Chip>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <label className="block text-sm">
          <span className="mb-1 block text-stone-600">Título</span>
          <input className={inputCls} value={titulo} maxLength={120} placeholder="Resume tu caso en una frase" onChange={(e) => setTitulo(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-stone-600">Tema</span>
          <select className={inputCls} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      {f.campos}
      <Boton
        disabled={!valido}
        onClick={() =>
          alPublicar({ tipo: "crear", id: nuevoId(), titulo: titulo.trim(), categoria, tipoTema, mensaje: { alias: f.alias.trim(), texto: f.texto.trim(), foto: f.foto } })
        }
      >
        Publicar
      </Boton>
    </div>
  );
}
