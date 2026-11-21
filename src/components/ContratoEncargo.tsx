"use client";

import { euros } from "@/lib/calc";
import { COMERCIALIZACION, feeComercializacion, IVA_REFORMA, type Encargo } from "@/lib/encargos";
import { textoDireccion } from "@/lib/proyecto";

const fecha = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "");

/** Hitos de pago estándar del contrato. Los pagos van directamente al reformista. */
export const HITOS = [
  { pct: 30, texto: "A la firma, para empezar la obra" },
  { pct: 30, texto: "Al terminar demoliciones e instalaciones" },
  { pct: 30, texto: "Al terminar alicatados, suelos y carpintería" },
  { pct: 10, texto: "A la entrega, sin repasos pendientes" },
];

/** Contrato estándar de reforma generado con el presupuesto acordado tras la visita. */
export function ContratoEncargo({ e, parte, alFirmar }: { e: Encargo; parte: "cliente" | "reformista"; alFirmar?: () => void }) {
  const f = e.final;
  if (!f) return null;
  const iva = Math.round(f.importe * IVA_REFORMA) / 100;
  const total = f.importe + iva;
  const capitulos = [...new Set(f.lineas.map((l) => l.capitulo))].map((c) => ({
    c,
    importe: f.lineas.filter((l) => l.capitulo === c).reduce((s, l) => s + l.cantidad * l.precio, 0),
  }));
  const firmado = parte === "cliente" ? !!e.firmas?.cliente : !!e.firmas?.reformista;
  const puedeFirmar = parte === "cliente" ? e.estado === "presupuesto_final" : e.estado === "firmado_cliente";
  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-sm">
      <div>
        <div className="text-xs uppercase tracking-wide text-stone-500">Contrato de reforma · modelo estándar</div>
        <h3 className="mt-1 text-lg font-semibold">Reforma de vivienda en {e.zona}</h3>
      </div>
      <ol className="list-decimal space-y-3 pl-5 text-stone-700">
        <li>
          <b>Partes.</b> {e.cliente} (la propiedad) y el reformista homologado {e.codigo} (el contratista). Los datos fiscales completos de ambas partes se incorporan al firmar.
        </li>
        <li>
          <b>Objeto.</b> Reforma de la vivienda de {textoDireccion(e.vivienda.direccion)}, según las partidas, mediciones y acabados de este presupuesto, acordado tras la visita del {fecha(e.visita.fecha) || "día acordado"}.
        </li>
        <li>
          <b>Precio.</b> {euros(f.importe)} sin IVA + {IVA_REFORMA} % de IVA ({euros(iva)}) = <b>{euros(total)}</b>. Solo cambia por trabajos nuevos o modificaciones que ambas partes acepten por escrito en la app.
          <table className="mt-2 w-full text-xs">
            <tbody>
              {capitulos.map((x) => (
                <tr key={x.c} className="border-t border-stone-100">
                  <td className="py-1">{x.c}</td>
                  <td className="py-1 text-right">{euros(x.importe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </li>
        <li>
          <b>Plazo.</b> {f.plazoSemanas} semanas desde el inicio de la obra, salvo causas ajenas al contratista que se anotarán en la app.
        </li>
        <li>
          <b>Pagos.</b> Al firmar pagas en la app una primera reserva{COMERCIALIZACION.confirmado ? ` de ${euros(feeComercializacion(f.importe))}` : ""}, que se descuenta del primer pago. El resto se paga directamente al contratista, por hitos, al validar cada fase en la app:
          <ul className="mt-1 space-y-0.5">
            {HITOS.map((h) => (
              <li key={h.texto} className="flex justify-between gap-2 text-xs"><span>{h.pct} % · {h.texto}</span><span>{euros((total * h.pct) / 100)}</span></li>
            ))}
          </ul>
        </li>
        <li>
          <b>Obligaciones del contratista.</b> Ejecutar la obra según la normativa, con su seguro de responsabilidad civil en vigor, gestionar los residuos y dejar la vivienda limpia. Las licencias o declaraciones responsables municipales se indican en el presupuesto.
        </li>
        <li>
          <b>Garantía.</b> La legal sobre los trabajos ejecutados y la del fabricante en materiales y equipos.
        </li>
        <li>
          <b>Seguro de promotor.</b> Al contratar por la app, la propiedad recibe gratis un seguro como promotor de la obra, con responsabilidad civil y defensa jurídica, durante la obra. Condiciones de la póliza pendientes de cerrar con la aseguradora.
        </li>
        <li>
          <b>Anulación.</b> La propiedad puede anular el contrato en la app. Se pagará lo ejecutado hasta ese momento.
        </li>
        {f.notas && (
          <li>
            <b>Condiciones particulares.</b> {f.notas}
          </li>
        )}
      </ol>
      {parte === "reformista" && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
          {COMERCIALIZACION.confirmado
            ? `Fee de comercialización: ${euros(feeComercializacion(f.importe))} (el mayor entre ${euros(COMERCIALIZACION.minimo)} y el ${COMERCIALIZACION.pct} % de la obra sin IVA). Lo cobra la app como reserva del cliente al firmar y se descuenta de tu primer pago.`
            : "Fee de comercialización: lo cobra la app como reserva del cliente al firmar y se descuenta de tu primer pago. Condiciones pendientes de confirmar."}{" "}
          Recuerda que firmaste declarar en la app todas las ventas con este cliente, incluidas ampliaciones. Si el cliente anula el contrato en la app, se te devuelve la parte del fee que corresponda a lo que quede por ejecutar. En esta demostración no se cobra nada.
        </p>
      )}
      <div className="grid gap-2 text-xs text-stone-500 sm:grid-cols-2">
        <div>Propiedad: {e.firmas?.cliente ? `✅ firmado el ${fecha(e.firmas.cliente)}` : "pendiente de firma"}</div>
        <div>Contratista: {e.firmas?.reformista ? `✅ firmado el ${fecha(e.firmas.reformista)}` : "pendiente de firma"}</div>
      </div>
      {!firmado && puedeFirmar && alFirmar && (
        <button onClick={alFirmar} className="w-full rounded-xl bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800">
          Firmar el contrato en la app
        </button>
      )}
      <p className="text-xs text-stone-400">Modelo de contrato pendiente de revisión legal. En la demostración la firma es simulada.</p>
    </div>
  );
}
