import { NextResponse } from "next/server";
import { nuevoId } from "@/lib/id";
import { createHash } from "node:crypto";
import { anadirDocumento, CON_CSV, DOCUMENTOS, errorDocumento } from "@/lib/proveedores";
import { cotejarCSV } from "@/lib/servidor/aeat";
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
  const csv = String(form?.get("csv") ?? "").toUpperCase().replace(/[\s-]/g, "") || undefined;
  if (!(archivo instanceof File) || !(tipo in DOCUMENTOS)) return NextResponse.json({ mensaje: "Falta el archivo o el tipo de documento" }, { status: 400 });
  if (archivo.size > MAX) return NextResponse.json({ mensaje: "El archivo supera 10 MB" }, { status: 400 });
  if (caduca && !/^\d{4}-\d{2}-\d{2}$/.test(caduca)) return NextResponse.json({ mensaje: "Fecha de caducidad no válida" }, { status: 400 });
  const malFecha = errorDocumento(tipo, caduca || undefined, undefined, csv);
  if (malFecha) return NextResponse.json({ mensaje: malFecha }, { status: 400 });
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const f = formato(bytes);
  if (!f) return NextResponse.json({ mensaje: "Solo se admiten PDF, JPG o PNG" }, { status: 400 });

  const antes = await cargarTodo();
  const p = antes.proveedores.find((x) => x.token === token);
  if (!p || p.estado === "rechazado") return NextResponse.json({ mensaje: "Enlace no válido" }, { status: 404 });
  const id = nuevoId();

  // Certificados de la AEAT: se comprueba el CSV en el cotejo público de la Agencia Tributaria
  let verificacion: { resultado: "autentico" | "no_encontrado" | "error"; fecha: string; copiaOficial?: string } | undefined;
  if (csv && CON_CSV.includes(tipo)) {
    const c = await cotejarCSV(csv);
    if (c.resultado === "no_encontrado")
      return NextResponse.json({ mensaje: "La Agencia Tributaria no tiene ningún documento con ese CSV. Revisa el código o descarga un certificado nuevo." }, { status: 400 });
    verificacion = { resultado: c.resultado, fecha: new Date().toISOString() };
    if (c.pdf) {
      const rutaOficial = `${p.id}/${id}-aeat.pdf`;
      const { error } = await db().storage.from("proveedores").upload(rutaOficial, c.pdf, { contentType: "application/pdf" });
      if (!error) verificacion.copiaOficial = rutaOficial;
    }
  }

  const ruta = `${p.id}/${id}.${f.ext}`;
  const { error } = await db().storage.from("proveedores").upload(ruta, bytes, { contentType: f.mime });
  if (error) return NextResponse.json({ mensaje: "No se pudo guardar el archivo" }, { status: 500 });
  const despues = structuredClone(antes);
  const huella = createHash("sha256").update(bytes).digest("hex");
  anadirDocumento(despues, token, { id, tipo, ruta, nombre: archivo.name.slice(0, 120), caduca: caduca || undefined, huella, csv, verificacion });
  await guardarCambios(antes, despues);
  return NextResponse.json({ ok: true });
}
