"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chips } from "@/components/Chips";
import { Boton, Campo, inputCls, Tarjeta } from "@/components/ui";
import { publico } from "@/lib/base";
import { BENEFICIOS_PROFESIONAL } from "@/lib/beneficios";
import { TEXTO_RESERVA } from "@/lib/comercializacion";
import { altaEstudio, SERVICIOS, TEXTO_COMPROMISO_ESTUDIO, type TarifaEstudio } from "@/lib/estudios";
import { ZONAS } from "@/lib/proveedores";

const OPCIONES_ZONA = ZONAS.map((z) => ({ valor: z, texto: z.replace("Madrid - ", "") }));

/** Alta de estudios de arquitectura y arquitectos autónomos. */
export default function AltaArquitectos() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"estudio" | "autonomo">("estudio");
  const [nombre, setNombre] = useState("");
  const [colegio, setColegio] = useState("COAM");
  const [numero, setNumero] = useState("");
  const [seguro, setSeguro] = useState("");
  const [zonas, setZonas] = useState<string[]>([]);
  const [servicios, setServicios] = useState<string[]>([]);
  const [presentacion, setPresentacion] = useState("");
  const [declaro, setDeclaro] = useState(false);
  const faltan = [
    !nombre.trim() && "nombre",
    !numero.trim() && "número de colegiado",
    !seguro.trim() && "seguro de responsabilidad civil profesional",
    !zonas.length && "zonas",
    !servicios.length && "servicios",
    !declaro && "aceptar la declaración y el compromiso",
  ].filter(Boolean) as string[];

  const enviar = () => {
    const tarifa: TarifaEstudio = {};
    for (const s of servicios) tarifa[s as keyof TarifaEstudio] = { fijo: 0, porM2: 0 };
    const id = altaEstudio({ tipo, nombre, colegio, numeroColegiado: numero, seguroRC: seguro, zonas, presentacion, tarifa, declaracion: TEXTO_COMPROMISO_ESTUDIO });
    router.push(`/arquitectos/demo?e=${id}&nuevo=1`);
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pb-16 pt-6">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={publico("/icon.svg")} alt="" className="h-10 w-10" />
        <div>
          <Link href="/" className="text-xs text-stone-500 hover:underline">← Inicio</Link>
          <h1 className="text-xl font-semibold">Estudios de arquitectura y arquitectos</h1>
        </div>
      </div>
      <p className="text-sm text-stone-600">
        Recibe encargos de clientes que ya están reformando su casa: proyectos de reforma, licencias, declaraciones responsables, legalizaciones, dirección de obra y certificados. Cargas tus precios una vez y la app te los calcula para cada vivienda.
      </p>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        {[
          ["💶", "Solo pagas si firmas", `Sin cuotas por contacto. El fee es la reserva que paga el cliente al firmar en la app (${TEXTO_RESERVA}) y se descuenta de tus honorarios.`],
          ["📐", "Encargos con la vivienda definida", "Llegan con m², distribución, presupuesto de obra y lo que el cliente quiere hacer."],
          ...BENEFICIOS_PROFESIONAL.filter((b) => b.t.startsWith("Menos impagos") || b.t.startsWith("Financiación") || b.t.startsWith("Memoria")).map((b) => [b.i, b.t, b.d]),
        ].map(([i, t, d]) => (
          <div key={t} className="rounded-xl bg-indigo-50 p-3"><div className="font-semibold">{i} {t}</div><div className="mt-1 text-stone-600">{d}</div></div>
        ))}
      </div>

      <Tarjeta className="space-y-3">
        <h2 className="font-semibold">Tus datos</h2>
        <div className="flex gap-2">
          {(["estudio", "autonomo"] as const).map((x) => (
            <button key={x} onClick={() => setTipo(x)} className={`rounded-full px-3 py-1.5 text-sm ${tipo === x ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>{x === "estudio" ? "Estudio de arquitectura" : "Arquitecto/a autónomo"}</button>
          ))}
        </div>
        <Campo etiqueta={tipo === "estudio" ? "Nombre del estudio *" : "Nombre y apellidos *"}><input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} /></Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Colegio profesional"><input className={inputCls} value={colegio} onChange={(e) => setColegio(e.target.value)} /></Campo>
          <Campo etiqueta="Número de colegiado *"><input className={inputCls} value={numero} onChange={(e) => setNumero(e.target.value)} /></Campo>
        </div>
        <Campo etiqueta="Seguro de responsabilidad civil profesional (aseguradora) *"><input className={inputCls} value={seguro} onChange={(e) => setSeguro(e.target.value)} /></Campo>
        <Campo etiqueta="Servicios que ofreces *"><Chips opciones={SERVICIOS.map((s) => ({ valor: s.id, texto: s.texto }))} valores={servicios} cambiar={setServicios} /></Campo>
        <Campo etiqueta="Zonas *"><Chips opciones={OPCIONES_ZONA} valores={zonas} cambiar={setZonas} /></Campo>
        <Campo etiqueta="Presentación (la verán los clientes, sin tu nombre)"><textarea rows={3} className={inputCls} value={presentacion} onChange={(e) => setPresentacion(e.target.value)} /></Campo>
      </Tarjeta>

      <Tarjeta className="space-y-3 border-teal-200">
        <h2 className="font-semibold">Declaración y compromiso de encargos</h2>
        <p className="text-sm text-stone-700">Declaro que estoy colegiado/a y habilitado/a para firmar los trabajos que ofrezco, y que tengo en vigor un seguro de responsabilidad civil profesional. Aportaré el certificado de colegiación y la póliza cuando se me pidan.</p>
        <p className="text-sm text-stone-700"><b>Encargos que llegan por la app.</b> {TEXTO_COMPROMISO_ESTUDIO}</p>
        <p className="text-xs text-stone-400">Texto pendiente de revisión legal.</p>
        <label className="flex items-start gap-2 text-sm font-medium">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal-700" checked={declaro} onChange={(e) => setDeclaro(e.target.checked)} />
          <span>Lo declaro y acepto estas condiciones</span>
        </label>
      </Tarjeta>

      {faltan.length > 0 && <p className="text-sm text-stone-500">Falta: {faltan.join(", ")}.</p>}
      <Boton onClick={enviar} disabled={faltan.length > 0} className="w-full">Darme de alta y poner mis precios</Boton>
      <p className="text-center text-xs text-stone-500">Demostración: el alta se guarda en este navegador. <Link href="/arquitectos/demo" className="underline">Ver el área de un estudio de ejemplo</Link></p>
    </main>
  );
}
