/**
 * Fotos de trabajos que sube cada reformista para su currículum (las ve el cliente al elegir).
 * Nunca fotos donde se reconozca la dirección: ni fachadas, ni portales, ni números, ni vistas desde la ventana.
 * En la demo se guardan en el navegador, reducidas a 1.200 px.
 */
const CLAVE = "app-reformas:fotos-trabajos";
export const MAX_FOTOS = 12;

export interface FotoTrabajo { src: string; texto: string }

function leerTodas(): Record<string, FotoTrabajo[]> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export const fotosSubidas = (reformistaId: string): FotoTrabajo[] => leerTodas()[reformistaId] ?? [];

export function guardarFotos(reformistaId: string, fotos: FotoTrabajo[]): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ...leerTodas(), [reformistaId]: fotos.slice(0, MAX_FOTOS) }));
    window.dispatchEvent(new Event("encargos"));
    return true;
  } catch {
    return false;
  }
}

/** Reduce la foto a 1.200 px de lado mayor y la pasa a WebP/JPEG para no llenar el almacenamiento. */
export function reducirFoto(file: File, lado = 1200): Promise<string> {
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, lado / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      ok(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => mal(new Error("No se pudo leer la imagen"));
    img.src = url;
  });
}
