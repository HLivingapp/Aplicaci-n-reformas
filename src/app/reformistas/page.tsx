"use client";

import { publico } from "@/lib/base";
import { APP } from "@/lib/marca";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { aceptarInvitacion, invitacionDe, type Invitacion } from "@/lib/encargos";
import { conBaseDeDatos } from "@/lib/modo";
import { fichaRed } from "@/lib/red";
import { leerLocal } from "@/lib/store";
import { Chips } from "@/components/Chips";
import { Boton, Campo, inputCls, Tarjeta } from "@/components/ui";
import { AVISO_TARIFAS, LETRA_PEQUENA_TARIFAS, PRECIO_CITA } from "@/lib/comercializacion";
import { MiniVideo } from "@/components/MiniVideo";
import { TEXTO_VISIBILIDAD } from "@/lib/visibilidad";
import { anonimizar } from "@/lib/anonimizar";
import { BENEFICIOS_PROFESIONAL } from "@/lib/beneficios";
import { TEXTO_DATOS_PROFESIONAL } from "@/lib/legal";
import { altaVacia, CERTIFICACIONES, HABILITACIONES, habilitacionesVacias, OPCIONES_HABILITACION, TRAMOS_FACTURACION, CURSOS_PREVENCION, INICIOS, SERVICIOS_PREVENCION, TIPOS_PROYECTO, ESPECIALIDADES, nifValido, OBRAS_MINIMAS, TEXTO_COMPROMISO_INVITADOS, TEXTO_COMPROMISO_VENTAS, TEXTO_CONSENTIMIENTO_PROVEEDOR, TEXTO_DECLARACION_RESPONSABLE, ZONAS, type AltaProveedor } from "@/lib/proveedores";
import { enviarAlta } from "@/lib/proveedores-cliente";

const NOMBRE = APP.nombre;

/** Bloques del área de reformistas. Cada uno tiene su mini vídeo en public/videos/mini/<video>.mp4 (aparece cuando existe). */
const VENTAJAS_PRO = [
  { i: "🎯", t: "Clientes que ya te han elegido", d: "Han pagado por ver tu precio y te piden cita.", video: "rf-clientes", foto: "salon-amplio" },
  { i: "💬", t: "Opiniones serias", d: "Entrevistamos a tus clientes, sin estrellas sueltas.", video: "rf-opiniones", foto: "bano" },
  { i: "📊", t: "Tus números de venta", d: "% vendido de tus citas y coste por venta.", video: "rf-cobros", foto: "cocina" },
  { i: "⭐", t: "Más visible", d: "Cada obra vendida te sube en los resultados.", video: "rf-visibilidad", foto: "vestidor" },
];
const PASOS_PRO = [
  { i: "📝", t: "Alta y homologación", d: "10 minutos. Al momento si todo está en vigor.", video: "rf-homologacion" },
  { i: "📑", t: "Tus tarifas", d: "Tus % por capítulo, o sube 20 presupuestos y sacamos tus precios.", video: "rf-tarifas" },
  { i: "🤝", t: "Chat, cita y venta", d: `Te avisamos por email y WhatsApp, chateas gratis y pagas ${PRECIO_CITA} al aceptar la cita.`, video: "rf-avances" },
];
const VIDEO_BENEFICIO: Record<string, string> = {};
for (const b of BENEFICIOS_PROFESIONAL) {
  if (/invita/i.test(b.t)) VIDEO_BENEFICIO[b.t] = "rf-invita";
  else if (/financiaci/i.test(b.t)) VIDEO_BENEFICIO[b.t] = "rf-financiacion";
}
const OPCIONES_ZONA = ZONAS.map((z) => ({ valor: z, texto: z.replace("Madrid - ", "") }));

