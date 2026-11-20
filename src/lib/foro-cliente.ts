"use client";

import { useCallback, useEffect, useState } from "react";
import { anotarMio, anotarUtil, aplicarAccion, esLegal, guardarForo, huella, leerForo, misMensajes, misUtiles, type Accion, type Autor, type RespuestaIA, type Tema } from "./foro";
import { conBaseDeDatos } from "./modo";

/**
 * Capa de datos del foro en el navegador. Con servidor, todo pasa por /api/foro (los mensajes de todos);
 * en la demo estática se guarda en este navegador. Cada navegador tiene una clave secreta propia que
 * permite borrar lo suyo y marcar la solución; el servidor solo guarda su huella.
 */
const CLAVE_SECRETA = "app-reformas:foro-clave";
const CLAVE_PRO = "app-reformas:foro-pro";

function claveSecreta() {
  try {
    let c = localStorage.getItem(CLAVE_SECRETA);
    if (!c || !/^[a-f0-9]{64}$/.test(c)) {
      c = Array.from(crypto.getRandomValues(new Uint8Array(32)), (x) => x.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(CLAVE_SECRETA, c);
    }
    return c;
  } catch {
    return "";
  }
}

/** Enlace privado del reformista, guardado al entrar en la comunidad desde su portal. */
export const tokenProfesional = () => {
  try {
    return localStorage.getItem(CLAVE_PRO) ?? "";
  } catch {
    return "";
  }
};
export const recordarProfesional = (token: string) => {
  try {
    localStorage.setItem(CLAVE_PRO, token);
  } catch {
    /* sin almacenamiento */
  }
};
export const olvidarProfesional = () => {
  try {
    localStorage.removeItem(CLAVE_PRO);
  } catch {
    /* sin almacenamiento */
  }
};

const conServidor = conBaseDeDatos && process.env.NEXT_PUBLIC_ESTATICA !== "1";

export function useForo() {
  const [temas, setTemas] = useState<Tema[] | null>(null);
  const [ia, setIa] = useState(!conServidor);
  const [mios, setMios] = useState<Set<string>>(new Set());
  const [utiles, setUtiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMios(misMensajes());
    setUtiles(misUtiles());
    if (!conServidor) {
      setTemas(leerForo());
      return;
    }
    fetch("/api/foro", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setTemas(j.temas ?? []);
        setIa(Boolean(j.ia));
      })
      .catch(() => {
        setTemas([]);
        setError("No se ha podido cargar la comunidad. Prueba de nuevo en un momento.");
      });
  }, []);

  /** Envía una acción. `comoPro` solo vale en la demo; en la app real el reformista entra con su enlace. */
  const enviar = useCallback(
    async (a: Accion, opciones: { comoPro?: boolean } = {}) => {
      setError(null);
      const clave = claveSecreta();
      try {
        if (a.tipo === "responder" && !a.tokenProfesional && tokenProfesional()) a = { ...a, tokenProfesional: tokenProfesional() };
        let nuevos: Tema[];
        if (conServidor) {
          const r = await fetch("/api/foro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: a, clave }) });
          const j = await r.json();
          if (!r.ok) throw new Error(j.error ?? "No se ha podido guardar");
          nuevos = j.temas;
        } else {
          const actuales = leerForo();
          if (a.tipo === "ia") {
            const temaId = a.temaId;
            await new Promise((res) => setTimeout(res, 900));
            nuevos = actuales.map((t) => (t.id === temaId && !t.respuestaIA ? { ...t, respuestaIA: respuestaDemo(t) } : t));
          } else {
            const pro: Autor | undefined = a.tipo === "responder" && (opciones.comoPro || a.tokenProfesional) ? { alias: "Reformista homologado · Madrid", tipo: "profesional", homologado: true } : undefined;
            nuevos = aplicarAccion(actuales, a, await huella(clave), pro);
          }
          guardarForo(nuevos);
        }
        if (a.tipo === "crear" || a.tipo === "responder") {
          anotarMio(a.id);
          setMios(misMensajes());
        }
        if (a.tipo === "util") {
          anotarUtil(a.mensajeId);
          setUtiles(misUtiles());
        }
        setTemas(nuevos);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se ha podido guardar");
        return false;
      }
    },
    [],
  );

  return { temas, ia, mios, utiles, error, enviar, esProfesional: Boolean(tokenProfesional()) };
}

/** Respuestas de ejemplo del asistente en la demo (sin conexión a la IA). */
function respuestaDemo(t: Tema): RespuestaIA {
  const creado = new Date().toISOString();
  const aviso = "\n\nEs una orientación general: un profesional homologado o el Ayuntamiento deben confirmarlo en tu caso.";
  if (esLegal(t)) {
    return {
      creado,
      texto:
        "En la ciudad de Madrid la mayoría de las reformas interiores de vivienda se tramitan con declaración responsable: presentas la documentación y puedes empezar, sin esperar a una licencia. Hace falta licencia cuando la obra afecta a la estructura, cambia el aspecto exterior en edificios protegidos o supone un cambio de uso. Si la obra es menor (cambiar suelos, alicatados o la cocina sin tocar estructura ni fachada), basta con la declaración responsable y pagar el ICIO y la tasa.\n\nSi tocas la fachada o elementos comunes (ventanas con otro aspecto, cerramiento de terraza, unidad exterior del aire), necesitas además el acuerdo de la comunidad de propietarios, según la Ley de Propiedad Horizontal." +
        aviso,
      fuentes: [
        { titulo: "Ordenanza de Licencias y Declaraciones Responsables Urbanísticas (Madrid, 2022)", url: "https://sede.madrid.es" },
        { titulo: "Ley 49/1960 de Propiedad Horizontal (BOE)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906" },
      ],
    };
  }
  return {
    creado,
    texto:
      "Por lo que cuentas, lo primero es localizar la causa antes de reparar: en obra reciente suele ser un remate (sellado, juntas, pendientes) y entra en la garantía del reformista. Haz fotos con fecha, revisa el contrato y pide por escrito que lo revisen. Para instalaciones como la aerotermia o la calefacción, pide siempre el cálculo de cargas de tu vivienda, porque la potencia depende de los m², el aislamiento y la orientación.\n\nEl Código Técnico de la Edificación (documentos de salubridad y ahorro de energía) marca los mínimos de ventilación, humedades y aislamiento que debe cumplir la obra." +
      aviso,
    fuentes: [{ titulo: "Código Técnico de la Edificación", url: "https://www.codigotecnico.org" }],
  };
}
