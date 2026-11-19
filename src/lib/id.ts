export const nuevoId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/** Token secreto para el enlace privado del cliente (128 bits, imposible de adivinar). */
export function nuevoToken() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
