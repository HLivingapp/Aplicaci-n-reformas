"use client";

import { publico } from "@/lib/base";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { crearObraEjemplo, type Parte } from "@/lib/intranet";
import { APP } from "@/lib/marca";

/** Presentación de la intranet de obra y acceso a una obra de ejemplo (demostración). */
export default function ObraEjemplo() {
  const abrir = (parte: Parte) => {
    const ruta = crearObraEjemplo(parte);
    // Navegación completa: en la versión estática la ruta privada se resuelve al cargar
    if (ruta) window.location.href = publico(ruta);
  };
  return (
    <>
      <CabeceraPublica />
      <main className="mx-auto max-w-2xl space-y-5 px-4 pb-16 pt-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">{APP.nombre} · Intranet de obra</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Tu obra, al día y en un solo sitio</h1>
          <p className="mt-2 text-stone-600">
            Cuando firmas con tu reformista en la app, se abre un espacio privado para vuestra obra: el contrato firmado, cada fase con sus fotos, certificados y comentarios, y los pagos registrados por los dos.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            ["✍️ Contrato", "Se firma aquí mismo, cada parte desde su enlace."],
            ["🧱 Fases", "El reformista las abre y las cierra; tú las validas o pides un repaso."],
            ["📷 Fotos y certificados", "Boletín eléctrico, garantías, residuos… todo guardado por fase."],
            ["💶 Pagos", "Se pagan fuera de la app. Aquí quedan pedidos, pagados y cobrados."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="font-semibold">{t}</div>
              <div className="mt-1 text-sm text-stone-600">{d}</div>
            </li>
          ))}
        </ul>
        <div className="rounded-2xl border border-teal-600 bg-white p-4">
          <div className="font-semibold">Prueba una obra de ejemplo</div>
          <p className="mt-1 text-sm text-stone-600">Datos ficticios. Abre las dos vistas en pestañas distintas para ver cómo lo que hace uno le llega al otro.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => abrir("cliente")} className="rounded-xl bg-teal-700 px-4 py-2.5 font-semibold text-white hover:bg-teal-800">Entrar como cliente</button>
            <button onClick={() => abrir("reformista")} className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 font-semibold">Entrar como reformista</button>
          </div>
        </div>
        <p className="text-xs text-stone-500">Sin contraseñas: cada parte entra con su enlace privado. Solo el cliente y su reformista ven la obra. Datos en la Unión Europea, según el RGPD.</p>
      </main>
    </>
  );
}
