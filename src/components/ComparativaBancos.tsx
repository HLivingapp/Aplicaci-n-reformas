"use client";

import { useMemo, useState } from "react";
import { BANCOS_REFORMA, type DetalleProducto, type ProductoBanco } from "@/lib/beneficios";
import { miles } from "@/lib/comercializacion";

type Orden = "importe" | "plazo" | "tipo" | "entidad";
const ORDENES: { id: Orden; texto: string }[] = [
  { id: "importe", texto: "Importe máx." },
  { id: "plazo", texto: "Plazo máx." },
  { id: "tipo", texto: "Tipo" },
  { id: "entidad", texto: "Entidad" },
];
const TIPOS = ["Todos", "Préstamo personal", "Préstamo hipotecario"] as const;

const plazoTexto = (m?: number | null) => (m == null ? "—" : m % 12 === 0 ? `${m / 12} años` : `${m} meses`);
const importeTexto = (b: ProductoBanco) => (b.importeMax == null ? (b.pctTasacion ? `${b.pctTasacion} % tasación` : "—") : `${miles(b.importeMax)} €`);

/** «Reforma en tu hipoteca»: productos de financiación de reformas de cada entidad, ordenables. */
export function ComparativaBancos() {
  const [orden, setOrden] = useState<Orden>("importe");
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Todos");
  const lista = useMemo(() => {
    const l = BANCOS_REFORMA.filter((b) => tipo === "Todos" || b.tipo === tipo);
    const num = (n?: number | null) => n ?? -1;
    return [...l].sort((a, b) =>
      orden === "importe" ? num(b.importeMax) - num(a.importeMax) || num(b.pctTasacion) - num(a.pctTasacion)
      : orden === "plazo" ? num(b.plazoMeses) - num(a.plazoMeses)
      : orden === "tipo" ? a.tipo.localeCompare(b.tipo) || a.banco.localeCompare(b.banco)
      : a.banco.localeCompare(b.banco),
    );
  }, [orden, tipo]);
  return (
    <div id="bancos-reforma" className="mt-4">
      <div className="font-medium">Bancos con financiación para reformas ({BANCOS_REFORMA.length})</div>
      <ul className="mt-2 grid grid-cols-5 gap-1.5" aria-label="Entidades comparadas">
        {BANCOS_REFORMA.map((b) => (
          <li key={b.banco} className="flex h-10 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-stone-200" title={b.banco}>
            <LogoBanco b={b} className="max-h-full max-w-full object-contain" />
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-stone-500">Ordenar:</span>
        {ORDENES.map((o) => (
          <button key={o.id} onClick={() => setOrden(o.id)} aria-pressed={orden === o.id} className={`rounded-full px-2.5 py-1 ${orden === o.id ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>{o.texto}</button>
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-stone-500">Ver:</span>
        {TIPOS.map((t) => (
          <button key={t} onClick={() => setTipo(t)} aria-pressed={tipo === t} className={`rounded-full px-2.5 py-1 ${tipo === t ? "bg-teal-700 text-white" : "bg-white ring-1 ring-stone-200"}`}>{t}</button>
        ))}
      </div>
      <ul className="mt-2 space-y-2">
        {lista.map((b) => (
          <li key={b.banco + b.producto} className="rounded-xl bg-white p-3 ring-1 ring-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-24 shrink-0 items-center"><LogoBanco b={b} className="max-h-8 max-w-24 object-contain" /></span>
                <span className="font-semibold">{b.banco}</span>
              </span>
              <span className="text-xs text-stone-500">{b.producto}</span>
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-1 text-center text-xs">
              <div className="rounded-lg bg-stone-50 p-1.5"><dt className="text-stone-500">Hasta</dt><dd className="font-semibold">{importeTexto(b)}</dd></div>
              <div className="rounded-lg bg-stone-50 p-1.5"><dt className="text-stone-500">Plazo</dt><dd className="font-semibold">{plazoTexto(b.plazoMeses)}</dd></div>
              <div className="rounded-lg bg-stone-50 p-1.5"><dt className="text-stone-500">{b.tipo === "Préstamo hipotecario" ? "Hipoteca" : "Personal"}</dt><dd className="font-semibold">{b.interes ? `tipo ${b.interes}` : "—"}</dd></div>
            </dl>
            <p className="mt-2 text-stone-600">{b.resumen}</p>
            {b.detalle && <Detalle b={b} />}
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-teal-700 underline">Ver en la web de {b.banco}</a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-stone-500">
        Resumen orientativo de la información pública de cada entidad, consultada el 21/11/2026. «—» significa que la web no lo indica. Las condiciones, el tipo de interés y la concesión los decide cada entidad. La app todavía no tiene acuerdo con estas entidades. Los logotipos son marcas de sus respectivos titulares y se muestran solo para identificar cada entidad.
      </p>
    </div>
  );
}

const FILAS: [keyof DetalleProducto, string][] = [
  ["paraQue", "Para qué sirve"],
  ["paraQuien", "Quién puede pedirlo"],
  ["importe", "Importe"],
  ["plazo", "Plazo"],
  ["tin", "TIN"],
  ["tae", "TAE"],
  ["ejemplo", "Ejemplo publicado"],
  ["comisiones", "Comisiones"],
  ["vinculaciones", "Bonificaciones y vinculación"],
  ["documentacion", "Documentación"],
  ["comoSeContrata", "Cómo se contrata"],
];

function Detalle({ b }: { b: ProductoBanco }) {
  const d = b.detalle!;
  return (
    <details className="group mt-2 rounded-lg bg-stone-50 p-2 text-xs">
      <summary className="cursor-pointer font-medium text-teal-800">Ver detalles del producto</summary>
      <dl className="mt-2 space-y-1.5">
        {FILAS.filter(([k]) => d[k]).map(([k, t]) => (
          <div key={k}>
            <dt className="font-semibold text-stone-700">{t}</dt>
            <dd className="text-stone-600">{d[k]}</dd>
          </div>
        ))}
      </dl>
      {(d.tin || d.tae) && <p className="mt-2 text-stone-400">Tipos publicados por {b.banco} el 21/11/2026; pueden cambiar y dependen de tu perfil.</p>}
    </details>
  );
}

function LogoBanco({ b, className }: { b: ProductoBanco; className: string }) {
  if (!b.logo) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={b.logo} alt={`Logotipo de ${b.banco}`} loading="lazy" referrerPolicy="no-referrer" className={className} />;
}
