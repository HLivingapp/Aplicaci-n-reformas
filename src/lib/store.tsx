"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { datosIniciales } from "./semilla";
import { reformaVacia } from "./proyecto";
import { completarTarifas } from "./tarifas";
import type { Datos, Proyecto } from "./types";

const CLAVE = "app-reformas:datos";

interface Store {
  datos: Datos;
  actualizar: (fn: (d: Datos) => void) => void;
  reiniciar: () => void;
}

/** Adapta datos guardados por versiones anteriores de la app. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrar(d: any): Datos {
  if (!d || typeof d !== "object" || !Array.isArray(d.clientes)) return datosIniciales();
  const proyectos = (d.proyectos ?? []).map((p: Proyecto) => ({
    ...p,
    reforma: { ...reformaVacia(p.vivienda?.dormitorios, p.vivienda?.banos), ...p.reforma },
  }));
  return { ...d, version: 3, proyectos, tarifas: completarTarifas(d.tarifas ?? {}) };
}

const Ctx = createContext<Store | null>(null);

export function DatosProvider({ children }: { children: React.ReactNode }) {
  const [datos, setDatos] = useState<Datos | null>(null);

  useEffect(() => {
    let d: Datos | null = null;
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) d = migrar(JSON.parse(raw));
    } catch {
      d = null;
    }
    setDatos(d ?? datosIniciales());
  }, []);

  useEffect(() => {
    if (!datos) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [datos]);

  // Sincroniza entre pestañas (por ejemplo, vista empresa y vista cliente abiertas a la vez)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CLAVE && e.newValue) setDatos(JSON.parse(e.newValue));
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

  const reiniciar = useCallback(() => setDatos(datosIniciales()), []);

  if (!datos) {
    return <div className="flex min-h-dvh items-center justify-center text-stone-500">Cargando…</div>;
  }
  return <Ctx.Provider value={{ datos, actualizar, reiniciar }}>{children}</Ctx.Provider>;
}

export function useDatos() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDatos fuera de DatosProvider");
  return c;
}
