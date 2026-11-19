import { ACS, CALIDADES, CLIMAS, SUELOS, TECHOS, textoDe, textoDireccion, textoPlanta } from "@/lib/proyecto";
import type { Instalacion } from "@/lib/types";

const inst = (i: Instalacion) => (i.accion === "cambiar" ? "Cambiar entera" : `Mantener${i.ano ? ` (de ${i.ano})` : ""}`);
import type { DatosReforma, Vivienda } from "@/lib/types";

export function Resumen({ v, r }: { v: Vivienda; r: DatosReforma }) {
  const filas: [string, string][] = [
    ["Dirección", textoDireccion(v.direccion)],
    ["Referencia catastral", v.catastro?.referencia ?? "Pendiente de revisar"],
    ["Superficie", v.m2 ? `${v.m2} m² construidos` : "—"],
    ["Año del edificio", v.anoConstruccion ? String(v.anoConstruccion) : "—"],
    ["Tipo", { piso: "Piso", atico: "Ático", bajo: "Bajo", casa: "Casa / chalet" }[v.tipo]],
    ...(v.tipo !== "casa" ? ([["Planta", textoPlanta(v.planta)], ["Ascensor", v.ascensor == null ? "—" : v.ascensor ? "Sí" : "No"]] as [string, string][]) : []),
    ["Terrazas", v.terrazas.length ? v.terrazas.map((t) => t).join(", ") : "Ninguna"],
    ["Dormitorios", `${v.dormitorios} ahora → ${r.dormitoriosDeseados} deseados`],
    ["Baños", `${v.banos} ahora → ${r.banosDeseados} deseados`],
    ["Cocina", `${v.cocinaAbierta ? "Abierta" : "Independiente"}${r.moverCocina ? ", cambiar de sitio" : ", mismo sitio"}`],
    ["Techos", textoDe(TECHOS, r.techoActual)],
    ["Suelo actual → deseado", `${textoDe(SUELOS, r.sueloActual)} → ${r.sueloDeseado === "mantener" ? "mantener" : r.sueloDeseado}`],
    ["Ventanas", r.cambiarVentanas == null ? "—" : r.cambiarVentanas ? "Cambiar" : "Mantener"],
    ["Climatización", `${textoDe(CLIMAS, r.climaActual)} → ${textoDe(CLIMAS, r.climaDeseado)}`],
    ["Agua caliente", `${textoDe(ACS, r.acsActual)} → ${textoDe(ACS, r.acsDeseado)}`],
    ["Fontanería", inst(r.fontaneria)],
    ["Electricidad", inst(r.electricidad)],
    ["Reforma", r.alcance === "integral" ? "Integral" : "Parcial"],
    ["Trabajos", r.estancias.join(", ") || "—"],
    ["Acabados", CALIDADES.find((x) => x.valor === r.calidad)?.texto ?? "—"],
    ["Presupuesto aproximado", r.presupuestoCliente || "—"],
    ["Inicio deseado", r.cuando || "—"],
    ["Vivirá en la casa durante la obra", r.viviraEnObra == null ? "—" : r.viviraEnObra ? "Sí" : "No"],
  ];
  return (
    <dl className="divide-y divide-stone-100 text-sm">
      {filas.map(([k, val]) => (
        <div key={k} className="flex justify-between gap-4 py-1.5">
          <dt className="text-stone-500">{k}</dt>
          <dd className="text-right">{val}</dd>
        </div>
      ))}
      {r.comentarios && (
        <div className="py-1.5">
          <dt className="text-stone-500">Comentarios</dt>
          <dd className="mt-1 whitespace-pre-wrap">{r.comentarios}</dd>
        </div>
      )}
    </dl>
  );
}
