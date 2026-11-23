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
import { AVISO_TARIFAS, LETRA_PEQUENA_TARIFAS, TEXTO_RESERVA, TEXTO_VISITA_REFORMISTA } from "@/lib/comercializacion";
import { TEXTO_VISIBILIDAD } from "@/lib/visibilidad";
import { anonimizar } from "@/lib/anonimizar";
import { BENEFICIOS_PROFESIONAL } from "@/lib/beneficios";
import { TEXTO_DATOS_PROFESIONAL } from "@/lib/legal";
import { altaVacia, CERTIFICACIONES, HABILITACIONES, habilitacionesVacias, OPCIONES_HABILITACION, TRAMOS_FACTURACION, CURSOS_PREVENCION, INICIOS, SERVICIOS_PREVENCION, TIPOS_PROYECTO, ESPECIALIDADES, nifValido, OBRAS_MINIMAS, TEXTO_COMPROMISO_INVITADOS, TEXTO_COMPROMISO_VENTAS, TEXTO_CONSENTIMIENTO_PROVEEDOR, TEXTO_DECLARACION_RESPONSABLE, ZONAS, type AltaProveedor } from "@/lib/proveedores";
import { enviarAlta } from "@/lib/proveedores-cliente";

const NOMBRE = APP.nombre;
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
      // Demostración: la obra del cliente que le ha invitado aparece en su área, sin reserva ni fee
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
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={publico("/icon.svg")} alt="" className="h-10 w-10" />
        <div>
          <div className="text-xs text-stone-500">{NOMBRE}</div>
          <h1 className="text-xl font-semibold">Homologación de reformistas</h1>
        </div>
      </div>
      {invitacion && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
          <div className="font-semibold">🤝 {invitacion.datos.cliente} te ha invitado a llevar su reforma con la app</div>
          <p className="mt-1">
            Al ser tu cliente, en esta obra no pagáis nada ninguno de los dos: ni reserva ni fee. Rellena tu alta y la obra aparecerá en tu área para meter el presupuesto acordado y firmar el contrato en la app. Para generar el contrato tendrás que subir tu seguro RSC (responsabilidad civil) y los certificados al corriente de pago.
          </p>
        </div>
      )}
      <p className="text-sm text-stone-600">
        Trabaja con clientes que ya tienen su reforma definida. Para aparecer en la app revisamos tu documentación: prevención de riesgos laborales (inscripción en el REA si la tienes; no es obligatoria para todos), seguro RSC (responsabilidad civil), certificado al corriente de pago, cuentas depositadas y obras que podamos comprobar. Primero rellena este cuestionario;
        después te daremos un enlace privado para subir los documentos. Si todo está completo y en vigor, quedas homologado al momento.
      </p>
      <div className="grid gap-2 text-sm sm:grid-cols-3">
        {[
          ["🎯", "Te conseguimos visitas cualificadas para que termines de vender tu reforma", `Solo vas a casa de clientes que ya han visto tu precio, te han elegido y han pagado para pedir visitas: van en serio. Sin cuotas por contacto: cada visita cuesta ${TEXTO_VISITA_REFORMISTA.replace(" por cada visita a la que vas", "")} y, si el cliente firma en la app, el fee es la reserva que él paga al firmar (${TEXTO_RESERVA}).`],
          ["📋", "Tus tarifas trabajan por ti", `Cargas tus tarifas una vez y la app calcula tu presupuesto a cada cliente. Solo vas a las visitas de quien ya te ha elegido. ${AVISO_TARIFAS}. ${LETRA_PEQUENA_TARIFAS}`],
          ["⭐", "Puntos de visibilidad", `${TEXTO_VISIBILIDAD} Los clientes que traes no pagan nada y te suman puntos.`],
          ...BENEFICIOS_PROFESIONAL.filter((b) => !b.t.startsWith("Clientes que")).map((b) => [b.i, b.t, b.d]),
        ].map(([i, t, d]) => (
          <div key={t} className="rounded-xl bg-amber-50 p-3"><div className="font-semibold">{i} {t}</div><div className="mt-1 text-stone-600">{d}</div></div>
        ))}
      </div>

      <Tarjeta className="space-y-3 border-teal-200">
        <h2 className="font-semibold">Declaración responsable y compromiso de ventas</h2>
        <p className="text-sm text-stone-700">{TEXTO_DECLARACION_RESPONSABLE}</p>
        <p className="text-sm text-stone-700"><b>Ventas que llegan por la app.</b> {TEXTO_COMPROMISO_VENTAS}</p>
        <p className="text-sm text-stone-700"><b>Clientes tuyos y clientes de la app.</b> {TEXTO_COMPROMISO_INVITADOS}</p>
        <p className="text-sm text-stone-700"><b>Datos de los clientes.</b> {TEXTO_DATOS_PROFESIONAL}</p>
        <p className="text-xs text-stone-400">Texto pendiente de revisión legal.</p>
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
          <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-950">⚠️ Tu presentación tiene datos que te identifican (nombre, teléfono, email, web o redes). Los clientes la verán así: «{anonimizar(a.presentacion, a).texto}». Tu nombre y contactos solo se comparten cuando el cliente firma.</p>
        ) : (
          <p className="text-xs text-stone-500">No pongas tu nombre ni contactos: tu ficha es anónima hasta que el cliente firma, y los ocultamos automáticamente.</p>
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
