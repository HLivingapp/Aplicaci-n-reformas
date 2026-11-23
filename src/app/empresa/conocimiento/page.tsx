"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Boton, Campo, inputCls, Tarjeta, Titulo, Vacio } from "@/components/ui";
import {
  citaFragmento,
  enlaceFragmento,
  formatoDe,
  TEMAS,
  textoTema,
  textoTipo,
  TIPOS_OBRA,
  type DocumentoConocimiento,
  type FragmentoEncontrado,
  type Tema,
  type TipoObra,
} from "@/lib/conocimiento";
import { conNube } from "@/lib/modo";
import { useSesionNube } from "@/lib/nube";
import { supabaseNavegador } from "@/lib/supabase/navegador";

/**
 * Base de conocimiento de la IA. El equipo sube PDF, Excel o texto (o pega un enlace a un PDF oficial),
 * la Edge Function «conocimiento-importar» lo trocea y la IA de la app lo usa como contexto y lo cita.
 * Todo se guarda solo en Supabase (UE); el repositorio no lleva ningún documento.
 */

function Chips<T extends string>({ opciones, valores, cambiar }: { opciones: readonly { valor: T; texto: string }[]; valores: T[]; cambiar: (v: T[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opciones.map((o) => {
        const on = valores.includes(o.valor);
        return (
          <button
            key={o.valor}
            type="button"
            onClick={() => cambiar(on ? valores.filter((x) => x !== o.valor) : [...valores, o.valor])}
            className={`rounded-full px-2.5 py-1 text-xs ${on ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}

const ESTADO: Record<DocumentoConocimiento["estado"], string> = { procesando: "Procesando…", listo: "Listo", error: "Error" };

/** Llama al importador por lotes de páginas hasta terminar. */
async function importar(id: string, alAvanzar: (txt: string) => void) {
  let desde = 1;
  for (let vuelta = 0; vuelta < 200; vuelta++) {
    const { data, error } = await supabaseNavegador().functions.invoke("conocimiento-importar", { body: { documento: id, desde, lote: 20 } });
    if (error) {
      let msg = error.message;
      try {
        msg = (await (error as { context?: Response }).context?.json())?.error ?? msg;
      } catch {
        /* sin cuerpo */
      }
      throw new Error(msg);
    }
    if (!data?.siguiente) return;
    alAvanzar(`Leyendo página ${data.siguiente} de ${data.total}…`);
    desde = data.siguiente;
  }
}

export default function Conocimiento() {
  const sesion = useSesionNube();
  const [equipo, setEquipo] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sesion) return;
    supabaseNavegador()
      .rpc("es_del_equipo")
      .then(({ data }) => setEquipo(data === true));
  }, [sesion]);

  if (!conNube)
    return (
      <>
        <Titulo>Base de conocimiento de la IA</Titulo>
        <Vacio>Esta zona necesita la conexión con Supabase. En el modo demostración no se pueden subir documentos.</Vacio>
      </>
    );
  if (sesion === undefined) return <p className="text-sm text-stone-500">Comprobando tu sesión…</p>;
  if (!sesion)
    return (
      <>
        <Titulo>Base de conocimiento de la IA</Titulo>
        <Vacio>
          Entra con tu email del equipo en <Link href="/cuenta" className="text-teal-700 underline">Mi cuenta</Link> y vuelve aquí.
        </Vacio>
      </>
    );
  if (equipo === null) return <p className="text-sm text-stone-500">Comprobando permisos…</p>;
  if (!equipo)
    return (
      <>
        <Titulo>Base de conocimiento de la IA</Titulo>
        <Vacio>Tu email ({sesion.user.email}) no está en la lista del equipo. Pide que lo añadan en la tabla «equipo» de Supabase.</Vacio>
      </>
    );
  return <Zona />;
}

function Zona() {
  const [docs, setDocs] = useState<DocumentoConocimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<Tema | "todos">("todos");

  const recargar = useCallback(async () => {
    const { data, error } = await supabaseNavegador().from("conocimiento_resumen").select("*").order("tema").order("titulo");
    if (error) setError("No se ha podido leer la base de conocimiento: " + error.message);
    else setDocs((data ?? []) as DocumentoConocimiento[]);
    setCargando(false);
  }, []);
  useEffect(() => void recargar(), [recargar]);

  const porTema = useMemo(() => {
    const m = new Map<string, DocumentoConocimiento[]>();
    for (const d of docs) if (filtro === "todos" || d.tema === filtro) m.set(d.tema, [...(m.get(d.tema) ?? []), d]);
    return [...m];
  }, [docs, filtro]);
  const totalFragmentos = docs.reduce((s, d) => s + (d.fragmentos ?? 0), 0);

  return (
    <>
      <Titulo>Base de conocimiento de la IA</Titulo>
      <p className="mb-4 text-sm text-stone-600">
        Lo que subas aquí lo usa la IA de la app para responder y lo cita. Se guarda solo en Supabase (UE). Al importar se ocultan emails, teléfonos,
        NIF/CIF e IBAN, pero <strong>quita antes nombres y direcciones de clientes</strong>. Los documentos <em>internos</em> (precios, partidas, procesos)
        solo los ve el equipo; la IA solo enseña a clientes y profesionales los marcados como <em>públicos</em>.
      </p>
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <Subir alTerminar={recargar} />
      <Probar />

      <div className="mb-3 mt-8 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {docs.length} documentos · {totalFragmentos.toLocaleString("es-ES")} fragmentos
        </h2>
        <select className={`${inputCls} w-auto`} value={filtro} onChange={(e) => setFiltro(e.target.value as Tema | "todos")}>
          <option value="todos">Todos los temas</option>
          {TEMAS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.texto}
            </option>
          ))}
        </select>
      </div>
      {cargando ? (
        <p className="text-sm text-stone-500">Cargando…</p>
      ) : !docs.length ? (
        <Vacio>Todavía no hay documentos.</Vacio>
      ) : (
        porTema.map(([tema, lista]) => (
          <section key={tema} className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">{textoTema(tema)}</h3>
            <div className="space-y-2">
              {lista.map((d) => (
                <FilaDocumento key={d.id} d={d} alCambiar={recargar} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

function FilaDocumento({ d, alCambiar }: { d: DocumentoConocimiento; alCambiar: () => void }) {
  const [ocupado, setOcupado] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [muestra, setMuestra] = useState<{ seccion: string | null; pagina: number | null; texto: string }[]>([]);

  const reimportar = async () => {
    setOcupado("Importando…");
    try {
      await importar(d.id, setOcupado);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se ha podido importar");
    }
    setOcupado("");
    alCambiar();
  };
  const cambiarPublico = async () => {
    await supabaseNavegador().from("conocimiento_documentos").update({ publico: !d.publico }).eq("id", d.id);
    alCambiar();
  };
  const borrar = async () => {
    if (!confirm(`¿Borrar «${d.titulo}» y todos sus fragmentos?`)) return;
    if (d.archivo) await supabaseNavegador().storage.from("conocimiento").remove([d.archivo]);
    await supabaseNavegador().from("conocimiento_documentos").delete().eq("id", d.id);
    alCambiar();
  };
  const verMuestra = async () => {
    setAbierto(!abierto);
    if (muestra.length) return;
    const { data } = await supabaseNavegador().from("conocimiento_fragmentos").select("seccion,pagina,texto").eq("documento", d.id).order("orden").limit(5);
    setMuestra(data ?? []);
  };

  return (
    <Tarjeta className="!p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">{d.titulo}</div>
          <div className="mt-0.5 text-xs text-stone-500">
            {[d.fuente, d.version, d.paginas ? `${d.paginas} págs.` : null, `${d.fragmentos} fragmentos`].filter(Boolean).join(" · ")}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${d.publico ? "bg-teal-50 text-teal-800" : "bg-amber-50 text-amber-900"}`}>
              {d.publico ? "Público" : "Interno"}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${d.estado === "error" ? "bg-red-50 text-red-800" : "bg-stone-100 text-stone-600"}`}>
              {ocupado || ESTADO[d.estado]}
            </span>
            {d.tipos_obra.map((t) => (
              <span key={t} className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">
                {textoTipo(t)}
              </span>
            ))}
          </div>
          {d.estado === "error" && d.notas && <p className="mt-1 text-xs text-red-700">{d.notas}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          {d.url && (
            <a href={d.url} target="_blank" rel="noreferrer" className="rounded-lg px-2 py-1 text-xs text-teal-700 hover:bg-stone-100">
              Original
            </a>
          )}
          <Boton variante="fantasma" className="!px-2 !py-1 text-xs" onClick={verMuestra}>
            {abierto ? "Ocultar" : "Ver texto"}
          </Boton>
          <Boton variante="fantasma" className="!px-2 !py-1 text-xs" onClick={cambiarPublico}>
            {d.publico ? "Hacer interno" : "Hacer público"}
          </Boton>
          <Boton variante="fantasma" className="!px-2 !py-1 text-xs" disabled={Boolean(ocupado)} onClick={reimportar}>
            Reimportar
          </Boton>
          <Boton variante="peligro" className="!px-2 !py-1 text-xs" onClick={borrar}>
            Borrar
          </Boton>
        </div>
      </div>
      {abierto && (
        <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
          {muestra.map((m, i) => (
            <div key={i} className="text-xs">
              <div className="font-medium text-stone-500">{[m.seccion, m.pagina ? `pág. ${m.pagina}` : null].filter(Boolean).join(" · ")}</div>
              <p className="line-clamp-4 whitespace-pre-line text-stone-700">{m.texto}</p>
            </div>
          ))}
        </div>
      )}
    </Tarjeta>
  );
}

function Subir({ alTerminar }: { alTerminar: () => void }) {
  const [modo, setModo] = useState<"archivo" | "enlace" | "texto">("archivo");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [texto, setTexto] = useState("");
  const [titulo, setTitulo] = useState("");
  const [tema, setTema] = useState<Tema>("tecnica");
  const [tipos, setTipos] = useState<TipoObra[]>(["reforma_interior"]);
  const [publico, setPublico] = useState(true);
  const [fuente, setFuente] = useState("");
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");

  const elegirTema = (t: Tema) => {
    setTema(t);
    setPublico(TEMAS.find((x) => x.valor === t)?.publico ?? false);
  };

  const enviar = async () => {
    setError("");
    const s = supabaseNavegador();
    let formato: string | null = null;
    if (modo === "archivo") {
      if (!archivo) return setError("Elige un archivo.");
      formato = formatoDe(archivo.name);
      if (!formato) return setError("Formato no admitido. Sube PDF, Excel (xlsx, xls, ods), CSV, TXT o MD.");
    } else if (modo === "enlace") {
      if (!/^https:\/\/\S+$/.test(url.trim())) return setError("Pega un enlace que empiece por https://");
      formato = url.trim().toLowerCase().split("?")[0].endsWith(".pdf") ? "pdf" : "txt";
    } else {
      if (texto.trim().length < 40) return setError("Escribe o pega un texto más largo.");
      formato = "txt";
    }
    const nombre = titulo.trim() || archivo?.name.replace(/\.[^.]+$/, "") || "";
    if (nombre.length < 2) return setError("Ponle un título.");

    const id = crypto.randomUUID();
    let ruta: string | null = null;
    try {
      if (modo !== "enlace") {
        setEstado("Subiendo…");
        const blob = modo === "archivo" ? archivo! : new Blob([texto], { type: "text/plain;charset=utf-8" });
        const limpio = (modo === "archivo" ? archivo!.name : "texto.txt").normalize("NFD").replace(/[^\w.-]+/g, "_");
        ruta = `${id}/${limpio}`;
        const { error: e } = await s.storage.from("conocimiento").upload(ruta, blob, { contentType: blob.type || undefined });
        if (e) throw new Error("No se ha podido subir el archivo: " + e.message);
      }
      const { error: e } = await s.from("conocimiento_documentos").insert({
        id,
        titulo: nombre,
        tema,
        tipos_obra: tipos,
        publico,
        fuente: fuente.trim() || null,
        url: modo === "enlace" ? url.trim() : null,
        archivo: ruta,
        formato,
      });
      if (e) throw new Error("No se ha podido guardar el documento: " + e.message);
      setEstado("Leyendo el documento…");
      await importar(id, setEstado);
      setArchivo(null);
      setUrl("");
      setTexto("");
      setTitulo("");
      setFuente("");
      setEstado("¡Listo! Ya está en la base de conocimiento.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido importar");
      setEstado("");
    }
    alTerminar();
  };

  return (
    <Tarjeta>
      <h2 className="mb-3 font-semibold">Añadir conocimiento</h2>
      <div className="mb-3 flex gap-1">
        {(
          [
            ["archivo", "Subir archivo"],
            ["enlace", "Enlace a un PDF"],
            ["texto", "Pegar texto"],
          ] as const
        ).map(([v, t]) => (
          <button
            key={v}
            type="button"
            onClick={() => setModo(v)}
            className={`rounded-lg px-3 py-1.5 text-sm ${modo === v ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-700"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {modo === "archivo" && (
          <Campo etiqueta="Archivo (PDF, Excel, CSV, TXT)" className="md:col-span-2">
            <input type="file" accept=".pdf,.xlsx,.xls,.ods,.csv,.txt,.md" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} className="text-sm" />
          </Campo>
        )}
        {modo === "enlace" && (
          <Campo etiqueta="Enlace (p. ej. un PDF de codigotecnico.org o del Ayuntamiento)" className="md:col-span-2">
            <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </Campo>
        )}
        {modo === "texto" && (
          <Campo etiqueta="Texto (sin nombres ni direcciones de clientes)" className="md:col-span-2">
            <textarea className={`${inputCls} min-h-32`} value={texto} onChange={(e) => setTexto(e.target.value)} />
          </Campo>
        )}
        <Campo etiqueta="Título">
          <input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="p. ej. Guía de declaración responsable de Madrid" />
        </Campo>
        <Campo etiqueta="Fuente (opcional)">
          <input className={inputCls} value={fuente} onChange={(e) => setFuente(e.target.value)} placeholder="p. ej. Ayuntamiento de Madrid, 2026" />
        </Campo>
        <Campo etiqueta="Tema">
          <select className={inputCls} value={tema} onChange={(e) => elegirTema(e.target.value as Tema)}>
            {TEMAS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.texto}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="¿Quién lo puede ver a través de la IA?">
          <label className="flex items-center gap-2 py-2 text-sm">
            <input type="checkbox" checked={publico} onChange={(e) => setPublico(e.target.checked)} />
            Público (clientes y profesionales). Desmárcalo para precios, partidas o procesos internos.
          </label>
        </Campo>
        <Campo etiqueta="Tipos de obra a los que aplica" className="md:col-span-2">
          <Chips opciones={TIPOS_OBRA} valores={tipos} cambiar={setTipos} />
        </Campo>
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {estado && <p className="mt-3 text-sm text-teal-800">{estado}</p>}
      <div className="mt-4">
        <Boton onClick={enviar} disabled={Boolean(estado) && !estado.startsWith("¡")}>
          Añadir a la base
        </Boton>
      </div>
    </Tarjeta>
  );
}

/** Prueba lo que encontraría la IA para una pregunta. */
function Probar() {
  const [q, setQ] = useState("");
  const [tipos, setTipos] = useState<TipoObra[]>([]);
  const [res, setRes] = useState<FragmentoEncontrado[] | null>(null);
  const buscar = async () => {
    if (!q.trim()) return;
    const { data } = await supabaseNavegador().rpc("buscar_conocimiento", { consulta: q, tipos: tipos.length ? tipos : null, limite: 6 });
    setRes((data ?? []) as FragmentoEncontrado[]);
  };
  return (
    <Tarjeta className="mt-4">
      <h2 className="mb-1 font-semibold">Probar la búsqueda</h2>
      <p className="mb-3 text-xs text-stone-500">Escribe una pregunta como la haría un cliente y mira qué fragmentos recibiría la IA.</p>
      <div className="flex gap-2">
        <input
          className={inputCls}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          placeholder="p. ej. ventilación de la cocina al quitar el tabique"
        />
        <Boton onClick={buscar}>Buscar</Boton>
      </div>
      <div className="mt-2">
        <Chips opciones={TIPOS_OBRA} valores={tipos} cambiar={setTipos} />
      </div>
      {res && (
        <div className="mt-3 space-y-2">
          {!res.length && <p className="text-sm text-stone-500">No ha encontrado nada.</p>}
          {res.map((f) => {
            const enlace = enlaceFragmento(f);
            return (
              <div key={f.fragmento} className="rounded-lg bg-stone-50 p-2 text-xs">
                <div className="font-medium">
                  {enlace ? (
                    <a href={enlace} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                      {citaFragmento(f)}
                    </a>
                  ) : (
                    citaFragmento(f)
                  )}{" "}
                  <span className="font-normal text-stone-500">· {f.titulo}</span>
                </div>
                <p className="line-clamp-3 whitespace-pre-line text-stone-700">{f.texto}</p>
              </div>
            );
          })}
        </div>
      )}
    </Tarjeta>
  );
}
