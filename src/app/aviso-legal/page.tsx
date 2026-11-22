import type { Metadata } from "next";
import Link from "next/link";
import { APP } from "@/lib/marca";
import { RESPONSABLE as R } from "@/lib/legal";
import { COMERCIALIZACION, TEXTO_DESCUENTO_VISITA, VISITAS } from "@/lib/comercializacion";
import { PUNTOS } from "@/lib/visibilidad";

export const metadata: Metadata = { title: "Aviso legal" };

/** Datos del titular (art. 10 LSSI). Pendiente de revisión por el abogado antes de lanzar. */
export default function AvisoLegal() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-[15px] leading-relaxed text-stone-800">
      <Link href="/" className="text-sm text-stone-500 hover:underline">← Inicio</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Aviso legal</h1>
      <section>
        <h2 className="mb-2 font-semibold">Titular de {APP.nombre}</h2>
        <ul className="space-y-0.5">
          <li><b>{R.razonSocial}</b></li>
          <li>CIF: {R.cif}</li>
          <li>Domicilio: {R.domicilio}</li>
          <li>Email: <a className="text-teal-700 underline" href={`mailto:${R.email}`}>{R.email}</a> · Teléfono: {R.telefono}</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Qué es {APP.nombre}</h2>
        <p>
          {APP.nombre} es una plataforma que pone en contacto a particulares y comunidades de propietarios con reformistas y estudios de arquitectura homologados. Las obras las contrata y ejecuta el profesional que elige el cliente, que es el responsable de ellas; los pagos de la obra van directamente a ese profesional.
        </p>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Cómo elegimos los profesionales que te proponemos</h2>
        <p>
          Cuando un cliente pide presupuestos, la app le propone los {PUNTOS.propuestos} profesionales homologados con mejor encaje para su vivienda: primero por cercanía (que trabajen en su zona) y después por puntos de visibilidad. Los puntos suben con la facturación del profesional en la app, con las valoraciones de sus clientes y con cada cliente que trae a la app o que le invita.
        </p>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Pago por visitas</h2>
        <p>
          Para pedir visitas a profesionales de la app, el cliente paga {VISITAS.cliente} € una sola vez por reforma, que cubren todas las visitas que pida. Cada profesional paga {VISITAS.reformista} € por cada visita a la que va, al confirmarla. Los cobra {R.razonSocial}. {TEXTO_DESCUENTO_VISITA} No se cobra nada (ni visitas ni reserva) cuando el cliente invita a su propio profesional o el profesional trae a su cliente.
        </p>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Reserva y fee de comercialización</h2>
        <p>
          Cuando un cliente contrata en la app a un profesional que ha conocido a través de ella, paga al firmar una reserva del {COMERCIALIZACION.pct} % del presupuesto sin IVA, con un mínimo de {COMERCIALIZACION.minimo.toLocaleString("es-ES")} €. La cobra {R.razonSocial}, forma parte del precio de la obra y se descuenta del primer pago al profesional. En las obras de clientes que invita el propio profesional, o en las que el cliente invita a su profesional, no hay reserva.
        </p>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Empresas destacadas</h2>
        <p>Human Living aparece en la app como empresa destacada, con su propio apartado. Es una empresa distinta del titular de la plataforma.</p>
      </section>
      <p className="text-sm text-stone-500">Más información sobre tus datos en la <Link href="/privacidad" className="underline">política de privacidad</Link>.</p>
    </main>
  );
}
