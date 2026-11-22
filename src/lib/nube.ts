"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { BASE } from "./base";
import { conNube } from "./modo";
import { supabaseNavegador } from "./supabase/navegador";

/**
 * Nube de cada persona (Supabase, región UE).
 *
 * La app sigue leyendo y escribiendo en el navegador (localStorage), que es rápido y funciona sin conexión.
 * Cuando la persona ha entrado con el enlace de su email, esta capa copia sus datos a Supabase y los
 * recupera en cualquier otro dispositivo. Sin claves de Supabase no hace nada: todo queda como antes.
 *
 * Qué va a cada tabla (ver supabase/migrations):
 *  · datos_usuario     → lo personal: borrador del presupuesto, materiales elegidos (moodboard), suscripción…
 *  · proyectos_cliente → proyectos y presupuestos del cliente (lo que ve en su enlace privado)
 *  · encargos          → visitas, presupuesto final, contrato y avances, compartidos entre cliente y profesional
 *  · pagos             → pagos simulados (visitas, reserva, suscripción) hasta conectar Stripe
 *  · perfiles          → email, teléfono opcional y consentimientos con su fecha
 * Las políticas RLS hacen que cada uno solo pueda leer y escribir lo suyo.
 */

/** Claves del navegador que son datos de la persona y se guardan tal cual en datos_usuario. */
export const CLAVES_PERSONALES = [
  "app-reformas:borrador-proyecto",
  "rm-mi-seleccion",
  "app-reformas:suscripcion",
  "app-reformas:servicios-cliente",
  "app-reformas:pago-visitas",
  "app-reformas:devolucion-visitas",
  "app-reformas:invitacion-pro",
  "app-reformas:invitaciones",
  "app-reformas:tarifas-red",
  "app-reformas:estudios",
  "app-reformas:tarifas-estudios",
  "app-reformas:mis-proyectos",
] as const;

/** Colecciones compartidas entre cliente y profesional: cada elemento es una fila de «encargos». */
const COMPARTIDAS = {
  "app-reformas:encargos": { tipo: "obra", profesional: (e: Elemento) => String(e.reformistaId ?? "") },
  "app-reformas:encargos-estudio": { tipo: "estudio", profesional: (e: Elemento) => String(e.estudioId ?? "") },
} as const;
type ClaveCompartida = keyof typeof COMPARTIDAS;
type Elemento = { id: string; estado?: string; proyectoId?: string; [k: string]: unknown };

/** Proyectos de cliente creados en este navegador (tokens de su enlace privado). */
export const CLAVE_MIS_PROYECTOS = "app-reformas:mis-proyectos";
/** Datos de la app del cliente (los mismos que usa la demo), de donde salen sus proyectos. */
const CLAVE_DATOS = "app-reformas:datos";
/** Consentimientos que la persona dio al unirse, pendientes de guardar en su perfil. */
const CLAVE_CONSENTIMIENTO = "app-reformas:consentimiento-pendiente";

const leerJson = <T,>(clave: string, defecto: T): T => {
  try {
    const raw = localStorage.getItem(clave);
    return raw == null ? defecto : (JSON.parse(raw) as T);
  } catch {
    return defecto;
  }
};

// ---------------------------------------------------------------- sesión

let sesionActual: Session | null = null;
const oyentes = new Set<(s: Session | null) => void>();
let iniciado = false;

function iniciar() {
  if (iniciado || !conNube || typeof window === "undefined") return;
  iniciado = true;
  const s = supabaseNavegador();
  s.auth.getSession().then(({ data }) => cambioDeSesion(data.session));
  s.auth.onAuthStateChange((_e, sesion) => cambioDeSesion(sesion));
}

function cambioDeSesion(s: Session | null) {
  const antes = sesionActual?.user.id;
  sesionActual = s;
  oyentes.forEach((f) => f(s));
  if (s && s.user.id !== antes) {
    recordarMiembro(s);
    void sincronizarAlEntrar();
  }
}

/** Quien entra con el enlace queda unido a la comunidad en este dispositivo. */
function recordarMiembro(s: Session) {
  try {
    const m = JSON.parse(localStorage.getItem("app-reformas:miembro") ?? "null");
    if (m?.email === s.user.email) return;
    localStorage.setItem("app-reformas:miembro", JSON.stringify({ email: s.user.email, creado: s.user.created_at }));
    window.dispatchEvent(new Event("miembro"));
  } catch {
    /* sin almacenamiento */
  }
}

