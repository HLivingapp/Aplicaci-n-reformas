import type { Metadata } from "next";
import Link from "next/link";
import { APP } from "@/lib/marca";
import { RESPONSABLE as R } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function Privacidad() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-[15px] leading-relaxed text-stone-800">
      <Link href="/" className="text-sm text-stone-500 hover:underline">← Inicio</Link>
      <h1 className="mb-1 mt-3 text-2xl font-semibold tracking-tight">Política de privacidad</h1>
      <p className="mb-8 text-sm text-stone-500">Última actualización: {R.actualizada}</p>

      <Seccion titulo="1. Responsable del tratamiento">
        <ul className="list-none space-y-0.5">
          <li><b>{R.razonSocial}</b> ({R.marca})</li>
          <li>CIF: {R.cif}</li>
          <li>Domicilio: {R.domicilio}</li>
          <li>Email: <a className="text-teal-700 underline" href={`mailto:${R.email}`}>{R.email}</a> · Teléfono: {R.telefono}</li>
        </ul>
        <p className="mt-2">{R.razonSocial} es la titular de {APP.nombre} y la comercializadora de los servicios de los profesionales de la app. Las empresas destacadas, como Human Living, son empresas distintas.</p>
      </Seccion>

      <Seccion titulo="2. Qué datos tratamos">
        <p>Cuando abres tu proyecto de reforma en esta aplicación tratamos:</p>
        <ul>
          <li><b>Datos de contacto:</b> nombre y apellidos, teléfono y email.</li>
          <li><b>Datos de la vivienda:</b> dirección, referencia catastral, superficie, año de construcción, planta, ascensor, terrazas, distribución e instalaciones.</li>
          <li><b>Datos de la reforma:</b> trabajos que quieres hacer, nivel de acabados, presupuesto orientativo, plazos y los comentarios que nos escribas.</li>
          <li><b>Datos de la relación comercial:</b> presupuestos, su aceptación o rechazo, planificación y seguimiento de la obra.</li>
        </ul>
        <p>No pedimos datos especialmente protegidos (salud, ideología, etc.). Te pedimos que no los incluyas en los comentarios.</p>
        <p>Los datos catastrales (superficie, año, referencia) se obtienen de la <b>Sede Electrónica del Catastro</b>, que es una fuente pública, a partir de la dirección que nos indicas.</p>
      </Seccion>

      <Seccion titulo="3. Para qué los usamos y con qué base legal">
        <ul>
          <li><b>Estudiar tu reforma, preparar la estimación y el presupuesto y contactarte</b>: medidas precontractuales a petición tuya y tu consentimiento (art. 6.1.a y 6.1.b del RGPD).</li>
          <li><b>Ejecutar la obra y darte acceso al seguimiento</b> si aceptas el presupuesto: ejecución del contrato (art. 6.1.b RGPD).</li>
          <li><b>Cumplir obligaciones legales</b> fiscales y contables (art. 6.1.c RGPD).</li>
        </ul>
        <p>No tomamos decisiones automatizadas con efectos jurídicos: la estimación que ves es orientativa y siempre la revisa una persona del equipo. No usamos tus datos para publicidad de terceros.</p>
      </Seccion>

      <Seccion titulo="4. Cuánto tiempo los conservamos">
        <ul>
          <li>Si no llegamos a contratar la obra: hasta <b>12 meses</b> desde tu último contacto, salvo que nos pidas antes que los borremos.</li>
          <li>Si contratas la obra: mientras dure la relación y, después, durante los plazos legales (en general, <b>6 años</b> para la documentación mercantil y contable, y los plazos de garantía de la obra).</li>
        </ul>
      </Seccion>

      <Seccion titulo="5. Quién puede ver tus datos">
        <p>El equipo de {R.razonSocial} que gestiona la app y, cuando eliges a un profesional (reformista, estudio de arquitectura o especialista para tu comunidad de vecinos), ese profesional, que firma al darse de alta un compromiso de usar tus datos solo para tu reforma y protegerlos. Para que la aplicación funcione usamos proveedores que tratan los datos por cuenta nuestra (encargados del tratamiento), con contrato conforme al art. 28 del RGPD: {R.proveedores}.</p>
        <p>Si es necesario para tu obra, compartiremos lo imprescindible con los profesionales e industriales que intervienen en ella, o con entidades financieras si nos pides gestionar la financiación. No vendemos tus datos ni los cedemos a terceros para otros fines, salvo obligación legal.</p>
        <p>Los datos se guardan en servidores ubicados en la Unión Europea.</p>
      </Seccion>

      <Seccion titulo={`Registro en ${APP.nombre}`}>
        <p>Para usar la aplicación te unes a la app con tu <b>email</b>, sin contraseña. Lo usamos para darte acceso y enviarte avisos sobre tu cuenta (art. 6.1.b RGPD).</p>
        <p>Si además nos das tu <b>teléfono</b> y marcas la casilla, te escribiremos por WhatsApp o te llamaremos sobre tu reforma y la app, con tu consentimiento (art. 6.1.a RGPD). Es opcional, no es necesario para entrar y puedes retirarlo cuando quieras escribiéndonos. Guardamos el texto que aceptaste y la fecha.</p>
        <p>Si dejas de usar la app, borramos tus datos a los 24 meses de tu última actividad, o antes si nos lo pides.</p>
      </Seccion>

      <Seccion titulo="6. Si eres reformista o proveedor">
        <p>Si pides homologarte como proveedor tratamos los datos de tu empresa y de la persona de contacto, tu número de REA, tus zonas y especialidades, las obras de referencia que nos indicas y los documentos que subes (prevención de riesgos laborales, seguro de responsabilidad civil, certificados al corriente de pago con la Agencia Tributaria y la Seguridad Social y cuentas anuales).</p>
        <p>Los usamos para comprobar que cumples los requisitos, vigilar que tus documentos sigan en vigor y ponerte en contacto con clientes, con tu consentimiento y como medidas precontractuales (art. 6.1.a y 6.1.b RGPD). Podemos llamar a los contactos de tus obras de referencia solo para confirmarlas: avísales antes de darnos sus datos.</p>
        <p>Tus documentos se guardan en un almacén privado en la Unión Europea y solo los ve nuestro equipo; los clientes nunca los ven. Si no llegas a homologarte, los borramos a los 12 meses; si te homologas, los conservamos mientras colabores con nosotros y después durante los plazos legales.</p>
      </Seccion>

      <Seccion titulo="7. Tu enlace privado">
        <p>Para seguir tu proyecto no necesitas contraseña: te damos un <b>enlace privado</b> único y muy difícil de adivinar. Cualquiera que tenga ese enlace podrá ver tu proyecto, así que no lo compartas. Si crees que alguien más lo tiene, pídenos uno nuevo y el anterior dejará de funcionar.</p>
      </Seccion>

      <Seccion titulo="8. Tus derechos">
        <p>Puedes pedirnos en cualquier momento <b>acceder</b> a tus datos, <b>rectificarlos</b>, <b>suprimirlos</b>, <b>oponerte</b> o <b>limitar</b> su tratamiento, pedir su <b>portabilidad</b> y <b>retirar tu consentimiento</b>, escribiendo a <a className="text-teal-700 underline" href={`mailto:${R.email}`}>{R.email}</a> o a la dirección postal indicada. Te responderemos en el plazo máximo de un mes.</p>
        <p>Si consideras que no hemos tratado bien tus datos, puedes reclamar ante la <b>Agencia Española de Protección de Datos</b> (<a className="text-teal-700 underline" href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).</p>
      </Seccion>

      <Seccion titulo="9. Seguridad">
        <p>Aplicamos medidas técnicas y organizativas adecuadas: conexión cifrada (HTTPS), acceso del equipo solo con enlace de verificación enviado a su email corporativo, control de acceso a la base de datos y copias de seguridad del proveedor.</p>
      </Seccion>

      <Seccion titulo="10. Cookies y almacenamiento local">
        <p>La aplicación no usa cookies de publicidad ni de analítica. Solo guarda en tu navegador lo imprescindible para funcionar, como el borrador del formulario mientras lo rellenas o la sesión del equipo.</p>
      </Seccion>
    </main>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-7 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:space-y-1">
      <h2 className="mb-2 text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}
