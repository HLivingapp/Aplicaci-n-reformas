"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { nuevoToken } from "./id";
import { conBaseDeDatos } from "./modo";
import { reformaVacia } from "./proyecto";
import { datosIniciales } from "./semilla";
import { datosDesdeFilas, diferencias, type Fila, type FilaAjuste } from "./sincronizar";
import { supabaseNavegador } from "./supabase/navegador";
import { completarTarifas } from "./tarifas";
import type { Datos, Proyecto } from "./types";

const CLAVE = "app-reformas:datos";

/** Adapta datos guardados por versiones anteriores de la app. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrar(d: any): Datos {
  if (!d || typeof d !== "object" || !Array.isArray(d.clientes)) return datosIniciales();
  const proyectos = (d.proyectos ?? []).map((p: Proyecto) => ({
    ...p,
    reforma: { ...reformaVacia(p.vivienda?.dormitorios, p.vivienda?.banos), ...p.reforma },
  }));
  const clientes = d.clientes.map((c: { token?: string }) => ({ ...c, token: c.token || nuevoToken() }));
  return { ...d, version: 3, fotos: d.fotos ?? [], proveedores: d.proveedores ?? [], clientes, proyectos, tarifas: completarTarifas(d.tarifas ?? {}) };
}

/** Añade a una demo ya guardada los ejemplos que se han creado después (sin tocar lo que hizo el usuario). */
function conEjemplosNuevos(d: Datos): Datos {
  const base = datosIniciales();
  for (const c of base.clientes) if (!d.clientes.some((x) => x.id === c.id)) d.clientes.push(c);
  const p = base.presupuestos.find((x) => x.id === "p-demo-detalle");
  if (p && !d.presupuestos.some((x) => x.id === p.id)) d.presupuestos.unshift(p);
  return d;
}

/** Modo demostración: los datos viven en el navegador. */
export function leerLocal(): Datos {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) return conEjemplosNuevos(migrar(JSON.parse(raw)));
  } catch {
    /* sin almacenamiento */
  }
  return datosIniciales();
}

export function escribirLocal(d: Datos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(d));
  } catch {
    /* sin almacenamiento */
  }
}

type Estado = "cargando" | "listo" | "sin_sesion" | "no_autorizado" | "error";

interface Store {
  datos: Datos;
  actualizar: (fn: (d: Datos) => void) => void;
  reiniciar: () => void;
  guardando: boolean;
  errorGuardado: string | null;
  email: string | null;
  salir: () => void;
}

const Ctx = createContext<Store | null>(null);

export function DatosProvider({ children }: { children: React.ReactNode }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [email, setEmail] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const sincronizado = useRef<Datos | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carga inicial
  useEffect(() => {
    if (!conBaseDeDatos) {
      setDatos(leerLocal());
      setEstado("listo");
      return;
    }
    const s = supabaseNavegador();
    (async () => {
      const { data: sesion } = await s.auth.getSession();
      if (!sesion.session) return setEstado("sin_sesion");
      setEmail(sesion.session.user.email ?? null);
      const eq = await s.from("equipo").select("email").limit(1);
      if (eq.error || !eq.data?.length) return setEstado("no_autorizado");
      const [r, a] = await Promise.all([
        s.from("registros").select("coleccion,id,cliente_id,datos").order("creado", { ascending: false }),
        s.from("ajustes").select("clave,datos"),
      ]);
      if (r.error || a.error) return setEstado("error");
      const d = datosDesdeFilas(r.data as Fila[], a.data as FilaAjuste[]);
      sincronizado.current = d;
      setDatos(d);
      setEstado("listo");
    })();
  }, []);

  // Guardado
  useEffect(() => {
    if (!datos || estado !== "listo") return;
    if (!conBaseDeDatos) {
      escribirLocal(datos);
      return;
    }
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(async () => {
      const dif = diferencias(sincronizado.current, datos);
      if (dif.vacio) return;
      setGuardando(true);
      const s = supabaseNavegador();
      try {
        if (dif.upserts.length) {
          const { error } = await s.from("registros").upsert(dif.upserts.map((f) => ({ ...f, actualizado: new Date().toISOString() })));
          if (error) throw error;
        }
        for (const b of dif.borrados) {
          const { error } = await s.from("registros").delete().eq("coleccion", b.coleccion).eq("id", b.id);
          if (error) throw error;
        }
        if (dif.ajustes.length) {
          const { error } = await s.from("ajustes").upsert(dif.ajustes);
          if (error) throw error;
        }
        sincronizado.current = datos;
        setErrorGuardado(null);
      } catch {
        setErrorGuardado("No se han podido guardar los últimos cambios. Revisa la conexión; se reintentará con el próximo cambio.");
      } finally {
        setGuardando(false);
      }
    }, 600);
  }, [datos, estado]);

  // Modo demo: sincroniza entre pestañas
  useEffect(() => {
    if (conBaseDeDatos) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === CLAVE && e.newValue) setDatos(migrar(JSON.parse(e.newValue)));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const actualizar = useCallback((fn: (d: Datos) => void) => {
    setDatos((prev) => {
      if (!prev) return prev;
      const copia = structuredClone(prev);
      fn(copia);
      return copia;
    });
  }, []);

  const reiniciar = useCallback(() => {
    if (!conBaseDeDatos) setDatos(datosIniciales());
  }, []);

  const salir = useCallback(async () => {
    if (conBaseDeDatos) await supabaseNavegador().auth.signOut();
    window.location.href = "/";
  }, []);

  if (estado === "sin_sesion") {
    if (typeof window !== "undefined") window.location.replace("/entrar");
    return <Mensaje>Redirigiendo…</Mensaje>;
  }
  if (estado === "no_autorizado") {
    return (
      <Mensaje>
        El email {email} no está dado de alta en el equipo.{" "}
        <button className="text-teal-700 underline" onClick={salir}>Salir</button>
      </Mensaje>
    );
  }
  if (estado === "error") return <Mensaje>No se han podido cargar los datos. Vuelve a intentarlo en unos minutos.</Mensaje>;
  if (!datos) return <Mensaje>Cargando…</Mensaje>;

  return <Ctx.Provider value={{ datos, actualizar, reiniciar, guardando, errorGuardado, email, salir }}>{children}</Ctx.Provider>;
}

function Mensaje({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh items-center justify-center p-6 text-center text-stone-500">{children}</div>;
}

export function useDatos() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDatos fuera de DatosProvider");
  return c;
}