/** Sesión de la persona (null si no ha entrado; undefined mientras se comprueba). */
export function useSesionNube() {
  const [s, setS] = useState<Session | null | undefined>(conNube ? undefined : null);
  useEffect(() => {
    if (!conNube) return;
    iniciar();
    const f = (x: Session | null) => setS(x);
    oyentes.add(f);
    supabaseNavegador().auth.getSession().then(({ data }) => setS(data.session));
    return () => void oyentes.delete(f);
  }, []);
  return s;
}

/** Envía el enlace mágico al email. Al abrirlo vuelve a `destino` (ruta de la app) con la sesión iniciada. */
export async function enviarEnlace(email: string, destino = "/cuenta/"): Promise<string | null> {
  if (!conNube) return "La nube no está configurada.";
  const { error } = await supabaseNavegador().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: `${window.location.origin}${BASE}${destino}`, shouldCreateUser: true },
  });
  if (!error) return null;
  return /rate|limit|seconds/i.test(error.message)
    ? "Ya te hemos enviado un enlace hace muy poco. Espera un minuto y vuelve a intentarlo."
    : "No se ha podido enviar el enlace. Revisa el email y vuelve a intentarlo.";
}

export async function salirDeLaNube() {
  if (!conNube) return;
  await supabaseNavegador().auth.signOut();
}

/** Guarda los consentimientos del registro para pasarlos al perfil cuando entre con el enlace. */
export function anotarConsentimiento(c: { telefono?: string; privacidad: unknown; contacto?: unknown }) {
  try {
    localStorage.setItem(CLAVE_CONSENTIMIENTO, JSON.stringify(c));
  } catch {
    /* sin almacenamiento */
  }
  if (sesionActual) void subirConsentimiento();
}

async function subirConsentimiento() {
  const c = leerJson<{ telefono?: string; privacidad: unknown; contacto?: unknown } | null>(CLAVE_CONSENTIMIENTO, null);
  if (!c || !sesionActual) return;
  const { error } = await supabaseNavegador()
    .from("perfiles")
    .update({ telefono: c.telefono ?? null, consentimientos: { privacidad: c.privacidad, contacto: c.contacto ?? null } })
    .eq("id", sesionActual.user.id);
  if (!error) localStorage.removeItem(CLAVE_CONSENTIMIENTO);
}

// ---------------------------------------------------------------- subida de cambios

/**
 * Claves cambiadas aquí que aún no han subido. Se guardan también en el navegador: si la persona cierra
 * la página antes de que suban, al volver se suben en vez de sobrescribirlas con lo de la nube.
 */
const CLAVE_PENDIENTES = "nube:pendientes";
const pendientes = new Set<string>(typeof window === "undefined" ? [] : leerJson<string[]>(CLAVE_PENDIENTES, []));
const guardarPendientes = () => {
  try {
    localStorage.setItem(CLAVE_PENDIENTES, JSON.stringify([...pendientes]));
  } catch {
    /* sin almacenamiento */
  }
};
const copiaCompartida = new Map<ClaveCompartida, Map<string, string>>();
let temporizador: ReturnType<typeof setTimeout> | null = null;
let estado: "inactiva" | "sincronizando" | "al_dia" | "error" = "inactiva";
const oyentesEstado = new Set<() => void>();
const ponerEstado = (e: typeof estado) => {
  estado = e;
  oyentesEstado.forEach((f) => f());
};

/** Estado de la copia en la nube, para mostrarlo en «Mi cuenta». */
export function useEstadoNube() {
  const [e, setE] = useState(estado);
  useEffect(() => {
    const f = () => setE(estado);
    oyentesEstado.add(f);
    return () => void oyentesEstado.delete(f);
  }, []);
  return e;
}

/**
 * Avisa de que la app ha cambiado una clave del navegador. Si la persona ha entrado, se sube a la nube
 * (agrupando cambios seguidos). Se puede llamar siempre: sin nube o sin sesión no hace nada.
 */
