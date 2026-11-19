"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Boton, inputCls, Tarjeta, Vacio } from "@/components/ui";
import { hoy } from "@/lib/calc";
import { docActual, DOCUMENTOS, documentosExigidos, requisitos, situacionDoc, sumarMeses, type SituacionDoc, type VistaProveedor } from "@/lib/proveedores";
import { cargarProveedor, subirDocumento } from "@/lib/proveedores-cliente";
import type { TipoDocProveedor } from "@/lib/types";

const ESTADOS: Record<VistaProveedor["estado"], { texto: string; cls: string }> = {
  pendiente: { texto: "En revisión", cls: "bg-amber-100 text-amber-900" },
  aprobado: { texto: "Homologado", cls: "bg-emerald-100 text-emerald-800" },
  rechazado: { texto: "No homologado", cls: "bg-red-100 text-red-700" },
  suspendido: { texto: "Suspendido", cls: "bg-stone-200 text-stone-700" },
};
const SITUACION: Record<SituacionDoc | "falta", { texto: string; cls: string }> = {
  falta: { texto: "Falta", cls: "text-stone-500" },
  pendiente: { texto: "Pendiente de revisar", cls: "text-amber-700" },
  rechazado: { texto: "Rechazado", cls: "text-red-700" },
  caducado: { texto: "Caducado", cls: "text-red-700" },
  caduca_pronto: { texto: "Caduca pronto", cls: "text-amber-700" },
  valido: { texto: "Válido", cls: "text-emerald-700" },
};

function SubirDoc({ token, tipo, alSubir }: { token: string; tipo: TipoDocProveedor; alSubir: () => void }) {
  const info = DOCUMENTOS[tipo];
  const [archivo, setArchivo] = useState<File | null>(null);
  const [caduca, setCaduca] = useState("");
  const [estado, setEstado] = useState<string | null>(null);
  async function subir() {
    if (!archivo) return;
    setEstado("Subiendo…");
    try {
      await subirDocumento(token, tipo, archivo, caduca);
      setArchivo(null);
      setCaduca("");
      setEstado(null);
      alSubir();
    } catch (e) {
      setEstado(e instanceof Error ? e.message : "No se pudo subir");
    }
  }
  return (
    <div className="mt-2 space-y-2">
      <input type="file" accept="application/pdf,image/jpeg,image/png" className="block w-full text-sm" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
      {archivo && (
        <div className="flex flex-wrap items-end gap-2">
          {info.caduca && (
            <label className="text-xs text-stone-600">
              Válido hasta
              <input type="date" className={`${inputCls} mt-1`} value={caduca} min={hoy()} onChange={(e) => setCaduca(e.target.value)} />
            </label>
          )}
          <Boton onClick={subir} disabled={estado === "Subiendo…"}>Subir</Boton>
          {info.caduca && !caduca && info.mesesPorDefecto && (
            <span className="text-xs text-stone-500">Si no indicas fecha, revisaremos la del documento (suele ser hasta {sumarMeses(hoy(), info.mesesPorDefecto)}).</span>
          )}
        </div>
      )}
      {estado && <p className="text-sm text-stone-600">{estado}</p>}
    </div>
  );
}

export default function PortalReformista() {
  const { token } = useParams<{ token: string }>();
  const [p, setP] = useState<VistaProveedor | null | undefined>(undefined);
  const [nuevo, setNuevo] = useState(false);
  const cargar = useCallback(() => cargarProveedor(token).then(setP), [token]);
  useEffect(() => {
    cargar();
    setNuevo(new URLSearchParams(window.location.search).has("nuevo"));
  }, [cargar]);

  if (p === undefined) return <main className="flex min-h-dvh items-center justify-center text-stone-500">Cargando…</main>;
  if (p === null) return <main className="p-6"><Vacio>Este enlace no es válido. Escríbenos y te enviamos uno nuevo.</Vacio></main>;

  const reqs = requisitos(p);
  const pendientes = reqs.filter((r) => !r.ok).length;
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pb-16 pt-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-stone-500">Homologación de reformistas</div>
          <h1 className="text-xl font-semibold">{p.razonSocial}</h1>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADOS[p.estado].cls}`}>{ESTADOS[p.estado].texto}</span>
      </div>

      {nuevo && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="font-semibold">Cuestionario recibido.</div>
          Guarda este enlace: es privado y te sirve para subir tus documentos y ver cómo va la revisión. Puedes volver cuando quieras.
        </div>
      )}

      <Tarjeta>
        <h2 className="mb-2 font-semibold">{pendientes ? `Te faltan ${pendientes} requisitos` : p.estado === "aprobado" ? "Todo en regla" : "Todo enviado: lo estamos revisando"}</h2>
        <ul className="space-y-1 text-sm">
          {reqs.map((r) => (
            <li key={r.clave} className="flex gap-2">
              <span>{r.ok ? "✅" : "⬜"}</span>
              <span className={r.ok ? "text-stone-600" : ""}>{r.texto}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-stone-500">Un documento cuenta cuando nuestro equipo lo ha revisado. Te avisaremos antes de que caduque alguno.</p>
      </Tarjeta>

      <Tarjeta className="space-y-4">
        <h2 className="font-semibold">Documentos</h2>
        {documentosExigidos(p).map((t) => {
          const d = docActual(p, t);
          const s = d ? situacionDoc(d) : "falta";
          return (
            <div key={t} className="border-t border-stone-100 pt-3 first:border-0 first:pt-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{DOCUMENTOS[t].texto}</span>
                <span className={`shrink-0 text-xs font-medium ${SITUACION[s].cls}`}>{SITUACION[s].texto}</span>
              </div>
              {DOCUMENTOS[t].ayuda && <p className="text-xs text-stone-500">{DOCUMENTOS[t].ayuda}</p>}
              {d && (
                <p className="mt-1 text-xs text-stone-500">
                  {d.nombre} · subido {d.subido}
                  {d.caduca ? ` · válido hasta ${d.caduca}` : ""}
                  {d.estado === "rechazado" && d.motivo ? ` · Motivo: ${d.motivo}` : ""}
                </p>
              )}
              {p.estado !== "rechazado" && s !== "valido" && s !== "pendiente" && <SubirDoc token={token} tipo={t} alSubir={cargar} />}
              {p.estado !== "rechazado" && (s === "valido" || s === "pendiente") && (
                <details className="mt-1 text-xs">
                  <summary className="cursor-pointer text-teal-700">Subir una versión nueva</summary>
                  <SubirDoc token={token} tipo={t} alSubir={cargar} />
                </details>
              )}
            </div>
          );
        })}
        <p className="text-xs text-stone-500">PDF, JPG o PNG de hasta 10 MB. Se guardan en servidores de la UE y solo los ve nuestro equipo.</p>
      </Tarjeta>
    </main>
  );
}
