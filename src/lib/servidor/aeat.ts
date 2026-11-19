import "server-only";

export const URL_COTEJO_AEAT = "https://www2.agenciatributaria.gob.es/wlpl/KATA-APLI/cotejo/CotejoSv";

export interface ResultadoCotejo {
  /** autentico: la AEAT tiene un documento con ese CSV · no_encontrado · error: no se pudo consultar */
  resultado: "autentico" | "no_encontrado" | "error";
  /** Copia oficial descargada de la AEAT, si la devuelve */
  pdf?: Uint8Array;
}

/**
 * Cotejo público y gratuito de la Agencia Tributaria: comprueba que existe un documento
 * con ese código seguro de verificación (CSV). No necesita certificado digital.
 */
export async function cotejarCSV(csv: string): Promise<ResultadoCotejo> {
  try {
    const r = await fetch(URL_COTEJO_AEAT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ COMPLETA: "NO", ORIGEN: "D", CSV: csv }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!r.ok) return { resultado: "error" };
    const bytes = new Uint8Array(await r.arrayBuffer());
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return { resultado: "autentico", pdf: bytes };
    const html = new TextDecoder("iso-8859-15").decode(bytes);
    if (/No se ha encontrado ning[uú]n documento/i.test(html)) return { resultado: "no_encontrado" };
    // Página del documento encontrado (sin PDF directo)
    if (/cotejo/i.test(html) && new RegExp(csv, "i").test(html)) return { resultado: "autentico" };
    return { resultado: "error" };
  } catch {
    return { resultado: "error" };
  }
}
