"use client";

import Link from "next/link";
import { useState } from "react";
import { esLegal, type Tema } from "@/lib/foro";

/** Opinión del asistente IA en un tema: orientativa, con fuentes, y abierta a que los profesionales la corrijan. */
export function AsistenteIA({ tema, disponible, pedir }: { tema: Tema; disponible: boolean; pedir: () => Promise<unknown> }) {
  const [cargando, setCargando] = useState(false);
  const r = tema.respuestaIA;
  const legal = esLegal(tema);

  if (!r) {
    if (!disponible) return null;
    return (
      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 text-sm sm:flex-row sm:items-center">
        <div className="flex-1 text-indigo-900">
          <span className="font-semibold">🤖 Asistente IA de obra.</span>{" "}
          {legal ? "Busca en la normativa oficial de Madrid y te da una primera orientación con fuentes." : "Te da una primera opinión técnica mientras responden los profesionales."}
        </div>
        <button
          disabled={cargando}
          onClick={async () => {
            setCargando(true);
            await pedir();
            setCargando(false);
          }}
          className="rounded-full bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-800 disabled:opacity-60"
        >
          {cargando ? (legal ? "Consultando la normativa…" : "Pensando…") : "Pedir opinión al asistente IA"}
        </button>
      </div>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-indigo-700 px-2 py-0.5 font-medium text-white">🤖 Asistente IA</span>
        <span className="text-indigo-900/70">Respuesta automática y orientativa{legal ? " basada en normativa oficial" : ""}</span>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-800">{r.texto}</p>
      {r.fuentes.length > 0 && (
        <div className="mt-3 text-xs">
          <div className="font-medium text-stone-600">Fuentes</div>
          <ul className="mt-1 space-y-0.5">
            {r.fuentes.map((f) => (
              <li key={f.url + f.titulo}>
                <a href={f.url} target="_blank" rel="noopener noreferrer nofollow" className="text-indigo-800 underline">
                  {f.titulo}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-xs text-stone-500">
        ¿Eres profesional homologado y matizarías algo? Responde abajo: tu opinión aparece con el sello de profesional.{" "}
        <Link href="/suscripcion" className="text-indigo-800 underline">Asistente IA privado para tu obra</Link>
      </p>
    </section>
  );
}
