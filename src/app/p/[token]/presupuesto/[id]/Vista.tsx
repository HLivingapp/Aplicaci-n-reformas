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

      <Tarjeta className="print-plain mb-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">Empresa</div>
          <div className="font-medium">{datos.empresa.nombre}</div>
          {datos.empresa.cif && <div className="text-stone-500">CIF {datos.empresa.cif}</div>}
          {datos.empresa.direccion && <div className="text-stone-500">{datos.empresa.direccion}</div>}
          {(datos.empresa.telefono || datos.empresa.email) && <div className="text-stone-500">{[datos.empresa.telefono, datos.empresa.email].filter(Boolean).join(" · ")}</div>}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">Cliente y obra</div>
          <div className="font-medium">{datos.cliente.nombre}</div>
          <div className="text-stone-500">{p.direccionObra}</div>
          <div className="text-stone-500">Importe sin IVA: <strong className="text-stone-800">{euros(t.base)}</strong></div>
        </div>
      </Tarjeta>

      {/* Resumen por capítulos */}
      <Tarjeta className="print-plain mb-4">
        <h2 className="mb-2 font-semibold">Resumen por capítulos</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-stone-100">
            {p.capitulos.map((c, ci) => (
              <tr key={c.id}>
                <td className="w-10 py-1.5 text-stone-400">{String(ci + 1).padStart(2, "0")}</td>
                <td className="py-1.5"><a href={`#cap-${ci + 1}`} className="hover:underline">{c.nombre}</a></td>
                <td className="py-1.5 text-right text-xs text-stone-400">{t.bruto > 0 ? `${Math.round((totalCapitulo(c) / t.bruto) * 100)} %` : ""}</td>
                <td className="w-28 py-1.5 text-right">{euros(totalCapitulo(c))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>

      <div className="space-y-4">
        {p.capitulos.map((c, ci) => {
          const cod = String(ci + 1).padStart(2, "0");
          return (
            <Tarjeta key={c.id} className="print-plain">
              <h2 id={`cap-${ci + 1}`} className="mb-2 flex scroll-mt-4 justify-between gap-3 border-b border-stone-200 pb-2 font-semibold">
                <span>{cod} · {c.nombre}</span>
                <span>{euros(totalCapitulo(c))}</span>
              </h2>
              <div className="hidden grid-cols-[3.5rem_1fr_5rem_6rem_6.5rem] gap-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400 sm:grid">
                <span>Código</span><span>Descripción</span><span className="text-right">Cantidad</span><span className="text-right">Precio</span><span className="text-right">Importe</span>
              </div>
              <ul className="divide-y divide-stone-100 text-sm">
                {c.partidas.map((it, ii) => (
                  <li key={it.id} className="grid grid-cols-[3.5rem_1fr] gap-x-2 gap-y-1 py-2.5 sm:grid-cols-[3.5rem_1fr_5rem_6rem_6.5rem]">
                    <span className="text-xs text-stone-400">{cod}.{String(ii + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="font-medium text-stone-800">{it.descripcion}</div>
                      {it.detalle && <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-stone-500">{it.detalle}</p>}
                    </div>
                    <span className="col-start-2 text-xs text-stone-500 sm:col-start-auto sm:text-right sm:text-sm sm:text-stone-700">
                      {it.cantidad.toLocaleString("es-ES")} {it.unidad}
                      <span className="sm:hidden"> × {euros(it.precio)} = <strong className="text-stone-800">{euros(totalPartida(it))}</strong></span>
                    </span>
                    <span className="hidden text-right sm:block">{euros(it.precio)}</span>
                    <span className="hidden text-right font-medium sm:block">{euros(totalPartida(it))}</span>
                  </li>
                ))}
              </ul>
            </Tarjeta>
          );
        })}
        <Tarjeta className="print-plain text-sm">
          <div className="flex justify-between"><span>Suma de capítulos</span><span>{euros(t.bruto)}</span></div>
          {p.descuentoPct > 0 && <div className="flex justify-between"><span>Descuento {p.descuentoPct}%</span><span>− {euros(t.descuento)}</span></div>}
          <div className="flex justify-between"><span>Base imponible</span><span>{euros(t.base)}</span></div>
          <div className="flex justify-between"><span>IVA {p.ivaPct}%</span><span>{euros(t.iva)}</span></div>
          <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-lg font-semibold"><span>Total</span><span>{euros(t.total)}</span></div>
          {p.notas && <p className="mt-3 whitespace-pre-wrap text-stone-600">{p.notas}</p>}
        </Tarjeta>
        <Tarjeta className="print-plain text-xs leading-relaxed text-stone-600">
          <h2 className="mb-2 text-sm font-semibold text-stone-800">Condiciones</h2>
          <ul className="list-disc space-y-1 pl-4">
            <li>Mediciones estimadas para una vivienda de este tamaño. Se comprueban en la visita y la obra se factura por lo realmente ejecutado.</li>
            <li>Forma de pago orientativa: 30 % a la firma, 30 % al terminar albañilería e instalaciones, 30 % al terminar revestimientos y carpinterías, y 10 % a la entrega.</li>
            <li>El IVA aplicado ({p.ivaPct} %) es el reducido de reformas de vivienda habitual cuando se cumplen sus requisitos.</li>
            <li>No incluye licencia de obra ni el impuesto municipal (ICIO), salvo que aparezcan en una partida.</li>
            <li>Cualquier cambio sobre lo presupuestado se valorará por escrito antes de hacerlo.</li>
            <li>Presupuesto válido hasta el {fecha(sumarDias(p.fecha, p.validezDias))}.</li>
          </ul>
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
