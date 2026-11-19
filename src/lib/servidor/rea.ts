import "server-only";
import { parsearREA, tipoIdentificadorREA, URL_CONSULTA_REA, type ResultadoREA } from "../rea";

/** Consulta si una empresa consta en el REA. Nunca lanza: si falla devuelve resultado "error". */
export async function consultarREA(nif: string): Promise<ResultadoREA> {
  const fecha = new Date().toISOString();
  try {
    const r = await fetch(URL_CONSULTA_REA, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ tipoIdentificacion: tipoIdentificadorREA(nif), numIdentificacion: nif, submitButton_mostrar: "Mostrar" }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!r.ok) return { resultado: "error", fecha };
    // La página está en ISO-8859-1
    const html = new TextDecoder("latin1").decode(await r.arrayBuffer());
    return parsearREA(html, fecha);
  } catch {
    return { resultado: "error", fecha };
  }
}
