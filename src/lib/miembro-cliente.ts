"use client";

import { useEffect, useState } from "react";
import { miembroLimpio, type Miembro } from "./miembro";
import { conBaseDeDatos } from "./modo";

const CLAVE = "app-reformas:miembro";
/** Lista de miembros de la demo (solo en este navegador), para verla en el panel de la empresa. */
export const CLAVE_DEMO = "app-reformas:miembros-demo";
const conServidor = conBaseDeDatos && process.env.NEXT_PUBLIC_ESTATICA !== "1";

export function leerMiembro(): Pick<Miembro, "email" | "creado"> | null {
  try {
    const m = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    return m && typeof m.email === "string" ? m : null;
  } catch {
    return null;
  }
}

export function useMiembro() {
  const [m, setM] = useState<Pick<Miembro, "email" | "creado"> | null | undefined>(undefined);
  useEffect(() => {
    const leer = () => setM(leerMiembro());
    leer();
    window.addEventListener("miembro", leer);
    window.addEventListener("storage", leer);
    return () => {
      window.removeEventListener("miembro", leer);
      window.removeEventListener("storage", leer);
    };
  }, []);
  return m;
}

/** Une a la persona a la comunidad. Devuelve un mensaje de error o null si ha ido bien. */
export async function unirse(datos: { email: string; telefono: string; aceptaPrivacidad: boolean; aceptaContacto: boolean }): Promise<string | null> {
  const m = miembroLimpio(datos);
  if (!m) return "Revisa el email y el teléfono, y acepta la política de privacidad.";
  if (conServidor) {
    const r = await fetch("/api/registro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) }).catch(() => null);
    if (!r?.ok) return (await r?.json().catch(() => null))?.error ?? "No se ha podido completar el registro. Prueba de nuevo.";
  } else {
    try {
      const lista: Miembro[] = JSON.parse(localStorage.getItem(CLAVE_DEMO) ?? "[]");
      localStorage.setItem(CLAVE_DEMO, JSON.stringify([m, ...lista.filter((x) => x.email !== m.email)]));
    } catch {
      /* sin almacenamiento */
    }
  }
  try {
    // En este dispositivo solo se recuerda el email, para no volver a pedirlo
    localStorage.setItem(CLAVE, JSON.stringify({ email: m.email, creado: m.creado }));
  } catch {
    /* sin almacenamiento */
  }
  window.dispatchEvent(new Event("miembro"));
  return null;
}

export function salir() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento */
  }
  window.dispatchEvent(new Event("miembro"));
}
