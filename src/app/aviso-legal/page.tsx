import type { Metadata } from "next";
import Link from "next/link";
import { APP } from "@/lib/marca";
import { RESPONSABLE as R } from "@/lib/legal";
import { COBRO, PRECIO_ACCESO, PRECIO_ACCESO_SUSCRITO, PRECIO_CITA } from "@/lib/comercializacion";
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
          Cuando un cliente pide presupuestos, la app le propone los {PUNTOS.propuestos} profesionales homologados con mejor encaje para su vivienda: primero por cercanía (que trabajen en su zona) y después por puntos de visibilidad. Los puntos suben con las ventas del profesional a clientes de la app, con las valoraciones de sus clientes y con cada cliente que trae a la app o que le invita.
        </p>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Qué se paga y quién lo cobra</h2>
        <p>
          Ver cuántos profesionales hay en la zona y el presupuesto medio es gratis. Para ver la ficha ampliada y las tarifas de cada profesional, chatear con ellos y pedirles cita, el cliente paga una
          cuota única de {PRECIO_ACCESO} ({PRECIO_ACCESO_SUSCRITO} si tiene una suscripción de servicios), con tarjeta o Bizum. Si en {COBRO.diasGarantia} días desde el pago ningún
          profesional acepta una cita con él, se le devuelve la cuota. Cada profesional paga {PRECIO_CITA} cuando acepta una cita presencial con un cliente de la app, venda o no. Si marca que el
          cliente no se presentó y este no lo desmiente en 48 horas, recupera la cita como crédito para la siguiente. Los arquitectos y estudios no hacen visita: chatean con el cliente y pagan 99 € cuando piden su contacto, acabe o no en encargo; desde ahí la relación es directa. Lo cobra {R.razonSocial}. No se cobra nada cuando el cliente invita a su
          propio profesional o el profesional trae a su cliente.
        </p>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Sin comisión sobre la obra</h2>
        <p>
          {R.razonSocial} no cobra ningún porcentaje ni importe mínimo sobre el precio de las obras o de los honorarios, no es parte de los contratos entre cliente y profesional y no interviene en
          su ejecución. El contrato estándar que ofrece la app es un modelo que las partes pueden usar si quieren.
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
