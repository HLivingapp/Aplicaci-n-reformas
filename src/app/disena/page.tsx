"use client";

import { RequiereRegistro } from "@/components/Registro";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CabeceraPublica } from "@/components/CabeceraPublica";
import { euros } from "@/lib/calc";
import type { Estimacion } from "@/lib/estimacion";
import { fotoSinUbicacion } from "@/lib/foto-segura";
import { reformaVacia, viviendaVacia } from "@/lib/proyecto";
import { pedirEstimacion } from "@/lib/publico-cliente";
import type { NivelMaterial } from "@/lib/types";

type Estancia = "bano" | "cocina";
const NIVELES: { nivel: NivelMaterial; calidad: "basica" | "media" | "alta"; texto: string; detalle: string }[] = [
  { nivel: "basico", calidad: "basica", texto: "Básico", detalle: "Buenos materiales a buen precio" },
  { nivel: "medio", calidad: "media", texto: "Medio", detalle: "Lo más elegido: calidad y diseño" },
  { nivel: "premium", calidad: "alta", texto: "Premium", detalle: "Materiales y marcas de gama alta" },
];
const GRUPOS: Record<Estancia, string[]> = { bano: ["revest_bano", "equip_bano"], cocina: ["cocina", "electrodomesticos", "revest_cocina"] };

/**
 * Diseña tu baño o cocina desde una foto: eliges el nivel y ves los materiales del catálogo y el precio.
 * La foto se queda en tu navegador (no se sube) y se le quita la ubicación.
 */
function DisenaContenido() {
  const [estancia, setEstancia] = useState<Estancia>("bano");
  const [nivel, setNivel] = useState<NivelMaterial>("medio");
  const [m2, setM2] = useState(80);
  const [foto, setFoto] = useState<string>();
  const [e, setE] = useState<Estimacion | null>(null);

  useEffect(() => {
    const n = NIVELES.find((x) => x.nivel === nivel)!;
    const v = { ...viviendaVacia(), m2, dormitorios: 2, banos: 1 };
    const r = reformaVacia(2, 1);
    Object.assign(r, {
      alcance: "parcial",
      estancias: [estancia === "bano" ? "Baños" : "Cocina"],
      calidad: n.calidad,
      sueloDeseado: "mantener",
      cambiarVentanas: false,
      fontaneria: { accion: "cambiar", ano: null },
      electricidad: { accion: "mantener", ano: null },
    });
    let vivo = true;
    pedirEstimacion(v, r).then((x) => vivo && setE(x)).catch(() => vivo && setE(null));
    return () => {
      vivo = false;
    };
  }, [estancia, nivel, m2]);

  const elegidos = (e?.materiales ?? []).filter((g) => GRUPOS[estancia].includes(g.grupo)).map((g) => ({ g, op: g.opciones.find((o) => o.nivel === nivel) ?? g.opciones.find((o) => o.id === g.elegida)! }));
  const equipos = (e?.lineas ?? []).filter((l) => l.especificacion && GRUPOS[estancia].includes(l.grupoMaterial ?? ""));
  const conIva = (n: number) => n * 1.1;

  return (
    <div className="min-h-dvh bg-stone-50">
      <CabeceraPublica />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Diseña tu {estancia === "bano" ? "baño" : "cocina"} desde una foto</h1>
        <p className="mt-2 max-w-2xl text-stone-600">Sube una foto de cómo está ahora, elige el nivel de acabados y te enseñamos los materiales de nuestro catálogo y lo que cuesta, con las medidas estándar de tu vivienda.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section className="space-y-4">
            <div className="flex gap-2">
              {(["bano", "cocina"] as Estancia[]).map((x) => (
                <button key={x} onClick={() => setEstancia(x)} className={`rounded-full px-4 py-2 text-sm ${estancia === x ? "bg-stone-900 text-white" : "bg-white ring-1 ring-stone-200"}`}>{x === "bano" ? "🛁 Baño" : "🍳 Cocina"}</button>
              ))}
            </div>

            <label className="relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-white">
              {foto ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto} alt="Tu estancia" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">Cambiar foto</span>
                </>
              ) : (
                <span className="p-6 text-center text-sm text-stone-500">📷 Sube una foto de tu {estancia === "bano" ? "baño" : "cocina"}<br /><span className="text-xs">Solo interiores. La foto se queda en tu móvil u ordenador y le quitamos la ubicación.</span></span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={async (ev) => { const f = ev.target.files?.[0]; if (f) setFoto(await fotoSinUbicacion(f)); }} />
            </label>

            <div className="grid grid-cols-3 gap-2">
              {NIVELES.map((n) => (
                <button key={n.nivel} onClick={() => setNivel(n.nivel)} className={`rounded-2xl border bg-white p-3 text-left ${nivel === n.nivel ? "border-teal-600 ring-2 ring-teal-100" : "border-stone-200"}`}>
                  <div className="font-semibold">{n.texto}</div>
                  <div className="text-xs text-stone-500">{n.detalle}</div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <h2 className="font-semibold">Materiales para tu {estancia === "bano" ? "baño" : "cocina"}</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {elegidos.map(({ g, op }) => (
                  <li key={g.grupo}>
                    <div className="flex justify-between gap-2"><span className="font-medium">{g.nombre}: {op.nombre}</span><span className="text-stone-500">{euros(op.precio)}</span></div>
                    <div className="text-stone-600">{op.detalle}</div>
                  </li>
                ))}
                {equipos.map((l) => (
                  <li key={l.tarifaId} className="rounded-lg bg-stone-50 p-2 text-xs text-stone-600"><b>Referencia:</b> {l.especificacion}</li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl bg-stone-900 p-5 text-white">
              <div className="text-sm text-stone-300">Precio orientativo con obra y materiales</div>
              <div className="mt-1 text-3xl font-semibold">{e ? euros(conIva(e.base)) : "…"}</div>
              {e && <div className="text-xs text-stone-400">entre {euros(conIva(e.minimo))} y {euros(conIva(e.maximo))} · IVA 10 % incluido</div>}
              <label className="mt-4 block text-xs text-stone-300">
                m² de tu vivienda
                <input type="number" min={30} max={400} value={m2} onChange={(x) => setM2(Math.min(400, Math.max(30, Number(x.target.value) || 30)))} className="mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-white" />
              </label>
              <p className="mt-2 text-xs text-stone-400">Incluye demolición, fontanería, alicatado y montaje, con las medidas estándar de {estancia === "bano" ? "un baño" : "una cocina"} en un piso de {m2} m².</p>
            </div>
            <Link href="/nuevo" className="block rounded-xl bg-teal-700 py-3 text-center font-semibold text-white hover:bg-teal-800">Calcular mi reforma completa</Link>
            <Link href="/red" className="block rounded-xl border border-stone-300 bg-white py-3 text-center text-sm font-medium hover:bg-stone-50">Pedir presupuesto a reformistas homologados</Link>
            <p className="text-center text-xs text-stone-400">Muy pronto: verás tu foto con los acabados elegidos.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function Disena() {
  return (
    <RequiereRegistro motivo="Únete gratis para diseñar tu baño o tu cocina. Solo te pedimos tu email.">
      <DisenaContenido />
    </RequiereRegistro>
  );
}
