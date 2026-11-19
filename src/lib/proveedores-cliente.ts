"use client";

import { nuevoId } from "./id";
import { conBaseDeDatos } from "./modo";
import { anadirDocumento, registrarProveedor, vistaProveedor, type AltaProveedor, type VistaProveedor } from "./proveedores";
import { escribirLocal, leerLocal } from "./store";
import type { TipoDocProveedor } from "./types";

async function respuesta<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.mensaje ?? "Error de conexión");
  return r.json();
}

export async function enviarAlta(alta: AltaProveedor, acepto: boolean): Promise<string> {
  if (!conBaseDeDatos) {
    const d = leerLocal();
    const token = registrarProveedor(d, alta);
    escribirLocal(d);
    return token;
  }
  const r = await fetch("/api/proveedores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alta, acepto }) });
  return (await respuesta<{ token: string }>(r)).token;
}

export async function cargarProveedor(token: string): Promise<VistaProveedor | null> {
  if (!conBaseDeDatos) return vistaProveedor(leerLocal(), token);
  const r = await fetch(`/api/proveedor/${encodeURIComponent(token)}`, { cache: "no-store" });
  return r.ok ? r.json() : null;
}

export async function subirDocumento(token: string, tipo: TipoDocProveedor, archivo: File, caduca: string): Promise<void> {
  if (archivo.size > 10 * 1024 * 1024) throw new Error("El archivo supera 10 MB");
  if (!conBaseDeDatos) {
    // Demostración: no se guarda el archivo, solo que se ha aportado
    const d = leerLocal();
    anadirDocumento(d, token, { id: nuevoId(), tipo, ruta: `demo:${archivo.name}`, nombre: archivo.name, caduca: caduca || undefined });
    escribirLocal(d);
    return;
  }
  const f = new FormData();
  f.set("archivo", archivo);
  f.set("tipo", tipo);
  f.set("caduca", caduca);
  await respuesta(await fetch(`/api/proveedor/${encodeURIComponent(token)}/documentos`, { method: "POST", body: f }));
}