export default function AltaReformista() {
  const router = useRouter();
  const [a, setA] = useState<AltaProveedor>(altaVacia);
  const [acepto, setAcepto] = useState(false);
  const [declaro, setDeclaro] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitacion, setInvitacion] = useState<Invitacion | null>(null);
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("invita");
    if (c) setInvitacion(invitacionDe(c) ?? null);
  }, []);
  const set = <K extends keyof AltaProveedor>(k: K, v: AltaProveedor[K]) => setA((x) => ({ ...x, [k]: v }));
  const setObra = (i: number, campo: keyof AltaProveedor["obras"][number], v: string | number) =>
    setA((x) => ({ ...x, obras: x.obras.map((o, j) => (j === i ? { ...o, [campo]: v } : o)) }));

  const setP = <K extends keyof AltaProveedor["perfil"]>(k: K, v: AltaProveedor["perfil"][K]) => setA((x) => ({ ...x, perfil: { ...x.perfil, [k]: v } }));
  const pf = a.perfil;
  const hab = pf.habilitaciones ?? habilitacionesVacias();
  const fact = pf.facturacion ?? { ejercicio: new Date().getFullYear() - 1, tramo: "" };
  const obrasOk = a.obras.filter((o) => o.descripcion.trim() && o.contacto.trim()).length >= OBRAS_MINIMAS;
  const faltan = [
    !a.razonSocial.trim() && "nombre o razón social",
    !nifValido(a.nif) && (a.nif.trim() ? "un NIF/CIF válido" : "NIF/CIF"),
    !a.contacto.trim() && "persona de contacto",
    !a.telefono.trim() && !a.email.trim() && "teléfono o email",
    a.rea.inscrito && !a.rea.numero.trim() && "número de REA",
    !pf.servicioPrevencion && "servicio de prevención",
    !a.rc.aseguradora.trim() && "aseguradora de RC",
    !pf.proyectosEjecutados && "número de proyectos ejecutados",
    !pf.tiposProyecto.length && "tipo de proyectos",
    pf.cuentas.presentadas === null && "cuentas del último año",
    !fact.tramo && "facturación anual",
    HABILITACIONES.some((h) => !hab[h.clave]) && "boletines y legalizaciones",
    !pf.disponibilidad.inicio && "disponibilidad",
    !obrasOk && !invitacion && `${OBRAS_MINIMAS} obras de referencia`,
    !a.zonas.length && "zonas",
    !a.especialidades.length && "especialidades",
    !acepto && "aceptar la política de privacidad",
  ].filter(Boolean) as string[];

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      const token = await enviarAlta(a, declaro, acepto);
      // Demostración: la obra del cliente que le ha invitado aparece en su área, sin coste para ninguno
      const p = invitacion && !conBaseDeDatos ? leerLocal().proveedores.find((x) => x.token === token) : undefined;
      if (invitacion && p) aceptarInvitacion(invitacion.codigo, fichaRed(p));
      router.push(`/reformista/${token}?nuevo`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar");
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pb-16 pt-6">
      <section className="relative -mx-4 -mt-6 overflow-hidden bg-stone-950 px-4 pb-8 pt-6 text-white sm:rounded-b-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={publico("/fotos/obra/cocina-salon.webp")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/60 to-stone-950" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-stone-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publico("/icon.svg")} alt="" className="h-7 w-7" /> {NOMBRE} · para reformistas
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight">Clientes que te buscan para hacerles la obra</h1>
          <p className="mt-3 text-stone-200">Con su reforma definida y tu precio ya visto.</p>
          {/* Así lo ves en la app */}
          <div className="mt-5 rounded-2xl bg-white p-4 text-stone-900 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100">🔔</span> Un cliente te ha elegido</div>
            <div className="mt-2 text-sm font-semibold">Reforma integral · 85 m² · Chamberí</div>
            <div className="mt-1 flex items-baseline justify-between text-sm"><span className="text-stone-500">Tu presupuesto (con tus tarifas)</span><span className="font-display text-xl font-semibold">92.400 €</span></div>
            <div className="mt-2 flex gap-2 text-xs"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">✓ Visita pedida</span><span className="rounded-full bg-stone-100 px-2 py-0.5">Jueves 10:00</span></div>
          </div>
          <a href="#alta" className="mt-6 block rounded-2xl bg-amber-400 px-6 py-4 text-center text-lg font-semibold text-stone-900 hover:bg-amber-300">Darme de alta gratis</a>
          <p className="mt-2 text-center text-xs text-stone-300">Homologación automática · sin permanencia</p>
        </div>
      </section>

      {invitacion && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
          <div className="font-semibold">🤝 {invitacion.datos.cliente} te ha invitado a llevar su reforma con la app</div>
          <p className="mt-1">
            Al ser tu cliente, en esta obra no pagáis nada ninguno de los dos. Rellena tu alta y la obra aparecerá en tu área; si queréis, podéis usar el contrato estándar de la app. Para generar el contrato tendrás que subir tu seguro RSC (responsabilidad civil) y los certificados al corriente de pago.
          </p>
        </div>
      )}
      <section className="grid grid-cols-2 gap-3" aria-label="Ventajas">
        {VENTAJAS_PRO.map((v) => (
          <div key={v.video} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
            <div className="relative h-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publico(`/fotos/obra/${v.foto}.webp`)} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute bottom-2 left-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow">{v.i}</span>
            </div>
            <div className="p-3">
              <h2 className="font-semibold">{v.t}</h2>
              <p className="text-sm text-stone-600">{v.d}</p>
              <MiniVideo tema={v.video} titulo={v.t} />
            </div>
          </div>
        ))}
      </section>

      <section aria-label="Cómo funciona">
        <h2 className="text-lg font-semibold">Cómo funciona</h2>
        <ol className="mt-3 space-y-2">
          {PASOS_PRO.map((x, i) => (
            <li key={x.video} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-2xl">{x.i}<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-semibold text-white">{i + 1}</span></span>
              <div>
                <div className="font-semibold">{x.t}</div>
                <p className="text-sm text-stone-600">{x.d}</p>
                <MiniVideo tema={x.video} titulo={x.t} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Obras">
        <h2 className="text-lg font-semibold">Obras como las tuyas</h2>
        <div className="-mx-4 mt-2 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
          {["salon", "ducha", "cocina-salon", "pasillo", "bano-lavabo"].map((f) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f} src={publico(`/fotos/obra/${f}.webp`)} alt="Reforma terminada" loading="lazy" className="h-40 w-56 shrink-0 snap-start rounded-2xl object-cover" />
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-teal-700 p-5 text-white" aria-label="Precio">
        <h2 className="text-lg font-semibold">Precio claro: pagas solo por citas con clientes interesados</h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <li className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-semibold">5 €<span className="text-sm font-normal">/mes</span></div>Suscripción, sin permanencia</li>
          <li className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-semibold">{PRECIO_CITA}</div>Por cita presencial que aceptas, con un cliente que ya ha pagado por ver tu precio y te ha elegido</li>
          <li className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-semibold">0 %</div>Sin comisión sobre la obra. Chat con el cliente gratis</li>
        </ul>
        <p className="mt-3 text-sm text-teal-50">Si el cliente no se presenta y no lo desmiente en 48 h, recuperas la cita. Si faltas tú sin avisar, la pierdes y sale un aviso en tu ficha.</p>
        <p className="mt-3 text-sm text-teal-50">Los clientes que traes tú no pagan nada y a ti tampoco te cuestan nada.</p>
        <MiniVideo tema="rf-pagos" titulo="Cuánto pagas y cuándo" oscuro />
        <a href="#alta" className="mt-4 block rounded-xl bg-white px-5 py-3 text-center font-semibold text-teal-800 hover:bg-teal-50">Darme de alta gratis</a>
      </section>

      <div className="space-y-2">
        <details className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Qué pedimos para homologarte</summary>
          <p className="mt-2 text-stone-600">
            Prevención de riesgos laborales (inscripción en el REA si la tienes; no es obligatoria para todos), seguro RSC (responsabilidad civil), certificado al corriente de pago, cuentas depositadas y obras que podamos comprobar. Primero rellenas el cuestionario; después te damos un enlace privado para subir los documentos. Si todo está completo y en vigor, quedas homologado al momento.
          </p>
          <MiniVideo tema="rf-homologacion" titulo="Cómo te homologas" />
        </details>
        <details className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Todas las ventajas y condiciones</summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["🎯", "Citas cualificadas", `Solo vas a casa de clientes que han pagado por ver tu ficha y tu precio y te han pedido cita. Te avisamos por email y WhatsApp, chateas gratis y pagas ${PRECIO_CITA} al aceptar la cita, vendas o no. Sin comisión sobre la obra.`, "rf-clientes"],
              ["📊", "Tus estadísticas de venta", "En tu panel ves qué % de tus citas vendes, cuánto te cuesta cada venta, cuánto vendes por cada euro en citas y cómo respondes en el chat.", "rf-cobros"],
              ["📋", "Tus tarifas trabajan por ti", `${AVISO_TARIFAS}. ${LETRA_PEQUENA_TARIFAS}`, "rf-tarifas"],
              ["⭐", "Puntos de visibilidad", `${TEXTO_VISIBILIDAD} Los clientes que traes no pagan nada y te suman puntos.`, "rf-visibilidad"],
              ...BENEFICIOS_PROFESIONAL.filter((x) => !x.t.startsWith("Clientes que")).map((x) => [x.i, x.t, x.d, VIDEO_BENEFICIO[x.t] ?? ""]),
            ].map(([i, t, d, v]) => (
              <div key={t} className="rounded-xl bg-amber-50 p-3"><div className="font-semibold">{i} {t}</div><div className="mt-1 text-stone-600">{d}</div>{v && <MiniVideo tema={v} titulo={t} />}</div>
            ))}
          </div>
        </details>
      </div>

      <div id="alta" className="scroll-mt-4" />
      <Tarjeta className="space-y-3 border-teal-200">
        <h2 className="font-semibold">Empieza tu alta: declaración responsable y compromiso de ventas</h2>
        <p className="text-sm text-stone-700">{TEXTO_DECLARACION_RESPONSABLE}</p>
        <p className="text-sm text-stone-700"><b>Citas con clientes de la app.</b> {TEXTO_COMPROMISO_VENTAS}</p>
        <p className="text-sm text-stone-700"><b>Clientes tuyos y clientes de la app.</b> {TEXTO_COMPROMISO_INVITADOS}</p>
        <p className="text-sm text-stone-700"><b>Datos de los clientes.</b> {TEXTO_DATOS_PROFESIONAL}</p>
        <p className="text-xs text-stone-400">Texto pendiente de revisión legal.</p>
        <MiniVideo tema="rf-compromiso" titulo="Tu compromiso con la app" />
        <label className="flex items-start gap-2 text-sm font-medium">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal-700" checked={declaro} onChange={(e) => setDeclaro(e.target.checked)} />
          <span>Lo declaro y acepto estas condiciones</span>
        </label>
      </Tarjeta>

      {declaro && (<>

      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">1. Tu empresa</h2>
        <div className="flex gap-2 text-sm">
          {(["empresa", "autonomo"] as const).map((t) => (
            <button key={t} type="button" onClick={() => set("tipo", t)} className={`flex-1 rounded-lg py-2 ${a.tipo === t ? "bg-stone-900 text-white" : "bg-stone-100"}`}>
              {t === "empresa" ? "Empresa" : "Autónomo"}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta={a.tipo === "empresa" ? "Razón social *" : "Nombre y apellidos *"}><input className={inputCls} value={a.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} /></Campo>
          <Campo etiqueta={a.tipo === "empresa" ? "CIF *" : "NIF *"}><input className={inputCls} value={a.nif} onChange={(e) => set("nif", e.target.value)} /></Campo>
          <Campo etiqueta="Persona de contacto *"><input className={inputCls} value={a.contacto} onChange={(e) => set("contacto", e.target.value)} /></Campo>
          <Campo etiqueta="Trabajadores en plantilla"><input type="number" min={1} className={inputCls} value={a.trabajadores} onChange={(e) => set("trabajadores", Number(e.target.value) || 1)} /></Campo>
          <Campo etiqueta="Teléfono"><input type="tel" className={inputCls} value={a.telefono} onChange={(e) => set("telefono", e.target.value)} /></Campo>
          <Campo etiqueta="Email"><input type="email" className={inputCls} value={a.email} onChange={(e) => set("email", e.target.value)} /></Campo>
          <Campo etiqueta="Web o redes (opcional)" className="sm:col-span-2"><input className={inputCls} value={a.web} onChange={(e) => set("web", e.target.value)} /></Campo>
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">2. Prevención de riesgos laborales</h2>
        <p className="text-sm text-stone-600">¿Estás inscrito en el REA (Registro de Empresas Acreditadas del sector de la construcción)?</p>
        <div className="flex gap-2 text-sm">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" onClick={() => set("rea", { ...a.rea, inscrito: v })} className={`flex-1 rounded-lg py-2 ${a.rea.inscrito === v ? "bg-stone-900 text-white" : "bg-stone-100"}`}>
              {v ? "Sí, estoy inscrito" : "No"}
            </button>
          ))}
        </div>
        {a.rea.inscrito ? (
          <Campo etiqueta="Número de inscripción en el REA *"><input className={inputCls} value={a.rea.numero} onChange={(e) => set("rea", { ...a.rea, numero: e.target.value })} /></Campo>
        ) : (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
            El REA no es obligatorio para todos, así que puedes darte de alta sin él. Los clientes verán en tu ficha que no estás inscrito. Te pediremos tu modalidad preventiva, la evaluación de riesgos y la formación en PRL de tu equipo.
          </p>
        )}
        <Campo etiqueta="¿Qué servicio de prevención tienes? *">
          <select className={inputCls} value={pf.servicioPrevencion} onChange={(e) => setP("servicioPrevencion", e.target.value as AltaProveedor["perfil"]["servicioPrevencion"])}>
            <option value="">Elige una opción</option>
            {SERVICIOS_PREVENCION.map((s) => <option key={s.valor} value={s.valor}>{s.texto}</option>)}
          </select>
        </Campo>
        {pf.servicioPrevencion === "ajeno" && (
          <Campo etiqueta="Entidad del servicio de prevención (opcional)"><input className={inputCls} placeholder="p. ej. Quirón Prevención, Cualtis…" value={pf.entidadPrevencion} onChange={(e) => setP("entidadPrevencion", e.target.value)} /></Campo>
        )}
        <div>
          <div className="mb-1.5 text-sm text-stone-700">Cursos de prevención que tiene tu equipo</div>
          <Chips opciones={CURSOS_PREVENCION} valores={pf.cursosPrevencion} cambiar={(v) => setP("cursosPrevencion", v)} />
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">3. Seguro RSC (responsabilidad civil)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Aseguradora *"><input className={inputCls} value={a.rc.aseguradora} onChange={(e) => set("rc", { ...a.rc, aseguradora: e.target.value })} /></Campo>
          <Campo etiqueta="Capital asegurado (€)"><input type="number" min={0} step={50000} className={inputCls} value={a.rc.capital || ""} onChange={(e) => set("rc", { ...a.rc, capital: Number(e.target.value) || 0 })} /></Campo>
        </div>
        <p className="text-xs text-stone-500">Te pediremos la póliza y el último recibo pagado en el siguiente paso.</p>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">4. Tu experiencia</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Proyectos ejecutados en total *"><input type="number" min={0} className={inputCls} value={pf.proyectosEjecutados || ""} onChange={(e) => setP("proyectosEjecutados", Math.max(0, Number(e.target.value) || 0))} /></Campo>
          <Campo etiqueta={`¿Presentaste las cuentas de ${pf.cuentas.ejercicio}? *`}>
            <div className="flex gap-2 text-sm">
              {[true, false].map((v) => (
                <button key={String(v)} type="button" onClick={() => setP("cuentas", { ...pf.cuentas, presentadas: v })} className={`flex-1 rounded-lg py-2 ${pf.cuentas.presentadas === v ? "bg-stone-900 text-white" : "bg-stone-100"}`}>{v ? "Sí" : "No"}</button>
              ))}
            </div>
          </Campo>
        </div>
        <p className="text-xs text-stone-500">{a.tipo === "empresa" ? "Cuentas anuales depositadas en el Registro Mercantil." : "Como autónomo: tu declaración de la renta y los pagos fraccionados (modelo 130 o 131)."} Te las pediremos en el siguiente paso.</p>
        <div>
          <div className="mb-1.5 text-sm text-stone-700">¿De qué tipo? *</div>
          <Chips opciones={TIPOS_PROYECTO} valores={pf.tiposProyecto} cambiar={(v) => setP("tiposProyecto", v)} />
        </div>
        <p className="text-sm text-stone-600">
          Cuéntanos {OBRAS_MINIMAS} obras recientes con una persona que podamos llamar para confirmarlas. Además te pediremos tus últimas cuentas anuales depositadas
          {a.tipo === "autonomo" ? " (o tu última declaración de la renta)" : ""}.
        </p>
        {a.obras.map((o, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-stone-200 p-3">
            <div className="text-xs font-medium text-stone-500">Obra {i + 1}</div>
            <textarea rows={2} className={inputCls} placeholder="Qué hiciste (p. ej. reforma integral de piso de 85 m², 2 baños y cocina)" value={o.descripcion} onChange={(e) => setObra(i, "descripcion", e.target.value)} />
            <div className="grid gap-2 sm:grid-cols-3">
              <input type="number" className={inputCls} placeholder="Año" value={o.ano} onChange={(e) => setObra(i, "ano", Number(e.target.value) || 0)} />
              <input type="number" className={inputCls} placeholder="Importe aprox. (€)" value={o.importe || ""} onChange={(e) => setObra(i, "importe", Number(e.target.value) || 0)} />
              <input className={inputCls} placeholder="Contacto (nombre y teléfono)" value={o.contacto} onChange={(e) => setObra(i, "contacto", e.target.value)} />
            </div>
          </div>
        ))}
        {a.obras.length < 10 && (
          <Boton variante="secundario" onClick={() => set("obras", [...a.obras, { descripcion: "", ano: new Date().getFullYear(), importe: 0, contacto: "" }])}>＋ Añadir otra obra</Boton>
        )}
        <p className="text-xs text-stone-500">Avisa a esas personas de que podemos llamarlas: sus datos solo los usamos para comprobar la obra.</p>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">Boletines, legalizaciones y volumen</h2>
        <p className="text-sm text-stone-600">Es lo que más mira un cliente antes de contratar: si podrás darle los boletines y legalizar las instalaciones, y el volumen real de tu empresa.</p>
        {HABILITACIONES.map((h) => (
          <div key={h.clave} data-habilitacion={h.clave}>
            <div className="mb-1.5 text-sm text-stone-700">{h.texto} *</div>
            <div className="flex flex-wrap gap-2 text-sm">
              {OPCIONES_HABILITACION.map((o) => (
                <button key={o.valor} type="button" onClick={() => setP("habilitaciones", { ...hab, [h.clave]: o.valor })} className={`rounded-lg px-3 py-2 ${hab[h.clave] === o.valor ? "bg-stone-900 text-white" : "bg-stone-100"}`}>{o.texto}</button>
              ))}
            </div>
          </div>
        ))}
        <Campo etiqueta={`Facturación de ${fact.ejercicio} (sin IVA) *`}>
          <select className={inputCls} value={fact.tramo} onChange={(e) => setP("facturacion", { ...fact, tramo: e.target.value })}>
            <option value="">Elige un tramo</option>
            {TRAMOS_FACTURACION.map((t) => <option key={t.valor} value={t.valor}>{t.texto}</option>)}
          </select>
        </Campo>
        <p className="text-xs text-stone-500">El cliente ve el tramo, no la cifra exacta. Lo comprobamos con tus cuentas{a.tipo === "autonomo" ? " o tu declaración de la renta" : ""}.</p>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">5. Dónde trabajas y cuándo puedes empezar</h2>
        <Chips opciones={OPCIONES_ZONA} valores={a.zonas} cambiar={(v) => set("zonas", v)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Disponibilidad habitual para empezar una obra *">
            <select className={inputCls} value={pf.disponibilidad.inicio} onChange={(e) => setP("disponibilidad", { ...pf.disponibilidad, inicio: e.target.value as AltaProveedor["perfil"]["disponibilidad"]["inicio"] })}>
              <option value="">Elige una opción</option>
              {INICIOS.map((s) => <option key={s.valor} value={s.valor}>{s.texto}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Obras que llevas a la vez"><input type="number" min={1} className={inputCls} value={pf.disponibilidad.obrasSimultaneas} onChange={(e) => setP("disponibilidad", { ...pf.disponibilidad, obrasSimultaneas: Math.max(1, Number(e.target.value) || 1) })} /></Campo>
          <Campo etiqueta="Cuándo sueles hacer visitas (opcional)" className="sm:col-span-2"><input className={inputCls} placeholder="p. ej. mañanas de lunes a viernes y sábados" value={pf.disponibilidad.visitas} onChange={(e) => setP("disponibilidad", { ...pf.disponibilidad, visitas: e.target.value })} /></Campo>
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">6. En qué eres especialista</h2>
        <Chips opciones={ESPECIALIDADES} valores={a.especialidades} cambiar={(v) => set("especialidades", v)} />
        <div>
          <div className="mb-1.5 text-sm text-stone-700">Certificaciones y habilitaciones profesionales</div>
          <Chips opciones={CERTIFICACIONES} valores={pf.certificaciones} cambiar={(v) => setP("certificaciones", v)} />
          <input className={`${inputCls} mt-2`} placeholder="Otras (opcional)" value={pf.otrasCertificaciones} onChange={(e) => setP("otrasCertificaciones", e.target.value)} />
        </div>
        <Campo etiqueta="Preséntate a los clientes (opcional)">
          <textarea rows={3} className={inputCls} value={a.presentacion} onChange={(e) => set("presentacion", e.target.value)} />
        </Campo>
        {anonimizar(a.presentacion, a).ocultos > 0 ? (
          <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-950">⚠️ Tu presentación tiene datos que te identifican (nombre, teléfono, email, web o redes). Los clientes la verán así: «{anonimizar(a.presentacion, a).texto}». Tu nombre y contactos solo se comparten cuando aceptas la cita.</p>
        ) : (
          <p className="text-xs text-stone-500">No pongas tu nombre ni contactos: tu ficha es anónima hasta que aceptas la cita, y los ocultamos automáticamente.</p>
        )}
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <label className="flex items-start gap-2 text-sm text-stone-600">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal-700" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
          <span>
            {TEXTO_CONSENTIMIENTO_PROVEEDOR} <Link href="/privacidad" target="_blank" className="text-teal-700 underline">Ver política de privacidad</Link>
          </span>
        </label>
        <p className="text-xs text-stone-500">Tus documentos se guardan en servidores de la Unión Europea y solo los ve nuestro equipo. Los clientes nunca ven tu documentación.</p>
        {faltan.length > 0 && <p className="text-sm text-stone-500">Falta: {faltan.join(", ")}.</p>}
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-800">{error}</p>}
        <Boton onClick={enviar} disabled={faltan.length > 0 || enviando} className="w-full">{enviando ? "Enviando…" : "Enviar y pasar a los documentos"}</Boton>
      </Tarjeta>
      </>)}
    </main>
  );
}
