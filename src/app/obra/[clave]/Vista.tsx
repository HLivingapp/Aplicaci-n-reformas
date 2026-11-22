"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publico } from "@/lib/base";
import { euros } from "@/lib/calc";
import { APP } from "@/lib/marca";
import { useParamsReales } from "@/lib/rutas";
import { fotoSinUbicacion } from "@/lib/foto-segura";
import { IVA_REFORMA, reservaEncargo, firmarCliente, firmarReformista, ESTADO_ENCARGO, type Encargo } from "@/lib/encargos";
import {
  abrirConClave, alCambiarIntranet, anadirEntrada, confirmarCobro, datosArchivo, empezarFase, ESTADO_FASE, faseDeHito, hitoDeFase, hitoListo, marcarPagado, MAX_ARCHIVO_DEMO,
  pagosDe, pedirPago, pedirRepaso, resumen, terminarFase, validarFase, type Archivo, type EntradaFase, type FaseObra, type Intranet, type Parte, type TipoEntrada,
} from "@/lib/intranet";
import { ContratoEncargo, HITOS } from "@/components/ContratoEncargo";
import { Barra, inputCls, Vacio } from "@/components/ui";

const fechaCorta = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "");
const fechaHora = (iso: string) => new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

type Pestana = "resumen" | "contrato" | "fases" | "pagos" | "documentos";
const PESTANAS: { id: Pestana; texto: string }[] = [
  { id: "resumen", texto: "Resumen" },
  { id: "contrato", texto: "Contrato" },
  { id: "fases", texto: "Fases" },
  { id: "pagos", texto: "Pagos" },
  { id: "documentos", texto: "Fotos y documentos" },
];

