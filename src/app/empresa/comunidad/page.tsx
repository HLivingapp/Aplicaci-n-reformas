"use client";

import { useEffect, useState } from "react";
import { fecha } from "@/lib/calc";
import type { Miembro } from "@/lib/miembro";
import { CLAVE_DEMO } from "@/lib/miembro-cliente";
import { conBaseDeDatos } from "@/lib/modo";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { inputCls, Tarjeta, Titulo, Vacio } from "@/components/ui";

/** Miembros de la comunidad de la app. Solo se contacta por WhatsApp o teléfono a quien lo autorizó. */
export default function Miembros() {
  const [lista, setLista] = useState<Miembro[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [soloContacto, setSoloContacto] = useState(false);

  useEffect(() => {
    if (!conBaseDeDatos) {
      try {
        setLista(JSON.parse(localStorage.getItem(CLAVE_DEMO) ?? "[]"));
      } catch {
        setLista([]);
      }
      return;
    }
    (async () => {
      const { data } = await supabaseNavegador().auth.getSession();
      const r = await fetch("/api/registro", { headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` }, cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return setError(j.error ?? "No se ha podido cargar");
      setLista(j.miembros ?? []);
    })();
  }, []);

  const filtrados = (lista ?? []).filter((m) => (!soloContacto || m.contacto) && m.email.includes(busca.toLowerCase()));
  const conContacto = (lista ?? []).filter((m) => m.contacto).length;

  return (
    <div>
      <Titulo>Comunidad</Titulo>
      <p className="-mt-2 mb-4 text-sm text-stone-500">
        {lista ? `${lista.length} miembros · ${conContacto} autorizan WhatsApp o llamada` : "Cargando…"}
        {!conBaseDeDatos && " · En la demo solo aparecen los registros hechos en este navegador."}
      </p>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input className={`${inputCls} max-w-xs`} placeholder="Buscar por email" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" className="accent-teal-700" checked={soloContacto} onChange={(e) => setSoloContacto(e.target.checked)} />
          Solo quien autoriza contacto
        </label>
      </div>
      {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {lista && !filtrados.length ? (
        <Vacio>Todavía no hay miembros{soloContacto ? " que autoricen contacto" : ""}.</Vacio>
      ) : (
        <div className="space-y-2">
          {filtrados.map((m) => {
            const tel = m.telefono?.replace(/\D/g, "");
            return (
              <Tarjeta key={m.email} className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{m.email}</div>
                  <div className="text-xs text-stone-500">
                    Desde el {fecha((m.creado ?? m.privacidad.fecha).slice(0, 10))}
                    {m.contacto ? ` · Autoriza WhatsApp y llamada desde el ${fecha(m.contacto.fecha.slice(0, 10))}` : m.telefono ? " · Dio teléfono, pero no autoriza contacto" : ""}
                  </div>
                </div>
                {m.contacto && tel ? (
                  <div className="flex gap-2 text-sm">
                    <a href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white">WhatsApp</a>
                    <a href={`tel:${m.telefono}`} className="rounded-lg border border-stone-300 px-3 py-1.5">Llamar</a>
                  </div>
                ) : (
                  <span className="text-xs text-stone-400">Solo email</span>
                )}
              </Tarjeta>
            );
          })}
        </div>
      )}
    </div>
  );
}
