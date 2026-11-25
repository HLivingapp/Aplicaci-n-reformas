"use client";

import { useState } from "react";
import { citaAceptada, enviarMensaje, type Encargo, type MensajeChat } from "@/lib/encargos";
import type { Identidad } from "@/lib/anonimizar";
import { PUNTOS } from "@/lib/visibilidad";
import { inputCls } from "./ui";

/**
 * Chat entre cliente y reformista para preparar la cita presencial.
 * Hasta que el reformista acepta la cita, teléfonos, emails, webs, redes y nombres se ocultan solos; después, libre.
 */
export function ChatEncargo({ e, parte, identidad }: { e: Encargo; parte: MensajeChat["de"]; identidad?: Identidad }) {
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const chat = e.chat ?? [];
  if (e.estado === "firmado" || e.estado === "descartado") return null;
  const enviar = () => {
    const n = enviarMensaje(e.id, parte, texto, identidad);
    setTexto("");
    setAviso(
      n
        ? parte === "reformista"
          ? `Hemos ocultado ${n} dato${n === 1 ? "" : "s"} de contacto. Hasta aceptar la cita no se pueden compartir: cada intento resta ${-PUNTOS.porIntentoContacto} puntos de visibilidad.`
          : `Hemos ocultado ${n} dato${n === 1 ? "" : "s"} de contacto. En cuanto el reformista acepte la cita, podréis compartirlos.`
        : null,
    );
  };
  const otro = parte === "cliente" ? `Reformista ${e.codigo}` : "Cliente";
  return (
    <div className="mt-3 rounded-xl border border-stone-200 bg-white text-sm">
      <button type="button" onClick={() => setAbierto(!abierto)} className="flex w-full items-center justify-between px-3 py-2 text-left font-medium">
        <span>💬 Chat{chat.length ? ` (${chat.length})` : ""}</span>
        <span className="text-xs text-teal-700">{abierto ? "Cerrar" : "Abrir"}</span>
      </button>
      {abierto && (
        <div className="space-y-2 border-t border-stone-100 p-3">
          <p className="rounded-lg bg-stone-50 p-2 text-xs text-stone-600">
            {citaAceptada(e)
              ? "✓ Cita aceptada: ya podéis compartir teléfono o email."
              : "🔒 Hasta que el reformista acepte la cita presencial, los teléfonos, emails, webs y redes se ocultan automáticamente. El día y la hora se fijan aquí."}
          </p>
          <ul className="max-h-64 space-y-1.5 overflow-y-auto">
            {chat.map((m, i) => (
              <li key={i} className={`max-w-[85%] rounded-xl px-3 py-1.5 ${m.de === parte ? "ml-auto bg-teal-700 text-white" : "bg-stone-100 text-stone-900"}`}>
                <div className="text-[10px] opacity-70">{m.de === parte ? "Tú" : otro} · {new Date(m.fecha).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                {m.texto}
              </li>
            ))}
            {!chat.length && <li className="text-xs text-stone-400">Aún no hay mensajes.</li>}
          </ul>
          {aviso && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-950">⚠️ {aviso}</p>}
          <div className="flex gap-2">
            <input className={`${inputCls} flex-1`} placeholder="Escribe un mensaje" value={texto} onChange={(x) => setTexto(x.target.value)} onKeyDown={(x) => x.key === "Enter" && texto.trim() && enviar()} />
            <button type="button" onClick={enviar} disabled={!texto.trim()} className="rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white disabled:opacity-40">Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}
