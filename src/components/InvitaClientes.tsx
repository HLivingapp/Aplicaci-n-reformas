"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rutaInvitacionPro, type InvitacionPro } from "@/lib/invita-pro";
import { SERVICIOS, type Servicio } from "@/lib/estudios";
import { TEXTO_CITA_PROVEEDOR } from "@/lib/comercializacion";

/** Área del profesional: enlace para invitar a sus propios clientes. Esas obras no tienen reserva ni fee. */
export function InvitaClientes({ tipo, id, codigo }: Omit<InvitacionPro, "servicio">) {
  const [servicio, setServicio] = useState<Servicio>("proyecto");
  const [origen, setOrigen] = useState("");
  const [copiado, setCopiado] = useState(false);
  useEffect(() => setOrigen(window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? "")), []);
  const ruta = rutaInvitacionPro({ tipo, id, codigo, servicio: tipo === "estudio" ? servicio : undefined });
  const enlace = origen + ruta;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
    } catch {
      /* sin portapapeles */
    }
  };
  return (
    <div className="space-y-2 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
      <div className="text-base font-semibold">🤝 Invita a tus clientes: esas obras no te costarán ni un euro</div>
      <p>
        Manda este enlace a tus propios clientes. Calculan su presupuesto en la app y la obra te llega directamente a ti, con contrato, pagos por hitos y avances. Con ellos no pagas cita y tu cliente
        no paga acceso. Con los clientes que te llegan por la app pagas {TEXTO_CITA_PROVEEDOR}. Nunca cobramos comisión sobre la obra.
      </p>
      {tipo === "estudio" && (
        <label className="block text-xs">
          Servicio para el que le invitas
          <select className="mt-1 block w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-sm" value={servicio} onChange={(e) => setServicio(e.target.value as Servicio)}>
            {SERVICIOS.map((s) => <option key={s.id} value={s.id}>{s.texto}</option>)}
          </select>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        <input readOnly aria-label="Enlace de invitación" className="min-w-0 flex-1 rounded-lg border border-violet-200 bg-white px-2 py-2 text-xs" value={enlace} />
        <button onClick={copiar} className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white">{copiado ? "✓ Copiado" : "Copiar enlace"}</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(`Calcula el presupuesto de tu reforma conmigo en la app: ${enlace}`)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-violet-700 px-3 py-2 text-xs font-semibold text-violet-800">WhatsApp</a>
      </div>
      <Link href={ruta} className="text-xs text-violet-500 underline">Demo: abrir el enlace como tu cliente</Link>
    </div>
  );
}