export function avisarCambio(clave: string) {
  if (!conNube || typeof window === "undefined") return;
  iniciar();
  pendientes.add(clave);
  guardarPendientes();
  if (!sesionActual) return;
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(() => void subirPendientes(), 800);
}

async function subirPendientes() {
  if (!sesionActual || !pendientes.size) return;
  const claves = [...pendientes];
  pendientes.clear();
  ponerEstado("sincronizando");
  if (temporizador) clearTimeout(temporizador);
  try {
    for (const clave of claves) {
      if (clave in COMPARTIDAS) await subirCompartida(clave as ClaveCompartida);
      else if (clave === CLAVE_DATOS) await subirProyectos();
      else if ((CLAVES_PERSONALES as readonly string[]).includes(clave)) await subirPersonal(clave);
    }
    ponerEstado("al_dia");
  } catch {
    claves.forEach((c) => pendientes.add(c));
    ponerEstado("error");
  }
  guardarPendientes();
}

async function subirPersonal(clave: string) {
  const s = supabaseNavegador();
  const raw = localStorage.getItem(clave);
  if (raw == null) {
    const { error } = await s.from("datos_usuario").delete().eq("clave", clave);
    if (error) throw error;
    return;
  }
  const { error } = await s.from("datos_usuario").upsert({ usuario: sesionActual!.user.id, clave, valor: JSON.parse(raw), actualizado: new Date().toISOString() });
  if (error) throw error;
}

async function subirCompartida(clave: ClaveCompartida) {
  const cfg = COMPARTIDAS[clave];
  const lista = leerJson<Elemento[]>(clave, []);
  const antes = copiaCompartida.get(clave) ?? new Map<string, string>();
  const cambiados = lista.filter((e) => e?.id && antes.get(e.id) !== JSON.stringify(e));
  if (!cambiados.length) return;
  const s = supabaseNavegador();
  for (const e of cambiados) {
    const fila = { id: e.id, tipo: cfg.tipo, profesional_id: cfg.profesional(e), proyecto_id: e.proyectoId ?? null, estado: String(e.estado ?? ""), datos: e };
    // Si el encargo ya existe, solo se actualiza (el cliente y el profesional no cambian nunca)
    const { data, error } = await s.from("encargos").update({ estado: fila.estado, datos: fila.datos }).eq("id", e.id).select("id");
    if (error) throw error;
    if (!data?.length) {
      const { error: e2 } = await s.from("encargos").insert({ ...fila, cliente: sesionActual!.user.id });
      // Un encargo de otra persona que no podemos escribir (p. ej. ya firmado): se respeta lo de la nube
      if (e2 && e2.code !== "42501" && e2.code !== "23505") throw e2;
    }
    antes.set(e.id, JSON.stringify(e));
  }
  copiaCompartida.set(clave, antes);
}

/** Proyectos del cliente: de los datos de la app, solo los de los enlaces creados por esta persona. */
function proyectosLocales() {
  const datos = leerJson<Record<string, unknown> | null>(CLAVE_DATOS, null);
  const tokens = new Set(leerJson<string[]>(CLAVE_MIS_PROYECTOS, []));
  if (!datos || !tokens.size) return [];
  const clientes = ((datos.clientes as Elemento[]) ?? []).filter((c) => tokens.has(String(c.token)));
  return clientes.map((c) => {
    const de = (col: string) => ((datos[col] as Elemento[]) ?? []).filter((x) => x.clienteId === c.id);
    return { id: c.id, datos: { cliente: c, proyectos: de("proyectos"), presupuestos: de("presupuestos"), obras: de("obras") } };
  });
}

const copiaProyectos = new Map<string, string>();
async function subirProyectos() {
  const filas = proyectosLocales().filter((p) => copiaProyectos.get(p.id) !== JSON.stringify(p.datos));
  if (!filas.length) return;
  const ahora = new Date().toISOString();
  const { error } = await supabaseNavegador()
    .from("proyectos_cliente")
    .upsert(filas.map((f) => ({ ...f, usuario: sesionActual!.user.id, actualizado: ahora })));
  if (error) throw error;
  filas.forEach((f) => copiaProyectos.set(f.id, JSON.stringify(f.datos)));
}

