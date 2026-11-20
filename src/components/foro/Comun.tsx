"use client";

import Link from "next/link";
import { useState } from "react";
import { fotoSinUbicacion } from "@/lib/foto-segura";
import { TEXTO_CONSENTIMIENTO_FORO, TIPOS, type Autor, type Mensaje, type TipoTema } from "@/lib/foro";
import { inputCls } from "@/components/ui";
import { CabeceraPublica } from "@/components/CabeceraPublica";

export const CabeceraComunidad = CabeceraPublica;

export function EtiquetaTipo({ tipo }: { tipo: TipoTema }) {
  const t = TIPOS.find((x) => x.valor === tipo)!;
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${t.clase}`}>{t.icono} {t.texto}</span>;
}

export function NombreAutor({ a }: { a: Autor }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="font-medium text-stone-800">{a.alias}</span>
      {a.tipo === "profesional" && a.homologado && <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">✓ Profesional homologado</span>}
    </span>
  );
}

export const haceTiempo = (iso: string) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "hoy" : d === 1 ? "ayer" : d < 30 ? `hace ${d} días` : `hace ${Math.floor(d / 30)} mes${d >= 60 ? "es" : ""}`;
};

export function Cuerpo({ m }: { m: Mensaje }) {
  return (
    <>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-700">{m.texto}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {m.foto && <img src={m.foto} alt="Foto de la obra" className="mt-3 max-h-80 rounded-lg border border-stone-200 object-contain" />}
    </>
  );
}

/** Campos comunes para publicar: alias, texto, foto y consentimiento. */
export function useFormularioMensaje() {
  const [alias, setAlias] = useState("");
  const [texto, setTexto] = useState("");
  const [foto, setFoto] = useState<string | undefined>();
  const [acepto, setAcepto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valido = alias.trim().length >= 3 && texto.trim().length >= 10 && acepto;
  const limpiar = () => { setTexto(""); setFoto(undefined); };
  const campos = (
    <>
      <label className="block text-sm">
        <span className="mb-1 block text-stone-600">Tu alias público</span>
        <input className={inputCls} value={alias} maxLength={30} placeholder="Por ejemplo: Laura_Retiro" onChange={(e) => setAlias(e.target.value)} />
        <span className="mt-0.5 block text-xs text-stone-400">No uses tu nombre completo.</span>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-stone-600">Mensaje</span>
        <textarea className={`${inputCls} resize-y`} rows={5} value={texto} maxLength={4000} onChange={(e) => setTexto(e.target.value)} placeholder="Cuenta qué materiales, qué pasó y cómo se resolvió…" />
        <span className="mt-0.5 block text-xs text-stone-400">Los teléfonos, emails, enlaces y direcciones se ocultan automáticamente.</span>
      </label>
      <div className="text-sm">
        <span className="mb-1 block text-stone-600">Foto (opcional)</span>
        <input
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return setFoto(undefined);
            try {
              setFoto(await fotoSinUbicacion(f));
              setError(null);
            } catch {
              setError("No se ha podido leer la foto.");
            }
          }}
        />
        <span className="mt-0.5 block text-xs text-stone-400">Solo interiores: que no se vea la fachada, las vistas, el portal ni personas. Quitamos la ubicación GPS de la foto.</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {foto && <img src={foto} alt="" className="mt-2 h-24 rounded border border-stone-200" />}
      </div>
      <label className="flex items-start gap-2 text-xs text-stone-600">
        <input type="checkbox" className="mt-0.5" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
        <span>{TEXTO_CONSENTIMIENTO_FORO} <Link href="/privacidad" className="underline">Privacidad</Link></span>
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </>
  );
  return { alias, texto, foto, valido, campos, limpiar };
}
