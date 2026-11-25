"use client";

import { useEffect, useState } from "react";
import { accesoPagado, accesoPerdidoPorFalta, alCambiar, COBRO, garantiaAcceso, GRATIS_CLIENTE, INCLUYE_ACCESO, METODOS_PAGO, pagarAcceso, precio, PRECIO_ACCESO, CONDICION_DEVOLUCION, type MetodoPago } from "@/lib/encargos";
import { incluye, useSuscripcion } from "@/lib/suscripcion";

/** ¿Ha pagado este cliente el acceso único a la red (fichas, tarifas, chat y citas)? */
export function useAcceso() {
  const [acceso, setAcceso] = useState(false);
  useEffect(() => {
    const f = () => setAcceso(!!accesoPagado());
    f();
    return alCambiar(f);
  }, []);
  return acceso;
}

/** Acceso único del cliente: 29,90 € con tarjeta o Bizum (simulado en la demo). */
export function PagoAcceso({ titulo = "Ve quién es cada uno, su precio y habla con ellos" }: { titulo?: string }) {
  const [metodo, setMetodo] = useState<MetodoPago>("Tarjeta");
  const sus = useSuscripcion();
  const suscrito = sus ? incluye(sus.plan, "basico") : false;
  const importe = suscrito ? COBRO.accesoSuscrito : COBRO.accesoCliente;
  const [perdido, setPerdido] = useState(false);
  useEffect(() => setPerdido(accesoPerdidoPorFalta()), []);
  return (
    <div className="rounded-2xl border-2 border-teal-600 bg-white p-5" data-pago-acceso>
      {perdido && <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs font-medium text-red-900">Perdiste tu acceso porque faltaste a una cita sin avisar. Para pedir más citas tienes que volver a pagarlo.</p>}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <div className="text-right">
          <div className="font-display text-3xl font-semibold text-teal-800">
            {suscrito && <span className="mr-2 text-lg font-normal text-stone-400 line-through">{PRECIO_ACCESO}</span>}
            {precio(importe)}<span className="ml-1 text-sm font-normal text-stone-500">pago único</span>
          </div>
          {suscrito && <div className="text-xs font-medium text-teal-700">Precio para suscriptores</div>}
        </div>
      </div>
      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Gratis</div>
          <ul className="mt-1 space-y-1 text-stone-600">{GRATIS_CLIENTE.map((x) => <li key={x}>✓ {x}</li>)}</ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">Con el acceso</div>
          <ul className="mt-1 space-y-1 text-stone-800">{INCLUYE_ACCESO.map((x) => <li key={x}>✓ {x}</li>)}</ul>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Forma de pago">
        {METODOS_PAGO.map((m) => (
          <button key={m} role="radio" aria-checked={metodo === m} onClick={() => setMetodo(m)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${metodo === m ? "border-teal-700 bg-teal-50 text-teal-900" : "border-stone-300 text-stone-600"}`}>
            {m === "Tarjeta" ? "💳 Tarjeta" : "📱 Bizum"}
          </button>
        ))}
        <button onClick={() => pagarAcceso(metodo, importe)} className="ml-auto rounded-xl bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800">Pagar {precio(importe)} con {metodo}</button>
      </div>
      <p className="mt-2 text-xs text-stone-500">
        Un solo pago, sin permanencia. No pagas nada más por pedir citas ni sobre la obra.{!suscrito && <> Con una suscripción (desde 4,95 €/mes) lo pagas a {precio(COBRO.accesoSuscrito)}.</>} Demo: el pago es simulado, no se cobra nada.
      </p>
      <p className="mt-1 text-[11px] leading-snug text-stone-400">Condiciones: pago único por cliente, no reembolsable salvo un caso: {CONDICION_DEVOLUCION.charAt(0).toLowerCase() + CONDICION_DEVOLUCION.slice(1)} Si faltas a una cita sin avisar, el acceso se pierde y hay que volver a pagarlo.</p>
    </div>
  );
}


/** Solo avisa si se aplicó la devolución por no tener ninguna cita aceptada (la condición va en letra pequeña, sin destacarla). */
export function GarantiaAcceso() {
  const [g, setG] = useState<ReturnType<typeof garantiaAcceso>>(null);
  useEffect(() => {
    const f = () => setG(garantiaAcceso());
    f();
    return alCambiar(f);
  }, []);
  if (!g) return null;
  if (g.estado !== "devuelta") return null;
  if (g.estado === "devuelta")
  return <p className="rounded-xl bg-stone-100 p-3 text-xs text-stone-700">Ningún proveedor aceptó una cita contigo en {COBRO.diasGarantia} días, así que te hemos devuelto {precio(g.importe)}. Puedes volver a pagar el acceso cuando quieras.</p>;
}
