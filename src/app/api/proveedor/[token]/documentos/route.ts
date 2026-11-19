import { NextResponse } from "next/server";
import { nuevoId } from "@/lib/id";
import { anadirDocumento, DOCUMENTOS } from "@/lib/proveedores";
import { cargarTodo, db, guardarCambios } from "@/lib/servidor/repo";
import type { TipoDocProveedor } from "@/lib/types";

const MAX = 10 * 1024 * 1024;

/** Reconoce el formato por sus primeros bytes, no por lo que diga el navegador. */
function formato(b: Uint8Array): { ext: string; mime: string } | null {
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return { ext: "pdf", mime: "application/pdf" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: "png", mime: "image/png" };
  return null;
}

/** El proveedor sube un documento con su enlace privado. Se guarda en el almacén privado (UE). */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token)) return NextResponse.json({ mensaje: "Enlace no válido" }, { status: 404 });
  const form = await req.formData().catch(() => null);
  const archivo = form?.get("archivo");
  const tipo = String(form?.get("tipo") ?? "") as TipoDocProveedor;
  const caduca = String(form?.get("caduca") ?? "");
  if (!(archivo instanceof File) || !(tipo in DOCUMENTOS)) return NextResponse.json({ mensaje: "Falta el archivo o el tipo de documento" }, { status: 400 });
  if (archivo.size > MAX) return NextResponse.json({ mensaje: "El archivo supera 10 MB" }, { status: 400 });
  if (caduca && !/^\d{4}-\d{2}-\d{2}$/.test(caduca)) return NextResponse.json({ mensaje: "Fecha de caducidad no válida" }, { status: 400 });
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const f = formato(bytes);
  if (!f) return NextResponse.json({ mensaje: "Solo se admiten PDF, JPG o PNG" }, { status: 400 });

  const antes = await cargarTodo();
  const p = antes.proveedores.find((x) => x.token === token);
  if (!p) return NextResponse.json({ mensaje: "Enlace no válido" }, { status: 404 });
  const id = nuevoId();
  const ruta = `${p.id}/${id}.${f.ext}`;
  const { error } = await db().storage.from("proveedores").upload(ruta, bytes, { contentType: f.mime });
  if (error) return NextResponse.json({ mensaje: "No se pudo guardar el archivo" }, { status: 500 });
  const despues = structuredClone(antes);
  anadirDocumento(despues, token, { id, tipo, ruta, nombre: archivo.name.slice(0, 120), caduca: caduca || undefined });
  await guardarCambios(antes, despues);
  return NextResponse.json({ ok: true });
}
