"use client";

import { useParamsReales } from "@/lib/rutas";
import Link from "next/link";

import { useEffect, useState } from "react";
import { euros, fecha, sumarDias, totalCapitulo, totales, totalPartida } from "@/lib/calc";
import type { DatosPortal } from "@/lib/publico";
import { cargarPortal, enviarRespuesta } from "@/lib/publico-cliente";
import { Boton, EstadoPresupuestoTag, inputCls, Tarjeta, Vacio } from "@/components/ui";

export default function PresupuestoCliente() {
  const { token, id } = useParamsReales<{ token: string; id: string }>();
  const [datos, setDatos] = useState<DatosPortal | null | undefined>(undefined);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  useEffect(() => {
    cargarPortal(token).then(setDatos);
  }, [token]);
  if (datos === undefined) return <main className="flex min-h-dvh items-center justify-center text-stone-500">Cargando…</main>;
  const p = datos?.presupuestos.find((x) => x.id === id);
  if (!datos || !p) return <main className="p-6"><Vacio>Presupuesto no disponible.</Vacio></main>;
  const t = totales(p);

  const responder = async (acepta: boolean) => {
    if (!confirm(acepta ? "¿Aceptas este presupuesto?" : "¿Rechazas este presupuesto?")) return;
    setEnviando(true);
    try {
      await enviarRespuesta(token, id, acepta, comentario);
      setDatos(await cargarPortal(token));
    } catch {
      alert("No se ha podido enviar la respuesta. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 pb-12 pt-6">
      <Link href={`/p/${token}`} className="no-print text-sm text-stone-500 hover:underline">← Mi reforma</Link>
      <div className="mb-4 mt-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm text-stone-500">{datos.empresa.nombre} · Presupuesto Nº {p.numero}</div>
          <h1 className="text-2xl font-semibold tracking-tight">{p.titulo}</h1>
          <div className="text-sm text-stone-500">{p.direccionObra} · {fecha(p.fecha)} · válido hasta {fecha(sumarDias(p.fecha, p.validezDias))}</div>
        </div>
        <EstadoPresupuestoTag estado={p.estado} />
      </div>

      <div className="space-y-3">
        {p.capitulos.map((c, ci) => (
          <Tarjeta key={c.id} className="print-plain">
            <div className="mb-2 flex justify-between font-semibold">
              <span>{ci + 1}. {c.nombre}</span>
              <span>{euros(totalCapitulo(c))}</span>
            </div>
            <ul className="divide-y divide-stone-100 text-sm">
              {c.partidas.map((it) => (
                <li key={it.id} className="flex justify-between gap-4 py-1.5">
                  <span>{it.descripcion}<span className="block text-xs text-stone-400">{it.cantidad} {it.unidad} × {euros(it.precio)}</span></span>
                  <span className="whitespace-nowrap">{euros(totalPartida(it))}</span>
                </li>
              ))}
            </ul>
          </Tarjeta>
        ))}
        <Tarjeta className="print-plain text-sm">
          <div className="flex justify-between"><span>Suma</span><span>{euros(t.bruto)}</span></div>
          {p.descuentoPct > 0 && <div className="flex justify-between"><span>Descuento {p.descuentoPct}%</span><span>− {euros(t.descuento)}</span></div>}
          <div className="flex justify-between"><span>Base imponible</span><span>{euros(t.base)}</span></div>
          <div className="flex justify-between"><span>IVA {p.ivaPct}%</span><span>{euros(t.iva)}</span></div>
          <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-lg font-semibold"><span>Total</span><span>{euros(t.total)}</span></div>
          {p.notas && <p className="mt-3 whitespace-pre-wrap text-stone-600">{p.notas}</p>}
        </Tarjeta>
      </div>

      {p.estado === "enviado" ? (
        <Tarjeta className="no-print mt-4">
          <h2 className="mb-2 font-semibold">¿Qué te parece?</h2>
          <textarea rows={2} className={inputCls} placeholder="Comentario (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Boton onClick={() => responder(true)} disabled={enviando}>Aceptar presupuesto</Boton>
            <Boton variante="peligro" onClick={() => responder(false)} disabled={enviando}>Rechazar</Boton>
            <Boton variante="fantasma" onClick={() => window.print()}>Descargar PDF</Boton>
          </div>
        </Tarjeta>
      ) : (
        p.respuestaCliente && <p className="mt-4 text-sm text-stone-500">Respondiste el {fecha(p.respuestaCliente.fecha)}.</p>
      )}
    </main>
  );
}
