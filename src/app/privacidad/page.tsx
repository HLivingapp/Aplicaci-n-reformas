import type { Metadata } from "next";
import Link from "next/link";
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
        <p>Solo el equipo de {R.marca} que gestiona tu reforma. Para que la aplicación funcione usamos proveedores que tratan los datos por cuenta nuestra (encargados del tratamiento), con contrato conforme al art. 28 del RGPD: {R.proveedores}.</p>
        <p>Si es necesario para tu obra, compartiremos lo imprescindible con los profesionales e industriales que intervienen en ella, o con entidades financieras si nos pides gestionar la financiación. No vendemos tus datos ni los cedemos a terceros para otros fines, salvo obligación legal.</p>
        <p>Los datos se guardan en servidores ubicados en la Unión Europea.</p>
      </Seccion>

      <Seccion titulo="6. Tu enlace privado">
        <p>Para seguir tu proyecto no necesitas contraseña: te damos un <b>enlace privado</b> único y muy difícil de adivinar. Cualquiera que tenga ese enlace podrá ver tu proyecto, así que no lo compartas. Si crees que alguien más lo tiene, pídenos uno nuevo y el anterior dejará de funcionar.</p>
      </Seccion>

      <Seccion titulo="7. Tus derechos">
        <p>Puedes pedirnos en cualquier momento <b>acceder</b> a tus datos, <b>rectificarlos</b>, <b>suprimirlos</b>, <b>oponerte</b> o <b>limitar</b> su tratamiento, pedir su <b>portabilidad</b> y <b>retirar tu consentimiento</b>, escribiendo a <a className="text-teal-700 underline" href={`mailto:${R.email}`}>{R.email}</a> o a la dirección postal indicada. Te responderemos en el plazo máximo de un mes.</p>
        <p>Si consideras que no hemos tratado bien tus datos, puedes reclamar ante la <b>Agencia Española de Protección de Datos</b> (<a className="text-teal-700 underline" href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).</p>
      </Seccion>

      <Seccion titulo="8. Seguridad">
        <p>Aplicamos medidas técnicas y organizativas adecuadas: conexión cifrada (HTTPS), acceso del equipo solo con enlace de verificación enviado a su email corporativo, control de acceso a la base de datos y copias de seguridad del proveedor.</p>
      </Seccion>

      <Seccion titulo="9. Cookies y almacenamiento local">
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
