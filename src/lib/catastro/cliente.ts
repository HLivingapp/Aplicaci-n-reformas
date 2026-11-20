import { consultarCatastro, type PeticionCatastro } from "./consultar";
import type { ResultadoBusqueda } from "./tipos";

/**
 * Consulta al Catastro desde el navegador. Con servidor pasa por /api/catastro; en la demo
 * estática (GitHub Pages) llama directamente al Catastro, que admite peticiones del navegador.
 */
export async function buscarCatastro(body: PeticionCatastro): Promise<ResultadoBusqueda> {
  if (process.env.NEXT_PUBLIC_ESTATICA === "1") return (await consultarCatastro(body)).res;
  const r = await fetch("/api/catastro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return (await r.json()) as ResultadoBusqueda;
}