/** Añade un proyecto recién creado a «mis proyectos» (para guardarlo en la nube). */
export function anotarMiProyecto(token: string) {
  try {
    const lista = leerJson<string[]>(CLAVE_MIS_PROYECTOS, []);
    if (!lista.includes(token)) localStorage.setItem(CLAVE_MIS_PROYECTOS, JSON.stringify([token, ...lista]));
  } catch {
    /* sin almacenamiento */
  }
  avisarCambio(CLAVE_MIS_PROYECTOS);
  avisarCambio(CLAVE_DATOS);
}

/** Registra un pago simulado (visitas, reserva, suscripción). Sin sesión no hace nada. */
export function registrarPago(concepto: "visitas_cliente" | "visita_profesional" | "reserva" | "suscripcion" | "devolucion_visitas" | "servicio", euros: number, referencia?: string) {
  if (!conNube || !sesionActual) return;
  void supabaseNavegador()
    .from("pagos")
    .insert({ usuario: sesionActual.user.id, concepto, importe_cent: Math.round(euros * 100), referencia: referencia?.slice(0, 110) ?? null })
    .then(() => undefined);
}

// ---------------------------------------------------------------- descarga al entrar

/**
 * Al entrar: lo que hay en la nube se trae a este navegador y lo que solo estaba aquí se sube.
 * Si llega algo nuevo se recarga la página una vez para que la app lo muestre.
 */
async function sincronizarAlEntrar() {
  const s = supabaseNavegador();
  ponerEstado("sincronizando");
  let cambiado = false;
  const poner = (clave: string, valor: unknown) => {
    const nuevo = JSON.stringify(valor);
    if (localStorage.getItem(clave) !== nuevo) {
      localStorage.setItem(clave, nuevo);
      cambiado = true;
    }
  };
  try {
    const [personales, encargos, proyectos] = await Promise.all([
      s.from("datos_usuario").select("clave,valor"),
      s.from("encargos").select("tipo,datos").order("creado", { ascending: false }),
      s.from("proyectos_cliente").select("id,datos"),
    ]);
    if (personales.error || encargos.error || proyectos.error) throw personales.error ?? encargos.error ?? proyectos.error;

    // 1. Datos personales: manda la nube; lo que solo está aquí, se sube.
    const enNube = new Map((personales.data ?? []).map((f) => [f.clave as string, f.valor]));
    for (const clave of CLAVES_PERSONALES) {
      if (pendientes.has(clave)) continue; // cambiado aquí y aún sin subir: manda lo de aquí
      if (enNube.has(clave)) {
        if (clave === CLAVE_MIS_PROYECTOS) poner(clave, [...new Set([...(enNube.get(clave) as string[]), ...leerJson<string[]>(clave, [])])]);
        else poner(clave, enNube.get(clave));
      } else if (localStorage.getItem(clave) != null) pendientes.add(clave);
    }

    // 2. Encargos: los de la nube más los que se pidieron aquí sin sesión.
    for (const [clave, cfg] of Object.entries(COMPARTIDAS) as [ClaveCompartida, (typeof COMPARTIDAS)[ClaveCompartida]][]) {
      const nube = (encargos.data ?? []).filter((f) => f.tipo === cfg.tipo).map((f) => f.datos as Elemento);
      const ids = new Set(nube.map((e) => e.id));
      const local = leerJson<Elemento[]>(clave, []);
      const soloAqui = local.filter((e) => e?.id && !ids.has(e.id));
      // Si aquí hay cambios sin subir, manda la versión de aquí (y se sube); si no, la de la nube
      const pendiente = pendientes.has(clave);
      const deAqui = new Map(pendiente ? local.filter((e) => e?.id).map((e) => [e.id, e]) : []);
      copiaCompartida.set(clave, new Map(nube.map((e) => [e.id, JSON.stringify(e)])));
      if (nube.length || soloAqui.length) poner(clave, [...soloAqui, ...nube.map((e) => deAqui.get(e.id) ?? e)]);
      if (soloAqui.length || pendiente) pendientes.add(clave);
    }

    // 3. Proyectos del cliente: se añaden a los datos de la app si no están en este navegador.
    if (proyectos.data?.length) {
      // En un dispositivo nuevo se parte de los datos iniciales de la app
      const datos = (leerJson<Record<string, Elemento[]> | null>(CLAVE_DATOS, null) ??
        ((await import("./store")).leerLocal() as unknown as Record<string, Elemento[]>));
      {
        for (const p of proyectos.data) {
          const d = p.datos as { cliente: Elemento; proyectos: Elemento[]; presupuestos: Elemento[]; obras: Elemento[] };
          const unir = (col: string, items: Elemento[]) => {
            const lista = (datos[col] ??= []);
            for (const x of items) {
              const i = lista.findIndex((y) => y.id === x.id);
              if (i === -1) lista.unshift(x);
            }
          };
          unir("clientes", [d.cliente]);
          unir("proyectos", d.proyectos ?? []);
          unir("presupuestos", d.presupuestos ?? []);
          unir("obras", d.obras ?? []);
          copiaProyectos.set(p.id, JSON.stringify(d));
        }
        poner(CLAVE_DATOS, datos);
        const tokens = proyectos.data.map((p) => String((p.datos as { cliente: Elemento }).cliente?.token ?? "")).filter(Boolean);
        poner(CLAVE_MIS_PROYECTOS, [...new Set([...leerJson<string[]>(CLAVE_MIS_PROYECTOS, []), ...tokens])]);
      }
    }
    pendientes.add(CLAVE_DATOS);
    await subirConsentimiento();
    await subirPendientes();
    ponerEstado("al_dia");
  } catch {
    ponerEstado("error");
    return;
  }
  if (cambiado) {
    try {
      // Una sola recarga por sesión, para que la app lea lo que ha llegado
      if (sessionStorage.getItem("nube:recargado") !== sesionActual?.user.id) {
        sessionStorage.setItem("nube:recargado", sesionActual?.user.id ?? "");
        window.location.reload();
      }
    } catch {
      /* sin almacenamiento */
    }
  }
}

