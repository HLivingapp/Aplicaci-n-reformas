"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BASE } from "./base";


/**
 * Como useParams, pero en la versión estática (GitHub Pages) las páginas con parámetros
 * se generan con «_» y el valor real llega en el #: /p/_/#/p/<token>.
 */
export function useParamsReales<T extends Record<string, string>>(): T {
  const p = useParams() as T;
  const clave = JSON.stringify(p);
  const [reales, setReales] = useState<T>(p);
  useEffect(() => {
    const p = JSON.parse(clave) as T;
    const huecos = Object.entries(p).filter(([, v]) => v === "_");
    if (!huecos.length) return setReales(p);
    const destino = decodeURIComponent(window.location.hash.slice(1)).split("/").filter(Boolean);
    const plantilla = window.location.pathname.slice(BASE.length).split("/").filter(Boolean);
    const valores = plantilla.flatMap((s, i) => (s === "_" && destino[i] ? [destino[i]] : []));
    const res = { ...p };
    huecos.forEach(([k], i) => {
      if (valores[i]) (res as Record<string, string>)[k] = valores[i];
    });
    setReales(res);
  }, [clave]);
  return reales;
}