/** Intranet privada de la obra: contrato, fases, fotos, certificados, comentarios y pagos. */
export default function IntranetObra() {
  const { clave } = useParamsReales<{ clave: string }>();
  const [datos, setDatos] = useState<ReturnType<typeof abrirConClave> | undefined>(undefined);
  const [pestana, setPestana] = useState<Pestana>("resumen");
  // Versión estática: si se abre otro enlace privado en la misma pestaña solo cambia el #
  useEffect(() => {
    const recargar = () => window.location.reload();
    window.addEventListener("hashchange", recargar);
    return () => window.removeEventListener("hashchange", recargar);
  }, []);
  useEffect(() => {
    if (clave === "_") return;
    const leer = () => setDatos(abrirConClave(clave));
    leer();
    return alCambiarIntranet(leer);
  }, [clave]);

  if (datos === undefined) return <main className="flex min-h-dvh items-center justify-center text-stone-500">Cargando…</main>;
  if (datos === null)
    return (
      <main className="mx-auto max-w-xl p-6">
        <Vacio>
          Este enlace no es válido o ya no está activo. Pide a la otra parte que te lo vuelva a enviar desde la app.
          <div className="mt-3"><Link href="/obra" className="font-semibold text-teal-800 underline">Ver una obra de ejemplo</Link></div>
        </Vacio>
      </main>
    );
  const { intranet: i, encargo: e, parte } = datos;
  const firmado = e.estado === "firmado";
  const r = resumen(i, e);
  const pendientes = avisosPendientes(i, e, parte);

  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <Link href="/" aria-label={APP.nombre} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publico("/icon.svg")} alt="" className="h-8 w-8" />
            <span className="text-sm font-semibold">Intranet de la obra</span>
          </Link>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">{parte === "cliente" ? "Entras como cliente" : `Entras como reformista ${e.codigo}`}</span>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {PESTANAS.map((p) => (
            <button key={p.id} onClick={() => setPestana(p.id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 ${pestana === p.id ? "bg-teal-700 font-medium text-white" : "text-stone-600 hover:bg-stone-100"}`}>
              {p.texto}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-4">
        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Reforma en {e.zona}</h1>
              <p className="text-sm text-stone-600">
                {parte === "cliente" ? `Con el reformista ${e.codigo}` : e.cliente} · {e.final ? `${euros(e.final.importe * (1 + IVA_REFORMA / 100))} con IVA · ${e.final.plazoSemanas} semanas` : ""}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_ENCARGO[e.estado].cls}`}>{ESTADO_ENCARGO[e.estado].texto}</span>
          </div>
          {firmado && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-stone-500">
                <span>{r.validadas} de {r.total} fases validadas{r.enCurso ? ` · ahora: ${r.enCurso.nombre}` : ""}</span>
                <span>{r.pct} %</span>
              </div>
              <Barra pct={r.pct} />
            </div>
          )}
        </section>

        {pendientes.length > 0 && (
          <section className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200">
            <div className="font-semibold">Tienes {pendientes.length === 1 ? "algo pendiente" : `${pendientes.length} cosas pendientes`}</div>
            <ul className="mt-1 space-y-1">
              {pendientes.map((p) => (
                <li key={p.texto}>
                  <button onClick={() => setPestana(p.ir)} className="text-left underline decoration-amber-400 underline-offset-2">{p.texto}</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pestana === "resumen" && <Resumen i={i} e={e} parte={parte} ir={setPestana} />}
        {pestana === "contrato" && (
          <ContratoEncargo e={e} parte={parte} alFirmar={() => (parte === "cliente" ? firmarCliente(e.id) : firmarReformista(e.id))} />
        )}
        {pestana === "fases" && (firmado ? <Fases i={i} e={e} parte={parte} /> : <Bloqueado e={e} parte={parte} ir={setPestana} />)}
        {pestana === "pagos" && <Pagos i={i} e={e} parte={parte} />}
        {pestana === "documentos" && <Documentos i={i} />}

        <p className="rounded-xl bg-white p-3 text-xs text-stone-500 ring-1 ring-stone-200">
          🔒 Solo el cliente y su reformista ven esta obra, cada uno con su enlace privado (sin contraseña). No reenvíes tu enlace. Las fotos se guardan sin ubicación GPS y nunca se publican. Datos tratados en la Unión Europea según el RGPD.{" "}
          <Link href="/privacidad" className="underline">Privacidad</Link>. Demostración: los datos se guardan solo en este navegador.
        </p>
      </main>
    </div>
  );
}

function avisosPendientes(i: Intranet, e: Encargo, parte: Parte): { texto: string; ir: Pestana }[] {
  const res: { texto: string; ir: Pestana }[] = [];
  if (parte === "cliente" && e.estado === "presupuesto_final") res.push({ texto: "Revisar y firmar el contrato", ir: "contrato" });
  if (parte === "reformista" && e.estado === "firmado_cliente") res.push({ texto: "El cliente ya ha firmado: te toca firmar el contrato", ir: "contrato" });
  if (e.estado !== "firmado") return res;
  const pagos = pagosDe(e);
  for (const f of i.fases) {
    if (parte === "cliente" && f.estado === "terminada") res.push({ texto: `Validar la fase «${f.nombre}»`, ir: "fases" });
  }
  HITOS.forEach((h, n) => {
    const reg = i.pagos[n] ?? {};
    if (parte === "cliente" && pagos[n] === "solicitado") res.push({ texto: `Pago pedido: ${h.texto}`, ir: "pagos" });
    if (parte === "reformista" && pagos[n] === "pendiente" && hitoListo(i, e, n)) res.push({ texto: `Ya puedes pedir el pago «${h.texto}»`, ir: "pagos" });
    if (parte === "reformista" && pagos[n] === "pagado" && !reg.cobrado) res.push({ texto: `Confirmar que has cobrado «${h.texto}»`, ir: "pagos" });
  });
  return res;
}

function Bloqueado({ e, parte, ir }: { e: Encargo; parte: Parte; ir: (p: Pestana) => void }) {
  const texto =
    e.estado === "presupuesto_final"
      ? parte === "cliente" ? "Las fases se abren cuando firméis el contrato. Ahora te toca a ti." : "Las fases se abren cuando firméis el contrato. Ahora le toca al cliente."
      : e.estado === "firmado_cliente"
        ? parte === "reformista" ? "El cliente ya ha firmado. Firma tú y empieza la obra." : "Ya has firmado. Falta la firma del reformista."
        : "Esta obra no está activa.";
  return (
    <Vacio>
      {texto}{" "}
      <button onClick={() => ir("contrato")} className="font-semibold text-teal-800 underline">Ir al contrato</button>
    </Vacio>
  );
}

function Resumen({ i, e, parte, ir }: { i: Intranet; e: Encargo; parte: Parte; ir: (p: Pestana) => void }) {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { t: "1. Contrato", d: e.estado === "firmado" ? "✓ Firmado por las dos partes" : ESTADO_ENCARGO[e.estado].texto, p: "contrato" as const },
          { t: "2. Fases de obra", d: `${i.fases.filter((f) => f.estado === "validada").length} de ${i.fases.length} validadas`, p: "fases" as const },
          { t: "3. Pagos", d: `${pagosDe(e).filter((p) => p === "pagado").length} de ${HITOS.length} hitos pagados`, p: "pagos" as const },
        ].map((x) => (
          <button key={x.t} onClick={() => ir(x.p)} className="rounded-2xl border border-stone-200 bg-white p-4 text-left hover:border-teal-600">
            <div className="text-sm font-semibold">{x.t}</div>
            <div className="mt-1 text-xs text-stone-600">{x.d}</div>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-semibold">Cómo funciona</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-stone-700">
          <li>Firmáis el contrato aquí mismo, cada uno desde su enlace.</li>
          <li>{parte === "reformista" ? "Tú vas abriendo cada fase y subes" : "El reformista va abriendo cada fase y sube"} fotos, certificados y comentarios.</li>
          <li>Al terminar una fase, {parte === "cliente" ? "tú la validas" : "el cliente la valida"} o indica qué falta repasar.</li>
          <li>Con cada fase validada se puede pedir el pago que toca. El pago se hace fuera de la app, directamente al reformista; aquí queda registrado y confirmado por los dos.</li>
        </ol>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-semibold">Últimos movimientos</h2>
        {i.actividad.length ? (
          <ul className="mt-2 space-y-1.5">
            {i.actividad.slice(0, 12).map((a, n) => (
              <li key={n} className="flex gap-2 text-xs">
                <span className="w-24 shrink-0 text-stone-500">{fechaHora(a.fecha)}</span>
                <span>{a.texto}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-stone-500">Aún no hay movimientos.</p>
        )}
      </div>
    </section>
  );
}

// ---------- Fases ----------

function Fases({ i, e, parte }: { i: Intranet; e: Encargo; parte: Parte }) {
  const actual = i.fases.find((f) => f.estado !== "validada")?.clave;
  const [abierta, setAbierta] = useState<string | null>(actual ?? null);
  return (
    <section className="space-y-2">
      {i.fases.map((f, n) => (
        <Fase key={f.clave} i={i} e={e} f={f} n={n + 1} parte={parte} abierta={abierta === f.clave} alAbrir={() => setAbierta(abierta === f.clave ? null : f.clave)} />
      ))}
    </section>
  );
}

function Fase({ i, e, f, n, parte, abierta, alAbrir }: { i: Intranet; e: Encargo; f: FaseObra; n: number; parte: Parte; abierta: boolean; alAbrir: () => void }) {
  const [repaso, setRepaso] = useState("");
  const [pidiendoRepaso, setPidiendoRepaso] = useState(false);
  const hito = hitoDeFase(i, f.clave);
  const fotos = f.entradas.filter((x) => x.tipo === "foto").length;
  const docs = f.entradas.filter((x) => x.tipo === "certificado").length;
  return (
    <div className={`rounded-2xl border bg-white ${f.estado === "en_curso" || f.estado === "terminada" ? "border-teal-600" : "border-stone-200"}`}>
      <button onClick={alAbrir} className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left">
        <div>
          <div className="font-medium">{n}. {f.nombre}</div>
          <div className="text-xs text-stone-500">
            ~{f.dias} {f.dias === 1 ? "día" : "días"}{f.empezada ? ` · empezó ${fechaCorta(f.empezada)}` : ""}{f.validada ? ` · validada ${fechaCorta(f.validada)}` : ""}
            {fotos ? ` · ${fotos} foto${fotos > 1 ? "s" : ""}` : ""}{docs ? ` · ${docs} documento${docs > 1 ? "s" : ""}` : ""}
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_FASE[f.estado].cls}`}>{ESTADO_FASE[f.estado].texto}</span>
      </button>
      {abierta && (
        <div className="space-y-3 border-t border-stone-100 p-4 text-sm">
          <p className="text-stone-700">{f.explicacion}</p>
          {f.tareas.length > 0 && <p className="text-xs text-stone-500">Incluye: {f.tareas.join(" · ")}</p>}
          {hito !== null && (
            <p className="rounded-lg bg-teal-50 p-2 text-xs text-teal-900">💶 Al validar esta fase toca el pago «{HITOS[hito].texto}» ({HITOS[hito].pct} %).</p>
          )}
          {f.certificados.length > 0 && (
            <div className="text-xs">
              <div className="font-medium text-stone-700">Documentos que suelen pedirse en esta fase</div>
              <ul className="mt-1 space-y-0.5">
                {f.certificados.map((c) => {
                  const subido = f.entradas.some((x) => x.tipo === "certificado" && x.texto === c);
                  return <li key={c} className={subido ? "text-emerald-700" : "text-stone-500"}>{subido ? "✓" : "○"} {c}</li>;
                })}
              </ul>
            </div>
          )}
          {f.repaso && f.estado === "en_curso" && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">El cliente pidió repasar: {f.repaso}</p>}

          {/* Acciones del estado de la fase */}
          <div className="flex flex-wrap gap-2">
            {parte === "reformista" && f.estado === "pendiente" && (
              <button onClick={() => empezarFase(e.id, f.clave, f.nombre)} className="rounded-xl bg-teal-700 px-4 py-2 font-medium text-white">Empezar esta fase</button>
            )}
            {parte === "reformista" && f.estado === "en_curso" && (
              <button onClick={() => terminarFase(e.id, f.clave, f.nombre)} className="rounded-xl bg-teal-700 px-4 py-2 font-medium text-white">Fase terminada: pedir validación</button>
            )}
            {parte === "reformista" && f.estado === "terminada" && <p className="text-xs text-stone-500">Esperando a que el cliente la valide.</p>}
            {parte === "cliente" && f.estado === "terminada" && !pidiendoRepaso && (
              <>
                <button onClick={() => validarFase(e.id, f.clave, f.nombre)} className="rounded-xl bg-teal-700 px-4 py-2 font-medium text-white">Validar fase</button>
                <button onClick={() => setPidiendoRepaso(true)} className="rounded-xl border border-stone-300 px-4 py-2">Falta algo</button>
              </>
            )}
            {parte === "cliente" && pidiendoRepaso && (
              <div className="flex w-full gap-2">
                <input className={`${inputCls} flex-1`} placeholder="¿Qué falta o hay que repasar?" value={repaso} onChange={(x) => setRepaso(x.target.value)} />
                <button disabled={!repaso.trim()} onClick={() => { pedirRepaso(e.id, f.clave, f.nombre, repaso.trim()); setRepaso(""); setPidiendoRepaso(false); }} className="rounded-xl bg-stone-900 px-3 text-white disabled:opacity-40">Enviar</button>
              </div>
            )}
          </div>

          <Entradas f={f} />
          <NuevaEntrada e={e} f={f} parte={parte} />
        </div>
      )}
    </div>
  );
}

function Entradas({ f }: { f: FaseObra }) {
  if (!f.entradas.length) return <p className="text-xs text-stone-500">Todavía no hay fotos, documentos ni comentarios en esta fase.</p>;
  return (
    <ul className="space-y-2">
      {f.entradas.map((x) => <Entrada key={x.id} x={x} />)}
    </ul>
  );
}

function Entrada({ x }: { x: EntradaFase }) {
  return (
    <li className={`rounded-xl p-2.5 text-xs ${x.autor === "cliente" ? "bg-sky-50" : "bg-stone-50"}`}>
      <div className="text-stone-500">{x.autor === "cliente" ? "Cliente" : "Reformista"} · {fechaHora(x.fecha)}{x.tipo === "certificado" ? " · 📄 Documento" : ""}</div>
      {x.archivo && <VerArchivo a={x.archivo} foto={x.tipo === "foto"} />}
      {x.texto && !(x.tipo === "certificado" && x.archivo?.nombre === x.texto) && <div className="mt-1 whitespace-pre-line text-sm text-stone-800">{x.texto}</div>}
    </li>
  );
}

function VerArchivo({ a, foto }: { a: Archivo; foto: boolean }) {
  const [grande, setGrande] = useState(false);
  const datos = datosArchivo(a);
  if (!datos) return <div className="mt-1 text-stone-600">📎 {a.nombre} <span className="text-stone-400">(en la demo solo se guarda el nombre: archivo demasiado grande para el navegador)</span></div>;
  if (foto || a.tipo.startsWith("image/"))
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={datos} alt={a.nombre} onClick={() => setGrande(true)} className="mt-1 max-h-48 cursor-zoom-in rounded-lg" />
        {grande && (
          <div onClick={() => setGrande(false)} className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={datos} alt={a.nombre} className="max-h-full max-w-full rounded-lg" />
          </div>
        )}
      </>
    );
  return <a href={datos} download={a.nombre} className="mt-1 inline-block font-medium text-teal-800 underline">📎 {a.nombre} ({Math.max(1, Math.round(a.bytes / 1024))} KB)</a>;
}

const leerComoDatos = (f: File) =>
  new Promise<string>((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => mal(r.error);
    r.readAsDataURL(f);
  });

function NuevaEntrada({ e, f, parte }: { e: Encargo; f: FaseObra; parte: Parte }) {
  const [tipo, setTipo] = useState<TipoEntrada>("comentario");
  const [texto, setTexto] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [certificado, setCertificado] = useState(f.certificados[0] ?? "");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const tipos: { id: TipoEntrada; texto: string }[] = [
    { id: "comentario", texto: "💬 Comentario" },
    { id: "foto", texto: "📷 Foto" },
    ...(parte === "reformista" ? [{ id: "certificado" as const, texto: "📄 Certificado o documento" }] : []),
  ];
  const listo = tipo === "comentario" ? !!texto.trim() : !!archivo;
  const enviar = async () => {
    setEnviando(true);
    setAviso("");
    try {
      let adj: { nombre: string; tipo: string; datos: string; bytes: number } | undefined;
      if (archivo) {
        if (tipo === "foto" || archivo.type.startsWith("image/")) {
          const datos = await fotoSinUbicacion(archivo, 1024);
          adj = { nombre: archivo.name.replace(/\.[^.]+$/, "") + ".jpg", tipo: "image/jpeg", datos, bytes: Math.round(datos.length * 0.75) };
        } else {
          if (archivo.size > MAX_ARCHIVO_DEMO) setAviso("En la demo los archivos de más de 900 KB solo guardan el nombre. Con la base de datos se guardarán enteros.");
          adj = { nombre: archivo.name, tipo: archivo.type || "application/pdf", datos: archivo.size <= MAX_ARCHIVO_DEMO ? await leerComoDatos(archivo) : "", bytes: archivo.size };
        }
      }
      const txt = tipo === "certificado" ? (texto.trim() || certificado || adj?.nombre || "") : texto.trim();
      const ok = anadirEntrada(e.id, f.clave, f.nombre, parte, tipo, txt, adj);
      if (!ok) setAviso("No se ha podido guardar: el navegador está lleno. En la demo caben pocas fotos; con la base de datos no hay este límite.");
      else {
        setTexto("");
        setArchivo(null);
      }
    } catch {
      setAviso("No se ha podido leer el archivo.");
    } finally {
      setEnviando(false);
    }
  };
  return (
    <div className="space-y-2 rounded-xl border border-dashed border-stone-300 p-3">
      <div className="flex flex-wrap gap-1">
        {tipos.map((t) => (
          <button key={t.id} onClick={() => { setTipo(t.id); setArchivo(null); }} className={`rounded-full px-3 py-1 text-xs ${tipo === t.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"}`}>{t.texto}</button>
        ))}
      </div>
      {tipo === "certificado" && f.certificados.length > 0 && (
        <select className={inputCls} value={certificado} onChange={(x) => setCertificado(x.target.value)}>
          {f.certificados.map((c) => <option key={c}>{c}</option>)}
          <option value="">Otro documento</option>
        </select>
      )}
      {tipo !== "comentario" && (
        <input
          type="file"
          accept={tipo === "foto" ? "image/*" : "application/pdf,image/*"}
          {...(tipo === "foto" && { capture: "environment" as const })}
          onChange={(x) => setArchivo(x.target.files?.[0] ?? null)}
          className="block w-full text-xs"
        />
      )}
      <textarea
        rows={2}
        maxLength={2000}
        value={texto}
        onChange={(x) => setTexto(x.target.value)}
        placeholder={tipo === "comentario" ? (parte === "reformista" ? "Ej.: Terminada la roza de la cocina, mañana entra el fontanero" : "Escribe una duda o un comentario para el reformista") : tipo === "certificado" ? "Nombre del documento (si es otro)" : "Pie de foto (opcional)"}
        className={inputCls}
      />
      {tipo === "foto" && <p className="text-[11px] text-stone-500">La foto se reduce y se le quita la ubicación GPS antes de guardarla. Evita fotografiar el portal, el número o documentos con datos personales.</p>}
      <button disabled={!listo || enviando} onClick={enviar} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">{enviando ? "Guardando…" : "Añadir a esta fase"}</button>
      {aviso && <p className="text-xs text-amber-800">{aviso}</p>}
    </div>
  );
}

// ---------- Pagos ----------

function Pagos({ i, e, parte }: { i: Intranet; e: Encargo; parte: Parte }) {
  const [nota, setNota] = useState<Record<number, string>>({});
  if (!e.final) return null;
  const total = e.final.importe * (1 + IVA_REFORMA / 100);
  const reserva = reservaEncargo(e, e.final.importe);
  const pagos = pagosDe(e);
  const importe = (n: number) => (total * HITOS[n].pct) / 100 - (n === 0 ? reserva : 0);
  const pagado = HITOS.reduce((s, _, n) => s + (pagos[n] === "pagado" ? importe(n) : 0), reserva);
  return (
    <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Pagos del contrato</h2>
        <span className="text-xs text-stone-500">Pagado {euros(pagado)} de {euros(total)} con IVA</span>
      </div>
      <Barra pct={total ? Math.round((pagado / total) * 100) : 0} />
      <p className="text-xs text-stone-600">
        Los pagos de la obra se hacen <b>directamente al reformista</b>, fuera de la app (transferencia o como acordéis). Aquí solo se registran: el reformista pide cada pago cuando toca, el cliente marca que lo ha pagado y el reformista confirma que lo ha cobrado.
      </p>
      <ul className="space-y-2">
        {reserva > 0 && (
          <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 p-3 text-xs">
            <span>Reserva pagada en la app al firmar</span>
            <span className="font-medium text-emerald-700">{euros(reserva)} · ✓ Pagada</span>
          </li>
        )}
        {HITOS.map((h, n) => {
          const p = pagos[n];
          const reg = i.pagos[n] ?? {};
          const listo = hitoListo(i, e, n);
          return (
            <li key={h.texto} className="space-y-2 rounded-xl border border-stone-200 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{h.pct} % · {h.texto}{n === 0 && reserva > 0 ? " (menos la reserva)" : ""}</div>
                  <div className="text-xs text-stone-500">
                    {euros(importe(n))}
                    {reg.solicitado ? ` · pedido el ${fechaCorta(reg.solicitado)}` : ""}
                    {reg.pagado ? ` · pagado el ${fechaCorta(reg.pagado)}` : ""}
                    {reg.cobrado ? ` · cobro confirmado el ${fechaCorta(reg.cobrado)}` : ""}
                    {reg.nota ? ` · ${reg.nota}` : ""}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p === "pagado" ? (reg.cobrado || !reg.pagado ? "bg-emerald-100 text-emerald-800" : "bg-teal-100 text-teal-900") : p === "solicitado" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600"}`}>
                  {p === "pagado" ? (reg.pagado && !reg.cobrado ? "Pagado · falta confirmar cobro" : "✓ Pagado") : p === "solicitado" ? "Pedido" : listo ? "Se puede pedir" : "Pendiente"}
                </span>
              </div>
              {parte === "reformista" && p === "pendiente" && (
                listo
                  ? <button onClick={() => pedirPago(e.id, n)} className="rounded-full border border-teal-700 px-3 py-1 text-xs font-medium text-teal-800">Pedir este pago al cliente</button>
                  : <p className="text-xs text-stone-500">{n === 0 ? "Se puede pedir al firmar el contrato." : `Se puede pedir cuando el cliente valide la fase «${faseDeHito(i, n)?.nombre ?? "de entrega"}».`}</p>
              )}
              {parte === "cliente" && p === "solicitado" && (
                <div className="flex flex-wrap gap-2">
                  <input className={`${inputCls} min-w-40 flex-1`} placeholder="Cómo lo has pagado (opcional): transferencia, fecha…" value={nota[n] ?? ""} onChange={(x) => setNota({ ...nota, [n]: x.target.value })} />
                  <button onClick={() => marcarPagado(e.id, n, (nota[n] ?? "").trim())} className="rounded-full bg-teal-700 px-3 py-1 text-xs font-medium text-white">Ya he pagado</button>
                </div>
              )}
              {parte === "reformista" && p === "pagado" && reg.pagado && !reg.cobrado && (
                <button onClick={() => confirmarCobro(e.id, n)} className="rounded-full bg-teal-700 px-3 py-1 text-xs font-medium text-white">Confirmar que lo he cobrado</button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-stone-400">{APP.nombre} no cobra ni guarda el dinero de la obra. Este registro sirve a las dos partes como justificante del avance y de los pagos.</p>
    </section>
  );
}

// ---------- Fotos y documentos de toda la obra ----------

function Documentos({ i }: { i: Intranet }) {
  const todas = i.fases.flatMap((f) => f.entradas.filter((x) => x.archivo).map((x) => ({ f, x })));
  const fotos = todas.filter(({ x }) => x.tipo === "foto");
  const docs = todas.filter(({ x }) => x.tipo === "certificado");
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-semibold">Certificados y documentos ({docs.length})</h2>
        {docs.length ? (
          <ul className="mt-2 space-y-2">
            {docs.map(({ f, x }) => (
              <li key={x.id} className="text-xs">
                <div className="text-stone-500">{f.nombre} · {fechaCorta(x.fecha)}</div>
                <div className="font-medium">{x.texto}</div>
                {x.archivo && <VerArchivo a={x.archivo} foto={false} />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-stone-500">Aquí se juntarán el boletín eléctrico, las garantías, el certificado de residuos y el resto de documentos que suba el reformista.</p>
        )}
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
        <h2 className="font-semibold">Fotos de la obra ({fotos.length})</h2>
        {fotos.length ? (
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {fotos.map(({ f, x }) => (
              <li key={x.id} className="text-xs">
                {x.archivo && <VerArchivo a={x.archivo} foto />}
                <div className="mt-0.5 text-stone-500">{f.nombre} · {fechaCorta(x.fecha)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-stone-500">Las fotos que se suban en cada fase aparecerán aquí, ordenadas por fase.</p>
        )}
      </div>
    </section>
  );
}