/** Trae de nuevo los encargos (al volver a la pestaña), para ver lo que ha hecho la otra parte. */
async function refrescarEncargos() {
  if (!sesionActual) return;
  const { data, error } = await supabaseNavegador().from("encargos").select("tipo,datos").order("creado", { ascending: false });
  if (error || !data) return;
  for (const [clave, cfg] of Object.entries(COMPARTIDAS) as [ClaveCompartida, (typeof COMPARTIDAS)[ClaveCompartida]][]) {
    const nube = data.filter((f) => f.tipo === cfg.tipo).map((f) => f.datos as Elemento);
    const ids = new Set(nube.map((e) => e.id));
    const soloAqui = leerJson<Elemento[]>(clave, []).filter((e) => e?.id && !ids.has(e.id));
    const nuevo = JSON.stringify([...soloAqui, ...nube]);
    copiaCompartida.set(clave, new Map(nube.map((e) => [e.id, JSON.stringify(e)])));
    if (localStorage.getItem(clave) !== nuevo) {
      localStorage.setItem(clave, nuevo);
      window.dispatchEvent(new Event("encargos"));
    }
  }
}

/** Componente sin interfaz que se monta una vez en la app: activa la sesión y la sincronización. */
export function SincronizarNube() {
  useEffect(() => {
    if (!conNube) return;
    iniciar();
    const alVolver = () => (document.visibilityState === "visible" ? void refrescarEncargos() : void subirPendientes());
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, []);
  return null;
}

// ---------------------------------------------------------------- RGPD

/** Descarga en JSON todos los datos de la persona que hay en la nube. */
export async function descargarMisDatos() {
  const { data, error } = await supabaseNavegador().rpc("mis_datos");
  if (error) throw error;
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "mis-datos-reformamejor.json" });
  a.click();
  URL.revokeObjectURL(url);
}

/** Borra la cuenta y todos sus datos de la nube (y de este navegador). Devuelve un error o null. */
export async function borrarMiCuenta(): Promise<string | null> {
  const s = supabaseNavegador();
  const { error } = await s.rpc("borrar_mi_cuenta");
  if (error) return error.message.includes("contratos") ? error.message : "No se ha podido borrar la cuenta. Inténtalo de nuevo.";
  await s.auth.signOut();
  try {
    for (const c of [...CLAVES_PERSONALES, ...Object.keys(COMPARTIDAS), CLAVE_CONSENTIMIENTO, "app-reformas:miembro"]) localStorage.removeItem(c);
  } catch {
    /* sin almacenamiento */
  }
  return null;
}
